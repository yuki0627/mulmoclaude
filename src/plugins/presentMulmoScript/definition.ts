import type { ToolDefinition } from "gui-chat-protocol";

export const TOOL_NAME = "presentMulmoScript";

const toolDefinition: ToolDefinition = {
  type: "function",
  name: TOOL_NAME,
  description: `Save and present a MulmoScript story or presentation as a visual storyboard in the canvas.

Always use Google providers. Required structure:

{
  "$mulmocast": { "version": "0.5" },
  "title": "The Life of a Star",
  "description": "A short educational explainer about stellar evolution",
  "lang": "en",
  "speechParams": {
    "speakers": {
      "Presenter": {
        "provider": "gemini",
        "voiceId": "Kore",
        "displayName": { "en": "Presenter" }
      }
    }
  },
  "imageParams": { "provider": "google", "model": "gemini-2.5-flash-image" },
  "movieParams": { "provider": "google", "model": "veo-2.0-generate-001" },
  "beats": [
    {
      "speaker": "Presenter",
      "text": "Narration spoken aloud for this beat.",
      "image": { "type": "imagePrompt", "prompt": "Detailed image description" }
    },
    {
      "speaker": "Presenter",
      "text": "Bullet point beat.",
      "image": { "type": "textSlide", "slide": { "title": "Slide Title", "bullets": ["Point one", "Point two"] } }
    },
    {
      "speaker": "Presenter",
      "text": "Markdown beat.",
      "image": { "type": "markdown", "markdown": "## Heading\\n\\nBody text here." }
    }
  ]
}

Beat image types:
- "markdown"    → markdown field (string)
- "textSlide"   → slide: { title, subtitle?, bullets? }
- "imagePrompt" → prompt field (string) — AI generates image
- "moviePrompt" → prompt field (string) — AI generates video clip
- "mermaid"     → title + code field
- "chart"       → title + chartData field`,
  parameters: {
    type: "object",
    properties: {
      script: {
        type: "object",
        description:
          "Complete MulmoScript JSON. Must include $mulmocast, speechParams, imageParams, movieParams, and beats array.",
        additionalProperties: true,
      },
      filename: {
        type: "string",
        description:
          "Optional filename without extension. Defaults to a slug of the script title.",
      },
    },
    required: ["script"],
  },
};

export default toolDefinition;
