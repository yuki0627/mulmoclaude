// Adapter that wires the pure scheduler library (server/utils/scheduler/)
// to the MulmoClaude runtime. Registers system tasks, runs catch-up on
// startup, and persists execution state + logs.
//
// Deliberately thin — all complex logic lives in the scheduler library.
// This file's job is I/O binding and MulmoClaude-specific plumbing.

import { existsSync } from "fs";
import { readFile, appendFile, mkdir } from "fs/promises";
import path from "path";
import { workspacePath } from "../workspace/workspace.js";
import { writeFileAtomic } from "../utils/files/atomic.js";
import { log } from "../system/logger/index.js";
import type { ITaskManager, TaskDefinition } from "./task-manager/index.js";
import {
  type TaskExecutionState,
  type TaskLogEntry,
  type CatchUpTask,
  emptyState,
  computeCatchUpPlan,
  nextWindowAfter,
  loadState,
  updateAndSave,
  appendLogEntry,
  queryLog,
  type StateMap,
  type StateDeps,
  type LogDeps,
} from "../utils/scheduler/index.js";

// ── Paths ────────────────────────────────────────────────────────

const SCHEDULER_CONFIG_DIR = "config/scheduler";
const SCHEDULER_DATA_DIR = "data/scheduler/logs";

function stateFilePath(root = workspacePath): string {
  return path.join(root, SCHEDULER_CONFIG_DIR, "state.json");
}

function logsDir(root = workspacePath): string {
  return path.join(root, SCHEDULER_DATA_DIR);
}

// ── I/O deps (real filesystem) ───────────────────────────────────

const stateDeps: StateDeps = {
  readFile: (p) => readFile(p, "utf-8"),
  writeFileAtomic: (p, content) => writeFileAtomic(p, content),
  exists: existsSync,
};

const logDeps: LogDeps = {
  appendFile: (p, content) => appendFile(p, content),
  readFile: (p) => readFile(p, "utf-8"),
  exists: existsSync,
  ensureDir: (p) => mkdir(p, { recursive: true }).then(() => {}),
};

// ── System task registry ─────────────────────────────────────────

export interface SystemTaskDef {
  id: string;
  name: string;
  description: string;
  schedule: TaskDefinition["schedule"];
  missedRunPolicy: "skip" | "run-once" | "run-all";
  run: () => Promise<void>;
}

// ── Public API ───────────────────────────────────────────────────

let stateMap: StateMap = new Map();
const systemTasks: SystemTaskDef[] = [];

/**
 * Initialize the scheduler adapter. Call once at server startup
 * AFTER the task-manager is created but BEFORE `taskManager.start()`.
 *
 * 1. Loads persisted state from disk
 * 2. Runs catch-up for any missed windows
 * 3. Registers system tasks with the task-manager
 */
export async function initScheduler(
  taskManager: ITaskManager,
  tasks: SystemTaskDef[],
): Promise<void> {
  // Ensure dirs exist
  await mkdir(path.dirname(stateFilePath()), { recursive: true });
  await mkdir(logsDir(), { recursive: true });

  // Load state
  stateMap = await loadState(stateFilePath(), stateDeps);
  systemTasks.length = 0;
  systemTasks.push(...tasks);

  // Run catch-up
  const catchUpTasks: CatchUpTask[] = tasks.map((t) => ({
    id: t.id,
    name: t.name,
    schedule: toCoreSchedule(t.schedule),
    missedRunPolicy: t.missedRunPolicy,
    enabled: true,
  }));
  const plan = computeCatchUpPlan(catchUpTasks, stateMap, Date.now());

  if (plan.skipped.length > 0) {
    for (const skip of plan.skipped) {
      log.info("scheduler", "catch-up skipped", {
        taskId: skip.taskId,
        windows: skip.windowCount,
      });
      // Advance lastRunAt so they don't re-fire
      await updateAndSave(
        stateFilePath(),
        stateMap,
        skip.taskId,
        { lastRunAt: skip.lastWindow },
        stateDeps,
      );
    }
  }

  if (plan.runs.length > 0) {
    log.info("scheduler", "catch-up enqueued", {
      runs: plan.runs.length,
    });
    for (const run of plan.runs) {
      const task = tasks.find((t) => t.id === run.taskId);
      if (!task) continue;
      // Fire-and-forget catch-up runs sequentially
      await executeAndLog(task, run.context.scheduledFor, "catch-up");
    }
  }

  // Register with task-manager for ongoing ticks
  for (const task of tasks) {
    taskManager.registerTask({
      id: task.id,
      description: task.description,
      schedule: task.schedule,
      run: async () => {
        await executeAndLog(task, new Date().toISOString(), "scheduled");
      },
    });
  }

  log.info("scheduler", "initialized", {
    tasks: tasks.map((t) => t.id),
    stateEntries: stateMap.size,
  });
}

