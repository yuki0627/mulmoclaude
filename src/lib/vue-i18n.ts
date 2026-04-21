// vue-i18n setup.
//
// Locale is picked at build-time from the `VITE_LOCALE` env var
// (falls back to "en"). Use `VITE_LOCALE=ja yarn dev` to switch.
// There's no runtime locale selector yet — follow-up work will add
// one if needed.
//
// `legacy: false` switches vue-i18n to the Composition API mode, so
// components call `const { t } = useI18n()` instead of relying on
// the Options API `this.$t`. CLAUDE.md mandates Composition API.

import { createI18n } from "vue-i18n";
import en from "../lang/en";
import ja from "../lang/ja";

const locale = import.meta.env.VITE_LOCALE ?? "en";

const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: "en",
  messages: { en, ja },
});

export default i18n;
