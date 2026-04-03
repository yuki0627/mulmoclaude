import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { workspacePath } from "../workspace.js";
import {
  getFileObject,
  initializeContextFromFiles,
  generateBeatImage,
  getBeatPngImagePath,
  images,
  audio,
  movie,
  movieFilePath,
  setGraphAILogger,
  addSessionProgressCallback,
  removeSessionProgressCallback,
  type MulmoScript,
} from "mulmocast";
import type { MulmoBeat } from "@mulmocast/types";

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

interface SaveMulmoScriptBody {
  script: MulmoScript;
  filename?: string;
}

interface RenderBeatBody {
  filePath: string;
  beatIndex: number;
  force?: boolean;
}

interface UpdateBeatBody {
  filePath: string;
  beatIndex: number;
  beat: MulmoBeat;
}

router.post(
  "/mulmo-script",
  (req: Request<object, object, SaveMulmoScriptBody>, res: Response) => {
    const { script, filename } = req.body;

    if (!script || !Array.isArray(script.beats)) {
      res.status(400).json({ error: "script with beats array is required" });
      return;
    }

    const storiesDir = path.join(workspacePath, "stories");
    fs.mkdirSync(storiesDir, { recursive: true });

    const title = script.title || "untitled";
    const slug = filename ? filename.replace(/\.json$/, "") : slugify(title);
    const fname = `${slug}-${Date.now()}.json`;
    const filePath = path.join(storiesDir, fname);

    fs.writeFileSync(filePath, JSON.stringify(script, null, 2));

    res.json({
      data: { script, filePath: `stories/${fname}` },
      message: `Saved MulmoScript to stories/${fname}`,
      instructions: "Display the storyboard to the user.",
    });
  },
);

router.post(
  "/mulmo-script/update-beat",
  (req: Request<object, object, UpdateBeatBody>, res: Response) => {
    const { filePath, beatIndex, beat } = req.body;

    if (!filePath || beatIndex === undefined || !beat) {
      res
        .status(400)
        .json({ error: "filePath, beatIndex, and beat are required" });
      return;
    }

    const storiesDir = path.resolve(workspacePath, "stories");
    const absoluteFilePath = path.resolve(workspacePath, filePath);
    if (!absoluteFilePath.startsWith(storiesDir + path.sep)) {
      res.status(400).json({ error: "Invalid filePath" });
      return;
    }
    if (!fs.existsSync(absoluteFilePath)) {
      res.status(404).json({ error: `File not found: ${filePath}` });
      return;
    }

    const script: MulmoScript = JSON.parse(
      fs.readFileSync(absoluteFilePath, "utf-8"),
    );

    if (!Array.isArray(script.beats) || beatIndex >= script.beats.length) {
      res.status(400).json({ error: "Invalid beatIndex" });
      return;
    }

    script.beats[beatIndex] = beat;
    fs.writeFileSync(absoluteFilePath, JSON.stringify(script, null, 2));

    res.json({ ok: true });
  },
);

router.get("/mulmo-script/beat-image", async (req: Request, res: Response) => {
  const filePath =
    typeof req.query.filePath === "string" ? req.query.filePath : undefined;
  const beatIndex =
    typeof req.query.beatIndex === "string"
      ? parseInt(req.query.beatIndex, 10)
      : undefined;

  if (!filePath || beatIndex === undefined || isNaN(beatIndex)) {
    res.status(400).json({ error: "filePath and beatIndex are required" });
    return;
  }

  const storiesDir = path.resolve(workspacePath, "stories");
  const absoluteFilePath = path.resolve(workspacePath, filePath);
  if (!absoluteFilePath.startsWith(storiesDir + path.sep)) {
    res.status(400).json({ error: "Invalid filePath" });
    return;
  }
  if (!fs.existsSync(absoluteFilePath)) {
    res.status(404).json({ error: `File not found: ${filePath}` });
    return;
  }

  try {
    setGraphAILogger(false);

    const files = getFileObject({
      file: absoluteFilePath,
      basedir: path.dirname(absoluteFilePath),
      grouped: true,
    });

    const context = await initializeContextFromFiles(files, true);
    if (!context) {
      res.status(500).json({ error: "Failed to initialize mulmo context" });
      return;
    }

    const { imagePath } = getBeatPngImagePath(context, beatIndex);

    if (!fs.existsSync(imagePath)) {
      res.json({ image: null });
      return;
    }

    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString("base64");
    res.json({ image: `data:image/png;base64,${base64}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

router.get(
  "/mulmo-script/movie-status",
  async (req: Request, res: Response) => {
    const filePath =
      typeof req.query.filePath === "string" ? req.query.filePath : undefined;

    if (!filePath) {
      res.status(400).json({ error: "filePath is required" });
      return;
    }

    const storiesDir = path.resolve(workspacePath, "stories");
    const absoluteFilePath = path.resolve(workspacePath, filePath);
    if (!absoluteFilePath.startsWith(storiesDir + path.sep)) {
      res.status(400).json({ error: "Invalid filePath" });
      return;
    }
    if (!fs.existsSync(absoluteFilePath)) {
      res.status(404).json({ error: `File not found: ${filePath}` });
      return;
    }

    try {
      setGraphAILogger(false);

      const files = getFileObject({
        file: absoluteFilePath,
        basedir: path.dirname(absoluteFilePath),
        grouped: true,
      });

      const context = await initializeContextFromFiles(files, true);
      if (!context) {
        res.json({ moviePath: null });
        return;
      }

      const outputPath = movieFilePath(context);
      if (!fs.existsSync(outputPath)) {
        res.json({ moviePath: null });
        return;
      }

      const movieMtime = fs.statSync(outputPath).mtimeMs;
      const sourceMtime = fs.statSync(absoluteFilePath).mtimeMs;
      if (movieMtime < sourceMtime) {
        res.json({ moviePath: null });
        return;
      }

      const relPath = path.relative(workspacePath, outputPath);
      res.json({ moviePath: relPath });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: message });
    }
  },
);

router.post(
  "/mulmo-script/render-beat",
  async (req: Request<object, object, RenderBeatBody>, res: Response) => {
    const { filePath, beatIndex, force } = req.body;

    if (!filePath || beatIndex === undefined) {
      res.status(400).json({ error: "filePath and beatIndex are required" });
      return;
    }

    const storiesDir = path.resolve(workspacePath, "stories");
    const absoluteFilePath = path.resolve(workspacePath, filePath);
    if (!absoluteFilePath.startsWith(storiesDir + path.sep)) {
      res.status(400).json({ error: "Invalid filePath" });
      return;
    }
    if (!fs.existsSync(absoluteFilePath)) {
      res.status(404).json({ error: `File not found: ${filePath}` });
      return;
    }

    try {
      setGraphAILogger(false);

      const files = getFileObject({
        file: absoluteFilePath,
        basedir: path.dirname(absoluteFilePath),
        grouped: true,
      });

      const context = await initializeContextFromFiles(files, true);
      if (!context) {
        res.status(500).json({ error: "Failed to initialize mulmo context" });
        return;
      }

      await generateBeatImage({
        index: beatIndex,
        context,
        args: force ? { forceImage: true } : undefined,
      });

      const { imagePath } = getBeatPngImagePath(context, beatIndex);

      if (!fs.existsSync(imagePath)) {
        res.status(500).json({ error: "Image was not generated" });
        return;
      }

      const imageData = fs.readFileSync(imagePath);
      const base64 = imageData.toString("base64");

      res.json({ image: `data:image/png;base64,${base64}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: message });
    }
  },
);

