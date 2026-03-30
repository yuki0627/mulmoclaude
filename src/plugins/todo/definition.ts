import type { ToolDefinition } from "gui-chat-protocol";

const toolDefinition: ToolDefinition = {
  type: "function",
  name: "manageTodoList",
  description:
    "Manage a todo list — show items, add, update, check/uncheck, or delete them. Use this whenever the user mentions tasks, todos, or things to remember.",
  parameters: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: [
          "show",
          "add",
          "delete",
          "update",
          "check",
          "uncheck",
          "clear_completed",
        ],
        description: "Action to perform on the todo list.",
      },
      text: {
        type: "string",
        description:
          "For 'add': the todo item text. For 'delete', 'update', 'check', 'uncheck': partial text to find the item.",
      },
      newText: {
        type: "string",
        description: "For 'update' only: the replacement text.",
      },
      note: {
        type: "string",
        description:
          "For 'add' or 'update': an optional note or extra detail for the item.",
      },
    },
    required: ["action"],
  },
};

export default toolDefinition;
