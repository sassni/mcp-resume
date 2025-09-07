'use client';
import { useState } from 'react';
import { askCv } from './mcpClient';

const EXAMPLES = [
  "What role did I have at my last position?",
  "What are my main technical skills?",
  "Where did I study?",
  "What's my contact email?",
];

interface ChatProps {
  onAnswer: (answer: string) => void;
}

export default function Chat({ onAnswer }: ChatProps) {
  const [q, setQ] = useState(EXAMPLES[0]);
  const [loading, setLoading] = useState(false);

  async function onAsk(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    onAnswer('');
    try {
      const ans = await askCv(q);
      onAnswer(ans);
    } catch (e: any) {
      onAnswer('Error: ' + (e?.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Chat about resume</h2>

      <form onSubmit={onAsk}>
        <label>Question</label>
        <input value={q} onChange={e=>setQ(e.target.value)} />
        <div style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
          <button type="submit" disabled={loading}>{loading ? 'Asking…' : 'Ask'}</button>
        </div>
        <div style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
        {EXAMPLES.map(ex => (
            <button key={ex} type="button" style={{background:'#f3f4f6', color:'#111827'}}
              onClick={()=>setQ(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
