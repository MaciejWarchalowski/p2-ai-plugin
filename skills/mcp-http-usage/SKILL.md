---
name: MCP HTTP Usage
description: >
  This skill should be used when the user asks to "start the MCP server",
  "use the ping tool", "use the echo tool", "test the MCP connection",
  "how does HTTP transport work", "explain the MCP example plugin",
  "connect to the streamable HTTP MCP server", or "how is the MCP
  integration structured".

  <example>
  User: "Start the MCP server and test the ping tool"
  Claude: [runs start-server.sh, verifies server is up, calls ping tool, reports pong response]
  </example>

  <example>
  User: "How does the HTTP transport in this plugin work?"
  Claude: [explains streamable-http transport, .mcp.json config, how it differs from stdio]
  </example>
version: 0.1.0
---

# MCP HTTP Usage

To use MCP tools in this plugin, start the bundled HTTP server and connect Claude Code to it via `.mcp.json`. Unlike stdio servers (auto-started by Claude Code), HTTP servers run as persistent processes that must be started manually.

The connection flow:

1. Start `server/index.js` on port 3001
2. Claude Code reads `.mcp.json` and opens a Streamable HTTP connection to `http://localhost:3001/mcp`
3. Tools `ping` and `echo` become available to use

## Starting the Server

Run the start script from anywhere — it resolves paths relative to the plugin root:

```bash
bash $CLAUDE_PLUGIN_ROOT/scripts/start-server.sh
```

On first run, the script installs `node_modules` automatically before starting the server. Expected output:

```
MCP ping-example server listening at http://localhost:3001/mcp
Tools available: ping, echo
```

To use a different port:

```bash
PORT=3002 bash $CLAUDE_PLUGIN_ROOT/scripts/start-server.sh
```

When changing the port, update the `url` in `.mcp.json` to match and restart Claude Code.

Keep the server running in a separate terminal while using Claude Code. Stop it with `Ctrl-C`.

## Verifying the Connection

After starting the server, run `/mcp` in Claude Code to confirm `ping-example` appears and its tools are listed. If the server is not running, Claude Code will show a connection error for `ping-example`.

## Available Tools

### ping

Returns `{ status: "pong", timestamp: "<ISO 8601>" }` — use this to confirm the server is alive and the connection is healthy.

No parameters required.

Example response:
```json
{ "status": "pong", "timestamp": "2026-04-16T10:30:00.000Z" }
```

### echo

Returns `"Echo: <message>"` — use this to verify tool round-trips (input reaches server, response returns correctly).

Parameter: `message` (string, required) — the text to echo back.

Calling `echo` with `message = "hello"` returns `"Echo: hello"`.

## How `.mcp.json` Is Configured

The plugin uses Streamable HTTP transport (`"type": "streamable-http"`):

```json
{
  "ping-example": {
    "type": "streamable-http",
    "url": "http://localhost:3001/mcp"
  }
}
```

Compare this to a stdio server, which Claude Code spawns automatically:

```json
{
  "some-tool": {
    "command": "node",
    "args": ["$CLAUDE_PLUGIN_ROOT/server/index.js"]
  }
}
```

| | Streamable HTTP | stdio |
|--|--|--|
| Startup | Manual (user starts server) | Automatic (Claude Code spawns it) |
| Lifecycle | Persistent process | Tied to Claude Code session |
| Connection | HTTP POST/GET to URL | stdin/stdout pipe |
| Best for | Remote/shared servers, demos | Local tools, single-session tools |

> **Security note:** The `http://localhost` URL is safe for local development only. For any non-local deployment, update `.mcp.json` to use `https://`.

## Installing Server Dependencies

Before first use, install dependencies in `server/`:

```bash
npm install --prefix $CLAUDE_PLUGIN_ROOT/server
```

The `start-server.sh` script does this automatically. To install manually:

```bash
cd $CLAUDE_PLUGIN_ROOT/server && npm install
```

Dependencies: `@modelcontextprotocol/sdk` (MCP runtime + transport), `zod` (tool parameter validation).

## Troubleshooting

**`/mcp` shows connection error for `ping-example`**
Start the server with the start script.

**Port 3001 already in use**
Stop the conflicting process, or start on a different port (`PORT=3002 bash .../start-server.sh`) and update `.mcp.json`.

**Tools not visible after starting server**
Restart Claude Code — MCP servers are connected at session start; new servers require a fresh session.

**`node_modules` missing**
Run `npm install --prefix $CLAUDE_PLUGIN_ROOT/server` to install dependencies.

## Additional Resources

### Reference Files

- **`references/server-implementation.md`** — Stateless vs stateful server patterns, tool registration details, HTTP route handling. Consult when modifying or extending the server.
