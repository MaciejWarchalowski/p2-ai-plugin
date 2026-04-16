import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import http from 'node:http';
import { z } from 'zod';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

function buildMcpServer() {
  const server = new McpServer({ name: 'ping-example', version: '0.1.0' });

  server.tool(
    'ping',
    'Returns pong with a timestamp — use this to verify the server is alive and reachable',
    {},
    async () => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify({ status: 'pong', timestamp: new Date().toISOString() }),
        },
      ],
    })
  );

  server.tool(
    'echo',
    'Echoes the provided message back — useful for testing tool round-trips',
    { message: z.string().describe('The message to echo back') },
    async ({ message }) => ({
      content: [{ type: 'text', text: `Echo: ${message}` }],
    })
  );

  return server;
}

// Stateless: new McpServer + transport per request (appropriate for ping/echo)
const httpServer = http.createServer(async (req, res) => {
  if (req.url !== '/mcp') {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    return;
  }

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await buildMcpServer().connect(transport);
    await transport.handleRequest(req, res);
  } catch (err) {
    console.error('Request error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' }).end('Internal server error');
    }
  }
});

httpServer.listen(PORT, () => {
  console.log(`MCP ping-example server listening at http://localhost:${PORT}/mcp`);
  console.log('Tools available: ping, echo');
});

httpServer.on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});