/** Query execution logs — used by API routes. */
export async function getSchedulerLogs(opts: {
  since?: string;
  taskId?: string;
  limit?: number;
}): Promise<TaskLogEntry[]> {
  return queryLog(logsDir(), opts, logDeps);
}

/** Get all task states — used by API routes. */
export function getSchedulerTasks(): Array<{
  id: string;
  name: string;
  description: string;
  schedule: TaskDefinition["schedule"];
  missedRunPolicy: string;
  state: TaskExecutionState;
}> {
  return systemTasks.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    schedule: t.schedule,
    missedRunPolicy: t.missedRunPolicy,
    state: stateMap.get(t.id) ?? emptyState(t.id),
  }));
}

// ── Internal ─────────────────────────────────────────────────────

async function executeAndLog(
  task: SystemTaskDef,
  scheduledFor: string,
  trigger: "scheduled" | "catch-up" | "manual",
): Promise<void> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();
  try {
    await task.run();
    const durationMs = Date.now() - startMs;
    await updateAndSave(
      stateFilePath(),
      stateMap,
      task.id,
      {
        lastRunAt: scheduledFor,
        lastRunResult: "success",
        lastRunDurationMs: durationMs,
        lastErrorMessage: null,
        consecutiveFailures: 0,
        totalRuns: (stateMap.get(task.id)?.totalRuns ?? 0) + 1,
        nextScheduledAt: computeNextScheduled(task),
      },
      stateDeps,
    );
    await appendLogEntry(
      logsDir(),
      {
        taskId: task.id,
        taskName: task.name,
        scheduledFor,
        startedAt,
        completedAt: new Date().toISOString(),
        result: "success",
        durationMs,
        trigger,
      },
      logDeps,
    );
  } catch (err) {
    const durationMs = Date.now() - startMs;
    const errorMessage = err instanceof Error ? err.message : String(err);
    log.error("scheduler", "task failed", {
      taskId: task.id,
      error: errorMessage,
    });
    const currentState = stateMap.get(task.id);
    await updateAndSave(
      stateFilePath(),
      stateMap,
      task.id,
      {
        lastRunAt: scheduledFor,
        lastRunResult: "error",
        lastRunDurationMs: durationMs,
        lastErrorMessage: errorMessage,
        consecutiveFailures: (currentState?.consecutiveFailures ?? 0) + 1,
        totalRuns: (currentState?.totalRuns ?? 0) + 1,
        nextScheduledAt: computeNextScheduled(task),
      },
      stateDeps,
    );
    await appendLogEntry(
      logsDir(),
      {
        taskId: task.id,
        taskName: task.name,
        scheduledFor,
        startedAt,
        completedAt: new Date().toISOString(),
        result: "error",
        durationMs,
        trigger,
        errorMessage,
      },
      logDeps,
    );
  }
}

function computeNextScheduled(task: SystemTaskDef): string | null {
  const coreSchedule = toCoreSchedule(task.schedule);
  const next = nextWindowAfter(coreSchedule, Date.now() + 1);
  return next !== null ? new Date(next).toISOString() : null;
}

/** Convert task-manager schedule to scheduler-library schedule. */
function toCoreSchedule(
  schedule: TaskDefinition["schedule"],
): import("../utils/scheduler/types.js").TaskSchedule {
  if (schedule.type === "interval") {
    return {
      type: "interval",
      intervalSec: Math.round(schedule.intervalMs / 1000),
    };
  }
  return schedule;
}
