# mcp-example-plugin

A Claude Code plugin demonstrating MCP server integration using **Streamable HTTP transport**.

## What's Included

| Component | Path | Purpose |
|-----------|------|---------|
| MCP config | `.mcp.json` | Connects Claude Code to the HTTP server |
| Node.js server | `server/index.js` | Streamable HTTP MCP server with `ping` + `echo` tools |
| Start script | `scripts/start-server.sh` | Installs deps and starts the server |
| Skill | `skills/mcp-http-usage/` | Explains setup, tools, and transport concepts |

## Quick Start

**1. Start the MCP server** (in a separate terminal):

```bash
bash scripts/start-server.sh
```

**2. Open or restart Claude Code** — it will connect to `http://localhost:3001/mcp` automatically.

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

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Port for the HTTP MCP server |

## Transport: Streamable HTTP vs stdio

This plugin uses **Streamable HTTP** (`"type": "streamable-http"` in `.mcp.json`), where:
- The server runs as a persistent, manually-started process
- Claude Code connects over HTTP POST/GET to the configured URL
- Multiple clients can share the same server

This differs from **stdio** servers, which Claude Code spawns automatically as child processes tied to the session lifetime.

## Security

The `.mcp.json` connects to `http://localhost:3001/mcp`. This is safe for local development only. For any non-local deployment, update the URL to `https://` and ensure the server uses TLS.

## Author

Maciej Warchalowski — maciej.warchalowski@wellspring.com
