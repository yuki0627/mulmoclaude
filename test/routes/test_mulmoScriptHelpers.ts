import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Response } from "express";
import { withStoryContext } from "../../server/routes/mulmo-script.js";

interface RecordedResponse {
  statusCode: number;
  body: unknown;
  status(code: number): RecordedResponse;
  json(payload: unknown): RecordedResponse;
}

function makeRes(): RecordedResponse {
  const rec: RecordedResponse = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return rec;
}

// A minimal stand-in for the mulmo studio context. `withStoryContext`
// treats it as an opaque value — it only checks truthiness and passes
// the reference to the handler.
const fakeContext = { studio: { script: {} } } as unknown as NonNullable<
  Parameters<Parameters<typeof withStoryContext>[3]>[0]["context"]
>;

describe("withStoryContext — resolver rejects filePath", () => {
  it("short-circuits without calling buildContext or handler", async () => {
    const res = makeRes();
    let buildCalled = false;
    let handlerCalled = false;
    await withStoryContext(
      res as unknown as Response,
      "bad",
      {},
      async () => {
        handlerCalled = true;
      },
      {
        resolveStoryPath: (_fp, r) => {
          (r as unknown as RecordedResponse).status(400).json({ error: "bad" });
          return null;
        },
        buildContext: async () => {
          buildCalled = true;
          return fakeContext;
        },
      },
    );
    assert.equal(handlerCalled, false);
    assert.equal(buildCalled, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: "bad" });
  });
});

describe("withStoryContext — buildContext returns null", () => {
  it("writes 500 with the standard mulmo-context error", async () => {
    const res = makeRes();
    let handlerCalled = false;
    await withStoryContext(
      res as unknown as Response,
      "stories/x.json",
      {},
      async () => {
        handlerCalled = true;
      },
      {
        resolveStoryPath: () => "/abs/stories/x.json",
        buildContext: async () => undefined,
      },
    );
    assert.equal(handlerCalled, false);
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, {
      error: "Failed to initialize mulmo context",
    });
  });
});

describe("withStoryContext — handler throws", () => {
  it("catches the error and emits 500 with errorMessage", async () => {
    const res = makeRes();
    await withStoryContext(
      res as unknown as Response,
      "stories/x.json",
      {},
      async () => {
        throw new Error("boom");
      },
      {
        resolveStoryPath: () => "/abs/stories/x.json",
        buildContext: async () => fakeContext,
      },
    );
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { error: "boom" });
  });

  it("handles a non-Error thrown value", async () => {
    const res = makeRes();
    await withStoryContext(
      res as unknown as Response,
      "stories/x.json",
      {},
      async () => {
        throw "plain string";
      },
      {
        resolveStoryPath: () => "/abs/stories/x.json",
        buildContext: async () => fakeContext,
      },
    );
    assert.equal(res.statusCode, 500);
    const body = res.body as { error: string };
    assert.match(body.error, /plain string/);
  });
});

describe("withStoryContext — happy path", () => {
  it("invokes handler with absoluteFilePath and context, no response written", async () => {
    const res = makeRes();
    const received: { absoluteFilePath?: string; context?: unknown } = {};
    await withStoryContext(
      res as unknown as Response,
      "stories/x.json",
      {},
      async ({ absoluteFilePath, context }) => {
        received.absoluteFilePath = absoluteFilePath;
        received.context = context;
      },
      {
        resolveStoryPath: () => "/abs/stories/x.json",
        buildContext: async () => fakeContext,
      },
    );
    assert.equal(received.absoluteFilePath, "/abs/stories/x.json");
    assert.equal(received.context, fakeContext);
    // Handler is responsible for writing the response. The helper
    // itself should NOT have touched status/body on the happy path.
    assert.equal(res.statusCode, 200);
    assert.equal(res.body, undefined);
  });

  it("forwards the force option to buildContext", async () => {
    const res = makeRes();
    let seenForce: boolean | undefined;
    await withStoryContext(
      res as unknown as Response,
      "stories/x.json",
      { force: true },
      async () => {},
      {
        resolveStoryPath: () => "/abs/stories/x.json",
        buildContext: async (_fp, force) => {
          seenForce = force;
          return fakeContext;
        },
      },
    );
    assert.equal(seenForce, true);
  });

  it("defaults force to false when option is omitted", async () => {
    const res = makeRes();
    let seenForce: boolean | undefined;
    await withStoryContext(
      res as unknown as Response,
      "stories/x.json",
      {},
      async () => {},
      {
        resolveStoryPath: () => "/abs/stories/x.json",
        buildContext: async (_fp, force) => {
          seenForce = force;
          return fakeContext;
        },
      },
    );
    assert.equal(seenForce, false);
  });
});
