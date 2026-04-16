# Server Implementation Details

The server (`server/index.js`) uses `@modelcontextprotocol/sdk` with `StreamableHTTPServerTransport`. It is stateless — each incoming HTTP request receives a fresh `McpServer` instance and transport, then is handled independently.

## Stateless Pattern (used here)

Create a new server + transport per request. Suitable when tools have no cross-request state:

```javascript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

function buildMcpServer() {
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

  return server;
}

// Fresh transport per request — sessionIdGenerator: undefined = stateless
const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await buildMcpServer().connect(transport);
await transport.handleRequest(req, res);
```

## Stateful Pattern (for session-aware servers)

For servers that maintain state across requests (e.g., open database connections, accumulated context), create one transport per session and store it:

```javascript
import { randomUUID } from 'node:crypto';

const sessions = new Map(); // sessionId → { server, transport }

// On each request:
const sessionId = req.headers['mcp-session-id'] ?? randomUUID();
let session = sessions.get(sessionId);
if (!session) {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => sessionId,
  });
  const server = buildMcpServer();
  await server.connect(transport);
  session = { server, transport };
  sessions.set(sessionId, session);
}
await session.transport.handleRequest(req, res);
```

Clean up sessions on disconnect or timeout to avoid memory leaks.

## Tool Registration

Register tools using `server.tool(name, description, schema, handler)`:

- `name` — identifier used by Claude Code (becomes part of the full tool name)
- `description` — shown to the model; determines when the tool gets called
- `schema` — Zod object defining input parameters; use `{}` for no parameters
- `handler` — async function returning `{ content: [{ type: 'text', text: '...' }] }`

## HTTP Route Handling

Only `/mcp` is handled. All other paths return 404. Both GET (SSE stream) and POST (tool calls) hit the same route and are dispatched internally by `StreamableHTTPServerTransport.handleRequest`.
