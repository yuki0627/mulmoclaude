import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractFirstH1 } from "../../../src/utils/markdown/extractFirstH1.js";

describe("extractFirstH1", () => {
  it("returns the text of the first H1", () => {
    assert.equal(extractFirstH1("# Hello"), "Hello");
  });

  it("returns null when there is no heading", () => {
    assert.equal(extractFirstH1("just text\nmore text"), null);
  });

  it("returns null for an empty string", () => {
    assert.equal(extractFirstH1(""), null);
  });

  it("skips H2 and deeper headings", () => {
    assert.equal(extractFirstH1("## Subheading\n### Deeper"), null);
  });

  it("picks the first H1 when multiple are present", () => {
    assert.equal(extractFirstH1("# First\n# Second"), "First");
  });

  it("skips intermediate non-H1 lines before finding the H1", () => {
    assert.equal(
      extractFirstH1("Intro paragraph\n## Section\n# Real Title\nbody"),
      "Real Title",
    );
  });

  it("trims surrounding whitespace from the heading text", () => {
    assert.equal(extractFirstH1("#   spaced heading   "), "spaced heading");
  });

  it("returns null for a bare `#` with no content", () => {
    assert.equal(extractFirstH1("#"), null);
  });

  it("returns null for `# ` with only whitespace after", () => {
    assert.equal(extractFirstH1("#   "), null);
  });

  it("does not match `#foo` without a separator", () => {
    assert.equal(extractFirstH1("#foo"), null);
  });

  it("handles CRLF line endings by trimming the trailing \\r", () => {
    // Split on `\n` leaves `\r` attached; `.trim()` removes it.
    assert.equal(extractFirstH1("# Title\r\nbody"), "Title");
  });
});
