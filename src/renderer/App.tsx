import React, { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import './App.css'; // Ensure this is the correct path

const DEFAULT_SERVER = 'http://localhost:8000';
const INITIAL_PROMPT = "Hello! I'm your Chat Ally here to assist you. How can I help you today?";

type Message = { role: 'user' | 'llm', content: string };

function ChatApp() {
  const [server, setServer] = useState(DEFAULT_SERVER);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [addressInput, setAddressInput] = useState(server);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setConnected(null);
    setErrorMsg(null);
    setModel(null);

    const tryHealth = async () => {
      let ok = false;
      let error = "";
      let foundModel = null;
      for (const endpoint of ["/api/v1/models", "/api/v1/health"]) {
        try {
          const res = await fetch(`${server}${endpoint}`);
          if (res.ok) {
            ok = true;
            if (endpoint === "/api/v1/models") {
              try {
                const data = await res.json();
                if (data && Array.isArray(data.data) && data.data.length > 0) {
                  foundModel = data.data[0].id;
                }
              } catch {}
            }
            break;
          } else {
            let body = "";
            try { body = await res.text(); } catch {}
            error = `Server responded with status ${res.status} ${res.statusText} at ${endpoint}` +
              (body ? `\n${body}` : "");
            if (res.status !== 404) break;
          }
        } catch (err: any) {
          error = `Could not connect: ${err.message}`;
          break;
        }
      }
      if (ok) {
        setConnected(true);
        if (foundModel) setModel(foundModel);
      } else {
        setConnected(false);
        setErrorMsg(error + "\nTried endpoints: /api/v1/models, /api/v1/health");
      }
    };

    tryHealth();
  }, [server]);

  useEffect(() => {
    if (connected && model) {
      sendMessage(INITIAL_PROMPT, true);
    } else if (connected && !model) {
      setMessages([{ role: 'llm', content: "⚠️ No models available on the server. Please configure the Lemonade server with at least one model." }]);
    }
  }, [connected, model]);

  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServer(addressInput);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || !model) return;
    setMessages(msgs => [...msgs, { role: 'user', content: input }]);
    sendMessage(input);
    setInput('');
  }

  function sendMessage(prompt: string, isInitial = false) {
    setLoading(true);
    fetch(`${server}/api/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || "",
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const llmMsg = data?.choices?.[0]?.message?.content || "No response.";
        setMessages(msgs => [...msgs, { role: 'llm', content: llmMsg }]);
      })
      .catch((err) => {
        setMessages(msgs => [...msgs, { role: 'llm', content: `⚠️ Error: Could not reach LLM server. ${err.message}` }]);
      })
      .finally(() => setLoading(false));
  }

  function handleReset() {
    setMessages([]);
    setTimeout(() => sendMessage(INITIAL_PROMPT, true), 100);
  }

  function handleRetry() {
    setServer(addressInput);
  }

  if (connected === false) {
    return (
      <div className="centered error-bg">
        <Card className="server-card">
          <CardHeader>
            <CardTitle>Cannot connect to Chat Ally server</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {errorMsg
                ? <span style={{ color: "#f87171", whiteSpace: "pre-wrap" }}>{errorMsg}</span>
                : "Please start the Chat Ally server, or enter the correct address below."}
            </p>
            <form onSubmit={handleAddressSubmit} style={{ marginTop: 16 }}>
              <Input
                value={addressInput}
                onChange={e => setAddressInput(e.target.value)}
                placeholder="http://localhost:8000"
                className="chat-input"
              />
              <Button type="submit" variant="secondary" className="address-btn">
                Set Address
              </Button>
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
            <CardTitle>Connecting to Chat Ally server...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Trying <b>{server}</b></p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="chat-root">
      <Card className="chat-card">
        <CardHeader>
          <CardTitle>
            <span className="logo">🤖</span> Chat Ally
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <span className="role">{msg.role === 'user' ? 'You' : 'Ally'}</span>
                <span className="content">{msg.content}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-input-row" onSubmit={handleSend}>
            <Input
              value={input}
              onChange={handleInput}
              placeholder="  Type your message..."
              disabled={loading || !model}
              className="chat-input"
              autoFocus
            />
            <Button type="submit" disabled={loading || !input.trim() || !model} variant="default">
              {loading ? '...' : 'Send'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
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