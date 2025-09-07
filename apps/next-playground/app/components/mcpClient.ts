export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
export const MCP_WS = process.env.NEXT_PUBLIC_MCP_WS || 'ws://localhost:8080/mcp';

export async function askCv(question: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.answer as string;
}

export async function sendMail(to: string, subject: string, body: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// Optional: WebSocket JSON-RPC client
export function openMcp(onMessage: (msg: any)=>void) {
  const ws = new WebSocket(MCP_WS);
  ws.onmessage = (ev) => {
    try { onMessage(JSON.parse(String(ev.data))); } catch { /* noop */ }
  };
  return {
    call(method: string, params: any, id = Date.now()) {
      ws.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
    },
    close() { ws.close(); }
  };
}
