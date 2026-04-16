# mcp-example-plugin

A Claude Code plugin demonstrating MCP server integration using **stdio transport** via npx.

## What's Included

| Component | Path | Purpose |
|-----------|------|---------|
| MCP config | `.mcp.json` | Tells Claude Code how to spawn the server |
| Node.js server | `server/index.js` | stdio MCP server with `ping` + `echo` tools |
| Skill | `skills/mcp-http-usage/` | Explains setup, tools, and transport concepts |

## Quick Start

**1. Install server dependencies:**

```bash
npm install --prefix server
```

**2. Open or restart Claude Code** — it will automatically spawn the server via `npx ./server`.

**3. Verify the connection:**
```
/mcp
```

The `ping-example` server should appear with two tools: `ping` and `echo`.

## Prerequisites

- Node.js 18+
- npm

## Server Tools

- **`ping`** — No parameters. Returns `{ status: "pong", timestamp: "..." }`.
- **`echo`** — Parameter: `message` (string). Returns `"Echo: <message>"`.

## How It Works

Claude Code reads `.mcp.json` and spawns the server as a child process:

```json
{
  "ping-example": {
    "type": "stdio",
    "command": "npx",
    "args": ["--yes", "./server"]
  }
}
```

`npx ./server` runs the `mcp-example-server` bin entry defined in `server/package.json`. The server communicates with Claude Code over stdin/stdout and is tied to the session lifetime — no manual start/stop needed.

## Author

Maciej Warchalowski — maciej.warchalowski@wellspring.com
