import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { workspacePath } from "../workspace.js";

const router = Router();

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "script"
  );
}

router.post("/mulmo-script", (req: Request, res: Response) => {
  const { script, filename } = req.body as {
    script: Record<string, unknown>;
    filename?: string;
  };

  if (!script || !Array.isArray(script.beats)) {
    res.status(400).json({ error: "script with beats array is required" });
    return;
  }

  const storiesDir = path.join(workspacePath, "stories");
  fs.mkdirSync(storiesDir, { recursive: true });

  const title = (script.title as string) || "untitled";
  const slug = filename ? filename.replace(/\.json$/, "") : slugify(title);
  const fname = `${slug}-${Date.now()}.json`;
  const filePath = path.join(storiesDir, fname);

  fs.writeFileSync(filePath, JSON.stringify(script, null, 2));

  res.json({
    data: { script, filePath: `stories/${fname}` },
    message: `Saved MulmoScript to stories/${fname}`,
    instructions: "Display the storyboard to the user.",
  });
});

export default router;
