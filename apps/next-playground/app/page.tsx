'use client';
import { useState } from 'react';
import './globals.css';
import Chat from './components/Chat';
import EmailForm from './components/EmailForm';

export default function Page() {
  const [answer, setAnswer] = useState('');

  return (
    <main className="container">
      <header style={{textAlign:'center', marginBottom:32}}>
        <h1>MCP Resume Playground</h1>
        <p className="small">Ask questions about resume and send emails.</p>
      </header>

      <div className="row" style={{marginTop:16}}>
        <Chat onAnswer={setAnswer} />
        <EmailForm />
      </div>

      {answer && (
        <div className="card" style={{marginTop: 20}}>
          <h2>Answer</h2>
          <pre>{answer}</pre>
        </div>
      )}
    </main>
  );
}
