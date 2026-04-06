import type { ToolPlugin } from "../../tools/types";
import toolDefinition, { TOOL_NAME } from "./definition";
import View from "./View.vue";
import Preview from "./Preview.vue";

export interface PresentHtmlData {
  html: string;
  title?: string;
  filePath: string;
}

const presentHtmlPlugin: ToolPlugin<PresentHtmlData> = {
  toolDefinition,

  async execute(_context, args) {
    try {
      const res = await fetch("/api/present-html", {
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
  generatingMessage: "Presenting HTML page…",
  viewComponent: View,
  previewComponent: Preview,
};

export default presentHtmlPlugin;
export { TOOL_NAME };
