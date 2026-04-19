#!/usr/bin/env node
// @mulmobridge/google-chat — Google Chat bridge for MulmoClaude.
//
// Google Chat apps can receive events via HTTP endpoint (webhook).
// The bot responds synchronously or asynchronously via the Chat API.
//
// Required env vars:
//   GOOGLE_CHAT_PROJECT_NUMBER — Google Cloud project number (for token verification)
//
// Optional:
//   GOOGLE_CHAT_BRIDGE_PORT — Webhook port (default: 3005)
//   GOOGLE_CHAT_SERVICE_ACCOUNT_KEY — Path to service account JSON (for async replies)

import "dotenv/config";
import express, { type Request, type Response } from "express";
import { createBridgeClient } from "@mulmobridge/client";

const TRANSPORT_ID = "google-chat";
const PORT = Number(process.env.GOOGLE_CHAT_BRIDGE_PORT) || 3005;

const projectNumber = process.env.GOOGLE_CHAT_PROJECT_NUMBER;
if (!projectNumber) {
  console.error(
    "GOOGLE_CHAT_PROJECT_NUMBER is required.\n" +
      "See README for setup instructions.",
  );
  process.exit(1);
}

const mulmo = createBridgeClient({ transportId: TRANSPORT_ID });

mulmo.onPush((ev) => {
  // Async push requires Chat API with service account — not
  // available in synchronous webhook mode. Log for now.
  console.log(`[google-chat] push (not delivered): ${ev.chatId} ${ev.message}`);
});

// ── Webhook server ──────────────────────────────────────────────

const app = express();
app.disable("x-powered-by");
app.use(express.json());

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function extractEventType(body: unknown): string {
  if (!isObj(body) || typeof body.type !== "string") return "";
  return body.type;
}

interface ParsedMessage {
  spaceName: string;
  senderName: string;
  text: string;
}

function extractMessage(body: unknown): ParsedMessage | null {
  if (!isObj(body)) return null;
  const msg = body.message;
  if (!isObj(msg)) return null;
  if (typeof msg.text !== "string") return null;
  const space = msg.space;
  if (!isObj(space) || typeof space.name !== "string") return null;
  const sender = msg.sender;
  const senderName =
    isObj(sender) && typeof sender.displayName === "string"
      ? sender.displayName
      : "unknown";
  return { spaceName: space.name, senderName, text: msg.text };
}

app.post("/", async (req: Request, res: Response) => {
  const eventType = extractEventType(req.body);

  if (eventType === "ADDED_TO_SPACE") {
    res.json({ text: "Hello! I'm MulmoClaude. Send me a message." });
    return;
  }

  if (eventType !== "MESSAGE") {
    res.json({});
    return;
  }

  const parsed = extractMessage(req.body);
  if (!parsed || !parsed.text.trim()) {
    res.json({});
    return;
  }

  const { spaceName, senderName, text } = parsed;

  console.log(
    `[google-chat] message space=${spaceName} sender=${senderName} len=${text.length}`,
  );

  try {
    const ack = await mulmo.send(spaceName, text.trim());
    if (ack.ok) {
      res.json({ text: ack.reply ?? "(empty reply)" });
    } else {
      const status = ack.status ? ` (${ack.status})` : "";
      res.json({ text: `Error${status}: ${ack.error ?? "unknown"}` });
    }
  } catch (err) {
    console.error(`[google-chat] message handling failed: ${err}`);
    res.json({ text: "Sorry, an error occurred processing your message." });
  }
});

app.listen(PORT, () => {
  console.log("MulmoClaude Google Chat bridge");
  console.log(`Webhook listening on http://localhost:${PORT}/`);
  console.log("Configure your Google Chat app endpoint to: <public-url>/");
});
