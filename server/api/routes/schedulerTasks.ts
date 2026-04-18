// API routes for the unified scheduler (#357).
//
//   GET /api/scheduler/tasks   — all registered tasks + state
//   GET /api/scheduler/logs    — execution log (newest first)
//
// Read-only for Phase 1. Phase 3 adds CRUD for user tasks.

import { Router, type Request, type Response } from "express";
import {
  getSchedulerTasks,
  getSchedulerLogs,
} from "../../events/scheduler-adapter.js";
import type { TaskLogEntry } from "../../utils/scheduler/types.js";

const router = Router();

router.get("/api/scheduler/tasks", (_req: Request, res: Response) => {
  res.json({ tasks: getSchedulerTasks() });
});

interface LogQuery {
  since?: string;
  taskId?: string;
  limit?: string;
}

router.get(
  "/api/scheduler/logs",
  async (
    req: Request<object, unknown, object, LogQuery>,
    res: Response<{ logs: TaskLogEntry[] }>,
  ) => {
    const limit =
      typeof req.query.limit === "string"
        ? parseInt(req.query.limit, 10)
        : undefined;
    const logs = await getSchedulerLogs({
      since: typeof req.query.since === "string" ? req.query.since : undefined,
      taskId:
        typeof req.query.taskId === "string" ? req.query.taskId : undefined,
      limit: Number.isFinite(limit) ? limit : undefined,
    });
    res.json({ logs });
  },
);

export default router;
