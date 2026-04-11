import type { ToolPlugin } from "../../tools/types";
import toolDefinition, { TOOL_NAME } from "./definition";
import type { MarkdownToolData } from "./definition";
import View from "./View.vue";
import Preview from "./Preview.vue";

export const SYSTEM_PROMPT = `Use the ${TOOL_NAME} tool to create structured documents with text and embedded images. This tool is ideal for:
- Guides, tutorials, and how-to content ("create a guide about...", "explain how to...")
- Educational content (lessons, explanations, timelines, concept visualizations)
- Reports and presentations (business reports, data analysis, infographics)
- Articles and blog posts with illustrations
- Documentation with diagrams or screenshots
- Recipes with step-by-step photos
- Travel guides with location images
- Product presentations or lookbooks
- Any content that combines written information with supporting visuals

IMPORTANT: Use this tool instead of just generating standalone images when the user wants informational or educational content with visuals. This creates a cohesive document with formatted text (markdown) AND images embedded at appropriate locations. For example, if asked to "create a guide about photosynthesis with a diagram", use ${TOOL_NAME} to create a full guide with explanatory text and the diagram embedded, rather than just generating the diagram image alone.

Format embedded images as: ![Detailed image prompt](__too_be_replaced_image_path__)`;

const markdownPlugin: ToolPlugin<MarkdownToolData> = {
  toolDefinition,

  async execute(_context, args) {
    try {
      const res = await fetch("/api/present-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        return {
          toolName: TOOL_NAME,
          uuid: crypto.randomUUID(),
          error: (err as { message?: string }).message ?? res.statusText,
        };
      }
      const result = await res.json();
      return {
        ...result,
        toolName: TOOL_NAME,
        uuid: crypto.randomUUID(),
      };
    } catch (error) {
      return {
        toolName: TOOL_NAME,
        uuid: crypto.randomUUID(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  isEnabled: () => true,
  generatingMessage: "Creating document...",
  systemPrompt: SYSTEM_PROMPT,
  viewComponent: View,
  previewComponent: Preview,
};

export default markdownPlugin;
export { TOOL_NAME };
