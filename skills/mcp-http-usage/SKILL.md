---
name: MCP stdio Usage
description: >
  This skill should be used when the user asks to "use the ping tool",
  "use the echo tool", "test the MCP connection", "how does stdio transport
  work", "explain the MCP example plugin", "how is the MCP integration
  structured", or "how does the server start".

  <example>
  User: "Test the ping tool"
  Claude: [calls ping tool, reports pong response]
  </example>

  <example>
  User: "How does the stdio transport in this plugin work?"
  Claude: [explains stdio transport, .mcp.json config, how Claude Code spawns the server automatically]
  </example>
version: 0.2.0
---

# MCP stdio Usage

This plugin uses stdio transport. Claude Code spawns `server/index.js` automatically as a child process via `npx ./server` — no manual server start required.

The connection flow:

1. Claude Code reads `.mcp.json` at session start
2. Spawns `npx --yes ./server` as a child process
3. Communicates with the server over stdin/stdout
4. Tools `ping` and `echo` become available

## Prerequisites

Install server dependencies once before use:

```bash
npm install --prefix server
```

## Verifying the Connection

Run `/mcp` in Claude Code to confirm `ping-example` appears and its tools are listed.

## Available Tools

### ping

Returns `{ status: "pong", timestamp: "<ISO 8601>" }` — use this to confirm the server is alive and the connection is healthy.

No parameters required.

Example response:
```json
{ "status": "pong", "timestamp": "2026-04-16T10:30:00.000Z" }
```

### echo

Returns `"Echo: <message>"` — use this to verify tool round-trips.

Parameter: `message` (string, required) — the text to echo back.

## How `.mcp.json` Is Configured

```json
{
  "ping-example": {
    "type": "stdio",
    "command": "npx",
    "args": ["--yes", "./server"]
  }
}
```

`npx ./server` resolves to the `mcp-example-server` bin entry in `server/package.json`. Claude Code manages the process lifecycle — the server starts with the session and stops when Claude Code exits.

| | stdio | Streamable HTTP |
|--|--|--|
| Startup | Automatic (Claude Code spawns it) | Manual (user starts server) |
| Lifecycle | Tied to Claude Code session | Persistent process |
| Connection | stdin/stdout pipe | HTTP POST/GET to URL |
| Best for | Local tools, single-session tools | Remote/shared servers |

## Troubleshooting

**`/mcp` shows error for `ping-example`**
Run `npm install --prefix server` to ensure dependencies are installed, then restart Claude Code.

**Tools not visible**
Restart Claude Code — MCP servers connect at session start.

## Additional Resources

- **`references/server-implementation.md`** — stdio transport pattern and tool registration details.
