#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

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

await server.connect(new StdioServerTransport());
