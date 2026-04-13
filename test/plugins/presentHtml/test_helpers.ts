import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { stripHtmlToPreview } from "../../../src/plugins/presentHtml/helpers.js";

describe("stripHtmlToPreview", () => {
  it("removes tags and keeps the inner text", () => {
    assert.equal(stripHtmlToPreview("<b>hello</b>", 60), "hello");
  });

  it("inserts a space where a tag sat between two text runs", () => {
    assert.equal(stripHtmlToPreview("hello<br>world", 60), "hello world");
  });

  it("collapses runs of whitespace into a single space", () => {
    assert.equal(stripHtmlToPreview("a    b\n\n\tc", 60), "a b c");
  });

  it("trims leading and trailing whitespace", () => {
    assert.equal(stripHtmlToPreview("   hello   ", 60), "hello");
  });

  it("trims away a leading or trailing tag cleanly", () => {
    assert.equal(
      stripHtmlToPreview("<p>hello</p>", 60),
      "hello",
      "leading+trailing tags should not leave stray spaces",
    );
  });

  it("collapses empty tag pairs to an empty string", () => {
    assert.equal(stripHtmlToPreview("<b></b>", 60), "");
  });

  it("truncates to the requested length", () => {
    const longText = "word ".repeat(100); // 500 chars
    assert.equal(stripHtmlToPreview(longText, 10).length, 10);
  });

  it("returns empty string for empty input", () => {
    assert.equal(stripHtmlToPreview("", 60), "");
  });

  it("returns empty string for all-whitespace input", () => {
    assert.equal(stripHtmlToPreview("   \n\t  ", 60), "");
  });

  it("returns empty string for a document with only tags", () => {
    assert.equal(stripHtmlToPreview("<div><span></span></div>", 60), "");
  });

  it("tolerates an unterminated tag at end of input", () => {
    // A malformed `<...` at the end has no closing `>`; the
    // walker stays in-tag for the rest of the input, which
    // effectively drops the trailing garbage rather than crashing.
    assert.equal(stripHtmlToPreview("hello<unterminated", 60), "hello");
  });

  it("handles tags with attributes containing whitespace", () => {
    assert.equal(
      stripHtmlToPreview('<a href="x" target="_blank">click</a> here', 60),
      "click here",
    );
  });

  it("does not expand entities (raw characters pass through)", () => {
    // Former regex didn't decode entities either — `&amp;` comes
    // out literal. Documented so future readers know the boundary.
    assert.equal(stripHtmlToPreview("a &amp; b", 60), "a &amp; b");
  });
});
