import type { ToolPlugin } from "../../tools/types";
import { toolDefinition, TOOL_NAME } from "./definition";
import View from "./View.vue";
import Preview from "./Preview.vue";

export interface CustomRole {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  availablePlugins: string[];
  queries?: string[];
}

export interface ManageRolesData {
  customRoles: CustomRole[];
}

const manageRolesPlugin: ToolPlugin = {
  toolDefinition: toolDefinition as unknown as ToolPlugin["toolDefinition"],
  viewComponent: View,
  previewComponent: Preview,
};

export default manageRolesPlugin;
export { TOOL_NAME };
