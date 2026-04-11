import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { entryToExcerpt } from "../../server/journal/dailyPass.js";

describe("entryToExcerpt", () => {
  it("converts a text entry", () => {
    const out = entryToExcerpt({
      source: "user",
      type: "text",
      message: "hello",
    });
    assert.deepEqual(out, {
      source: "user",
      type: "text",
      content: "hello",
    });
  });

  it("truncates very long text messages", () => {
    const longMsg = "x".repeat(2000);
    const out = entryToExcerpt({
      source: "assistant",
      type: "text",
      message: longMsg,
    });
    assert.ok(out);
    assert.ok(out!.content.length < longMsg.length);
    assert.ok(out!.content.endsWith("…"));
  });

  it("converts a tool_result entry using toolName + title", () => {
    const out = entryToExcerpt({
      source: "tool",
      type: "tool_result",
      result: {
        toolName: "generateImage",
        title: "a sunset",
        message: "full message",
      },
    });
    assert.ok(out);
    assert.match(out!.content, /generateImage: a sunset/);
  });

  it("falls back to message when title is missing", () => {
    const out = entryToExcerpt({
      source: "tool",
      type: "tool_result",
      result: {
        toolName: "searchX",
        message: "got 10 results",
      },
    });
    assert.ok(out);
    assert.match(out!.content, /searchX: got 10 results/);
  });

  it("falls back to '(no message)' when both title and message are missing", () => {
    const out = entryToExcerpt({
      source: "tool",
      type: "tool_result",
      result: { toolName: "weird" },
    });
    assert.ok(out);
    assert.match(out!.content, /weird: \(no message\)/);
  });

  it("returns null for unrecognised entry types", () => {
    assert.equal(
      entryToExcerpt({ source: "user", type: "mystery", message: "x" }),
      null,
    );
  });

  it("returns null for text entries with no message", () => {
    assert.equal(entryToExcerpt({ source: "user", type: "text" }), null);
  });

  it("returns null for tool_result with non-object result", () => {
    assert.equal(
      entryToExcerpt({ source: "tool", type: "tool_result", result: "str" }),
      null,
    );
  });

  it("handles missing source/type by using 'unknown'", () => {
    const out = entryToExcerpt({ message: "hi", type: "text" });
    assert.ok(out);
    assert.equal(out!.source, "unknown");
  });
});
