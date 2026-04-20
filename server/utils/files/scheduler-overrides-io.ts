// Domain I/O for scheduler override config.
//
// Reads/writes config/scheduler/overrides.json. Each key is a
// system task ID (e.g. "system:journal"), value overrides the
// default schedule.

import fs from "fs";
import path from "path";
import { workspacePath } from "../../workspace/paths.js";
import { WORKSPACE_FILES } from "../../../src/config/workspacePaths.js";
import { loadJsonFile } from "./json.js";
import { writeFileAtomicSync } from "./atomic.js";
import { log } from "../../system/logger/index.js";

export interface ScheduleOverride {
  /** Override interval in milliseconds (for interval-type schedules). */
  intervalMs?: number;
  /** Override time "HH:MM" in UTC (for daily-type schedules). */
  time?: string;
}

export type ScheduleOverrides = Record<string, ScheduleOverride>;

function overridesPath(root?: string): string {
  return path.join(root ?? workspacePath, WORKSPACE_FILES.schedulerOverrides);
}

/** Load schedule overrides. Returns empty object on missing/corrupt file. */
export function loadSchedulerOverrides(root?: string): ScheduleOverrides {
  const raw = loadJsonFile<unknown>(overridesPath(root), {});
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    log.warn("scheduler-overrides", "overrides.json is not an object");
    return {};
  }
  return raw as ScheduleOverrides;
}

/** Save schedule overrides atomically. Creates directory if needed. */
export function saveSchedulerOverrides(
  overrides: ScheduleOverrides,
  root?: string,
): void {
  const filePath = overridesPath(root);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileAtomicSync(filePath, JSON.stringify(overrides, null, 2));
}
