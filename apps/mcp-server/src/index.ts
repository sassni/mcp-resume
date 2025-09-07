import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { z } from 'zod';
import { answerResumeQuestion } from './qa.js';
import { loadResume } from './resume.js';
import { sendEmail } from './email.js';
import { JsonRpcRequest, JsonRpcResponse, StructuredResume } from './types.js';

const PORT = Number(process.env.PORT || 8080);
const RESUME_PATH = process.env.RESUME_PATH || './data/Resume_sasni.md';

const app = express();
app.use(express.json());

// CORS
const origins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: origins.length ? origins : '*'
}));

// State: load resume at startup
let RESUME: StructuredResume = { experience: [], rawText: '' };
(async () => {
  try {
    RESUME = await loadResume(RESUME_PATH);
    console.log('[resume] Loaded from', RESUME_PATH);
  } catch (err) {
    console.error('[resume] Failed to load resume:', err);
  }
})();

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// REST: chat
const ChatSchema = z.object({ question: z.string().min(1) });
app.post('/api/chat', (req, res) => {
  try {
    const { question } = ChatSchema.parse(req.body);
    const answer = answerResumeQuestion(question, RESUME);
    res.json({ answer });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Invalid request' });
  }
});

// REST: email
const EmailSchema = z.object({ to: z.string().email(), subject: z.string().min(1), body: z.string().min(1) });
app.post('/api/email', async (req, res) => {
  try {
    const args = EmailSchema.parse(req.body);
    const info = await sendEmail(args);
    res.json({ ok: true, info });
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: e?.message || 'Invalid request' });
  }
});

const server = http.createServer(app);

// WebSocket MCP (JSON-RPC)
const wss = new WebSocketServer({ server, path: '/mcp' });

wss.on('connection', (ws) => {
  ws.on('message', async (raw) => {
    let req: JsonRpcRequest | null = null;
    try {
      req = JSON.parse(String(raw));
    } catch {
      ws.send(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }));
      return;
    }

    const respond = (resp: JsonRpcResponse) => ws.send(JSON.stringify(resp));

    if (!req?.method) {
      return respond({ jsonrpc: '2.0', id: req?.id, error: { code: -32600, message: 'Invalid Request' } });
    }

    try {
      // --- MCP methods ---
      if (req.method === 'initialize') {
        return respond({
          jsonrpc: '2.0',
          id: req.id,
          result: {
            protocolVersion: '2024-11-05', // example MCP version
            serverInfo: { name: 'resume-mcp-server', version: '1.0.0' },
            capabilities: {}
          }
        });
      }

      if (req.method === 'list_tools') {
        return respond({
          jsonrpc: '2.0',
          id: req.id,
          result: {
            tools: [
              {
                name: 'ask_cv',
                description: 'Ask questions about the resume',
                inputSchema: {
                  type: 'object',
                  properties: { question: { type: 'string' } },
                  required: ['question']
                }
              },
              {
                name: 'send_email',
                description: 'Send an email notification',
                inputSchema: {
                  type: 'object',
                  properties: {
                    to: { type: 'string' },
                    subject: { type: 'string' },
                    body: { type: 'string' }
                  },
                  required: ['to', 'subject', 'body']
                }
              }
            ]
          }
        });
      }

      if (req.method === 'call_tool') {
        const { name, arguments: args } = req.params || {};

        if (name === 'ask_cv') {
          const schema = z.object({ question: z.string().min(1) });
          const { question } = schema.parse(args);
          const answer = answerResumeQuestion(question, RESUME);
          return respond({ jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: answer }] } });
        }

        if (name === 'send_email') {
          const schema = z.object({
            to: z.string().email(),
            subject: z.string().min(1),
            body: z.string().min(1)
          });
          const validated = schema.parse(args);
          const info = await sendEmail(validated);
          return respond({
            jsonrpc: '2.0',
            id: req.id,
            result: { content: [{ type: 'text', text: `Email sent to ${info.to}` }] }
          });
        }

        return respond({ jsonrpc: '2.0', id: req.id, error: { code: -32601, message: `Tool not found: ${name}` } });
      }

      // --- Unknown method ---
      return respond({ jsonrpc: '2.0', id: req.id, error: { code: -32601, message: 'Method not found' } });

    } catch (e: any) {
      return respond({ jsonrpc: '2.0', id: req.id, error: { code: -32000, message: e?.message || 'Server error' } });
    }
  });

  // Immediately send ready notice
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    id: 0,
    result: { ready: true, notice: 'MCP server connected. Try initialize → list_tools → call_tool.' }
  }));
});

server.listen(PORT, () => {
  console.log(`MCP/REST server listening on :${PORT}`);
});
