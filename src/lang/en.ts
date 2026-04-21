// English dictionary for vue-i18n.
//
// Structure is grouped by feature area (common, chat, session, ...).
// Prefer nested objects over flat keys so related strings stay
// together and the namespace serves as self-documentation.

const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
  },
} as const;

export default en;
