import { Router, Request, Response } from "express";
import { executeMindMap } from "@gui-chat-plugin/mindmap";
import { executeSpreadsheet } from "../../src/plugins/spreadsheet/definition.js";
import { executeQuiz } from "@mulmochat-plugin/quiz";
import { executeForm } from "@mulmochat-plugin/form";
import { executeOpenCanvas } from "../../src/plugins/canvas/definition.js";
import { executePresent3D } from "@gui-chat-plugin/present3d";
import { showMusic } from "@gui-chat-plugin/music";
import { getGeminiClient, isGeminiAvailable } from "../utils/gemini.js";
import { errorMessage } from "../utils/errors.js";

const router = Router();

interface PluginErrorResponse {
  message: string;
}

// Wraps a plugin's `execute*` function in an Express handler. Each
// plugin route used to inline the same try/catch + 500 response shell;
// this collapses them to one line per route. The plugin function
// receives the request body and returns whatever the plugin's
// ToolResult shape is — typed as `T` so the response stays type-safe.
function wrapPluginExecute<T>(
  execute: (body: unknown) => Promise<T>,
): (req: Request, res: Response<T | PluginErrorResponse>) => Promise<void> {
  return async (req, res) => {
    try {
      const result = await execute(req.body);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: errorMessage(err) });
    }
  };
}

const IMAGE_PLACEHOLDER = /!\[([^\]]+)\]\(\/?__too_be_replaced_image_path__\)/g;

async function generateInlineImage(prompt: string): Promise<string | null> {
  if (!isGeminiAvailable()) return null;
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: [{ text: prompt }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { aspectRatio: "16:9" },
      },
    });
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch {
    // leave placeholder if generation fails
  }
  return null;
}

async function fillImagePlaceholders(markdown: string): Promise<string> {
  if (!isGeminiAvailable()) return markdown;
  const matches = [...markdown.matchAll(IMAGE_PLACEHOLDER)];
  if (matches.length === 0) return markdown;

  const results = await Promise.all(
    matches.map(async (m) => ({
      full: m[0],
      prompt: m[1],
      url: await generateInlineImage(m[1]),
    })),
  );

  let filled = markdown;
  for (const { full, prompt, url } of results) {
    if (url) filled = filled.replace(full, `![${prompt}](${url})`);
  }
  return filled;
}

// presentDocument — fills image placeholders via Gemini if API key is available
interface PresentDocumentBody {
  title: string;
  markdown: string;
  filenameHint?: string;
}

interface PresentDocumentResponse {
  message: string;
  title: string;
  data: { markdown: string; filenameHint?: string };
}

router.post(
  "/present-document",
  async (
    req: Request<object, unknown, PresentDocumentBody>,
    res: Response<PresentDocumentResponse>,
  ) => {
    const { title, markdown, filenameHint } = req.body;
    const filledMarkdown = await fillImagePlaceholders(markdown);
    res.json({
      message: `Document "${title}" is ready.`,
      title,
      data: { markdown: filledMarkdown, filenameHint },
    });
  },
);

// presentSpreadsheet — uses package execute for validation/processing
router.post("/present-spreadsheet", wrapPluginExecute(executeSpreadsheet));

// createMindMap — uses package execute for node layout computation
router.post(
  "/mindmap",
  wrapPluginExecute((body) => executeMindMap(null as never, body)),
);

// putQuestions — quiz
router.post(
  "/quiz",
  wrapPluginExecute((body) => executeQuiz(null as never, body)),
);

// presentForm — form
router.post(
  "/form",
  wrapPluginExecute((body) => executeForm(null as never, body)),
);

// openCanvas — drawing canvas
router.post(
  "/canvas",
  wrapPluginExecute(() => executeOpenCanvas()),
);

// present3d — 3D visualization
router.post(
  "/present3d",
  wrapPluginExecute((body) => executePresent3D(null as never, body)),
);

// showMusic — sheet music display
router.post(
  "/music",
  wrapPluginExecute((body) => showMusic(null as never, body)),
);

export default router;
