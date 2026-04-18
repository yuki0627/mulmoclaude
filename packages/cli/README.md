# @mulmobridge/cli

Interactive CLI bridge for MulmoBridge. Talk to MulmoClaude from your terminal.

## Install

```bash
npm install -g @mulmobridge/cli
# or run directly
npx @mulmobridge/cli
```

## Usage

1. Start the MulmoClaude server (`yarn dev` in the main repo)
2. Run the CLI bridge:

```bash
mulmobridge-cli
```

The bridge reads the bearer token from `~/mulmoclaude/.session-token` (written by the server at startup) or from the `MULMOCLAUDE_AUTH_TOKEN` environment variable.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `MULMOCLAUDE_API_URL` | Server URL | `http://localhost:3001` |
| `MULMOCLAUDE_AUTH_TOKEN` | Bearer token override | reads from file |

## Ecosystem

Part of the `@mulmobridge/*` package family:

- **@mulmobridge/protocol** — shared types and constants
- **@mulmobridge/client** — socket.io client library
- **@mulmobridge/cli** — this package
- **@mulmobridge/telegram** — Telegram bot bridge
- **@mulmobridge/chat-service** — server-side chat service

## License

MIT
