# Server Implementation Details

The server (`server/index.js`) uses `@modelcontextprotocol/sdk` with `StdioServerTransport`. It runs as a single-instance process tied to the Claude Code session.

## stdio Pattern (used here)

Create one server and connect it to stdio. Suitable for local tools with no cross-session state:

```javascript
#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'ping-example', version: '0.1.0' });

server.tool('ping', 'Check server liveness', {}, async () => ({
  content: [{ type: 'text', text: JSON.stringify({ status: 'pong', timestamp: new Date().toISOString() }) }],
}));

server.tool(
  'echo',
  'Echo a message back',
  { message: z.string().describe('The message to echo back') },
  async ({ message }) => ({
    content: [{ type: 'text', text: `Echo: ${message}` }],
  })
);

await server.connect(new StdioServerTransport());
```

Claude Code spawns this process and communicates over stdin/stdout. The process exits when Claude Code closes the pipe.

## npx Invocation

`server/package.json` defines a `bin` entry so npx can locate and run the server:

```json
{
  "bin": {
    "mcp-example-server": "./index.js"
  }
}
```

`.mcp.json` uses `npx ./server` to invoke it:

```json
{
  "ping-example": {
    "type": "stdio",
    "command": "npx",
    "args": ["--yes", "./server"]
  }
}
```

## Tool Registration

Register tools using `server.tool(name, description, schema, handler)`:

- `name` — identifier used by Claude Code
- `description` — shown to the model; determines when the tool gets called
- `schema` — Zod object defining input parameters; use `{}` for no parameters
- `handler` — async function returning `{ content: [{ type: 'text', text: '...' }] }`
