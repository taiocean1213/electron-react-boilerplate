import React, { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import './App.css';

const DEFAULT_SERVER = 'http://localhost:8000';
const INITIAL_PROMPT = "Hello! Let's get to know each other. How can I assist you today?";

type Message = { role: 'user' | 'llm', content: string };

function ChatApp() {
  const [server, setServer] = useState(DEFAULT_SERVER);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [addressInput, setAddressInput] = useState(server);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check connection on mount or server change
  useEffect(() => {
    setConnected(null);
    setErrorMsg(null);
    fetch(`${server}/v1/models`)
      .then(async res => {
        if (res.ok) {
          setConnected(true);
        } else {
          let body = "";
          try {
            body = await res.text();
          } catch {}
          setConnected(false);
          setErrorMsg(
            `Server responded with status ${res.status} ${res.statusText}` +
            (body ? `\n${body}` : "") +
            (res.status === 404 ? " (endpoint not found, check Lemonade server URL and version)" : "")
          );
        }
      })
      .catch((err) => {
        setConnected(false);
        setErrorMsg(`Could not connect: ${err.message}`);
        // Log full error for debugging
        // eslint-disable-next-line no-console
        console.error("Lemonade connection error:", err);
      });
  }, [server]);

  // On connect, send initial prompt
  useEffect(() => {
    if (connected) {
      setMessages([{ role: 'user', content: INITIAL_PROMPT }]);
      sendMessage(INITIAL_PROMPT, true);
    }
    // eslint-disable-next-line
  }, [connected]);

  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServer(addressInput);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { role: 'user', content: input }]);
    sendMessage(input);
    setInput('');
  }

  function sendMessage(prompt: string, isInitial = false) {
    setLoading(true);
    fetch(`${server}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
    })
      .then(res => res.json())
      .then(data => {
        const llmMsg = data?.choices?.[0]?.message?.content || "No response.";
        setMessages(msgs => [...msgs, { role: 'llm', content: llmMsg }]);
      })
      .catch(() => {
        setMessages(msgs => [...msgs, { role: 'llm', content: "⚠️ Error: Could not reach LLM server." }]);
      })
      .finally(() => setLoading(false));
  }

  function handleReset() {
    setMessages([]);
    setTimeout(() => {
      setMessages([{ role: 'user', content: INITIAL_PROMPT }]);
      sendMessage(INITIAL_PROMPT, true);
    }, 100);
  }

  function handleRetry() {
    setServer(addressInput);
  }

  // UI
  if (connected === false) {
    return (
      <div className="centered error-bg">
        <Card className="server-card">
          <CardHeader>
            <CardTitle>Cannot connect to Lemonade LLM server</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {errorMsg
                ? <span style={{ color: "#f87171", whiteSpace: "pre-wrap" }}>{errorMsg}</span>
                : "Please start the Lemonade server, or enter the correct address below."}
            </p>
            <form onSubmit={handleAddressSubmit} style={{ marginTop: 16 }}>
              <Input
                value={addressInput}
                onChange={e => setAddressInput(e.target.value)}
                placeholder="http://localhost:8000"
                className="address-input"
              />
              <Button type="submit" className="address-btn" variant="secondary">Set Address</Button>
            </form>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button style={{ flex: 1 }} onClick={handleRetry} variant="outline">
                Try Again
              </Button>
              <Button
                style={{ flex: 1 }}
                type="button"
                variant="outline"
                onClick={() => setAddressInput(
                  addressInput.includes("localhost")
                    ? addressInput.replace("localhost", "127.0.0.1")
                    : addressInput.replace("127.0.0.1", "localhost")
                )}
              >
                Use {addressInput.includes("localhost") ? "127.0.0.1" : "localhost"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (connected === null) {
    return (
      <div className="centered error-bg">
        <Card className="server-card">
          <CardHeader>
            <CardTitle>Connecting to Lemonade LLM server...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Trying <b>{server}</b></p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chat UI
  return (
    <div className="chat-root">
      <Card className="chat-card">
        <CardHeader>
          <CardTitle>
            <span className="logo">⚡</span> Lemonade LLM Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <span className="role">{msg.role === 'user' ? 'You' : 'LLM'}</span>
                <span className="content">{msg.content}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-input-row" onSubmit={handleSend}>
            <Input
              value={input}
              onChange={handleInput}
              placeholder="Type your message..."
              disabled={loading}
              className="chat-input"
              autoFocus
            />
            <Button type="submit" disabled={loading || !input.trim()} className="send-btn">
              {loading ? '...' : 'Send'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="reset-btn">
              Reset
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ChatApp />
    </Router>
  );
}
