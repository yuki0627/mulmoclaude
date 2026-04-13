// Extract the first ATX-style H1 heading (`# title`) from a
// markdown string. Used by both:
//   - server/journal/index.ts (topic row labels)
//   - src/plugins/markdown/Preview.vue (document title)
//
// Implemented as a line walker rather than a regex so it avoids
// the backtracking risk that trips `sonarjs/slow-regex`.

/**
 * Return the trimmed text of the first H1 line, or null if none
 * exists. An H1 is a line starting with `# ` (hash + space);
 * `##` and deeper headings are skipped.
 */
export function extractFirstH1(markdown: string): string | null {
  for (const line of markdown.split("\n")) {
    if (!line.startsWith("# ")) continue;
    const text = line.slice(2).trim();
    if (text.length > 0) return text;
  }
  return null;
}