router.post(
  "/mulmo-script/generate-movie",
  async (req: Request<object, object, { filePath: string }>, res: Response) => {
    const { filePath } = req.body;

    if (!filePath) {
      res.status(400).json({ error: "filePath is required" });
      return;
    }

    const storiesDir = path.resolve(workspacePath, "stories");
    const absoluteFilePath = path.resolve(workspacePath, filePath);
    if (!absoluteFilePath.startsWith(storiesDir + path.sep)) {
      res.status(400).json({ error: "Invalid filePath" });
      return;
    }
    if (!fs.existsSync(absoluteFilePath)) {
      res.status(404).json({ error: `File not found: ${filePath}` });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const send = (data: unknown) =>
      res.write(`data: ${JSON.stringify(data)}\n\n`);

    try {
      setGraphAILogger(false);

      const files = getFileObject({
        file: absoluteFilePath,
        basedir: path.dirname(absoluteFilePath),
        grouped: true,
      });

      const context = await initializeContextFromFiles(files, true);
      if (!context) {
        send({ type: "error", message: "Failed to initialize mulmo context" });
        res.end();
        return;
      }

      // Build id → beatIndex map for the progress callback
      const idToIndex = new Map<string, number>();
      (context.studio.script.beats as MulmoBeat[]).forEach((beat, index) => {
        const key = beat.id ?? `__index__${index}`;
        idToIndex.set(key, index);
      });

      const onProgress = (event: {
        kind: string;
        sessionType: string;
        id?: string;
        inSession: boolean;
      }) => {
        if (
          event.kind === "beat" &&
          event.sessionType === "image" &&
          !event.inSession &&
          event.id !== undefined
        ) {
          const beatIndex = idToIndex.get(event.id);
          if (beatIndex !== undefined) {
            send({ type: "beat_image_done", beatIndex });
          }
        }
      };

      addSessionProgressCallback(onProgress);
      try {
        const imagesContext = await images(context);
        const audioContext = await audio(imagesContext);
        await movie(audioContext);

        const outputPath = movieFilePath(audioContext);
        if (!fs.existsSync(outputPath)) {
          send({ type: "error", message: "Movie was not generated" });
          res.end();
          return;
        }

        const relPath = path.relative(workspacePath, outputPath);
        send({ type: "done", moviePath: relPath });
      } finally {
        removeSessionProgressCallback(onProgress);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      send({ type: "error", message });
    } finally {
      res.end();
    }
  },
);

router.get("/mulmo-script/download-movie", (req: Request, res: Response) => {
  const moviePath =
    typeof req.query.moviePath === "string" ? req.query.moviePath : undefined;

  if (!moviePath) {
    res.status(400).json({ error: "moviePath is required" });
    return;
  }

  const storiesDir = path.resolve(workspacePath, "stories");
  const absolutePath = path.resolve(workspacePath, moviePath);
  if (!absolutePath.startsWith(storiesDir + path.sep)) {
    res.status(400).json({ error: "Invalid moviePath" });
    return;
  }
  if (!fs.existsSync(absolutePath)) {
    res.status(404).json({ error: "Movie file not found" });
    return;
  }

  res.download(absolutePath);
});

export default router;
