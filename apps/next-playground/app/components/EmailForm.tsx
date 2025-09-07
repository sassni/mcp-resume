'use client';
import { useState } from 'react';
import { sendMail } from './mcpClient';

export default function EmailForm() {
  const [to, setTo] = useState('hr@example.com');
  const [subject, setSubject] = useState('Job Application from Sasni');
  const [body, setBody] = useState('Hello, this is a test email sent from my MCP demo project.');
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResp(null);
    try {
      const data = await sendMail(to, subject, body);
      setResp(data);
    } catch (e: any) {
      setResp({ error: e?.message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Send Email</h2>
      <form onSubmit={onSend}>
        <label>Recipient</label>
        <input value={to} onChange={e=>setTo(e.target.value)} />

        <label style={{paddingTop: 6}}>Subject</label>
        <input value={subject} onChange={e=>setSubject(e.target.value)} />

        <label style={{paddingTop: 6}}>Body</label>
        <textarea value={body} onChange={e=>setBody(e.target.value)} />

        <div style={{marginTop:12, display:'flex', gap:8}}>
          <button disabled={loading}>{loading ? 'Sending…' : 'Send Email'}</button>
        </div>
      </form>

      {resp && (
        <div style={{marginTop:16, padding:16, borderRadius:12,
                    background: resp.error ? '' : '',
                    border: `1px solid ${resp.error ? '' : ''}`}}>
          {resp.error ? (
            <>
              <h3 style={{marginTop:0}}>Failed to send</h3>
              <p>{resp.error}</p>
            </>
          ) : (
            <>
              <h3 style={{marginTop:0}}>Email sent successfully</h3>
              <p><strong>To:</strong> {resp.info?.to || to}</p>
              <p><strong>Message ID:</strong> {resp.info?.messageId || 'simulated'}</p>
            </>
          )}
        </div>
      )}

    </div>
  );
}
