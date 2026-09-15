import React, { useState } from 'react';
import { Send, Bot, User, ShieldAlert, Sparkles, ChevronRight, Search, FileText, CheckCircle2 } from 'lucide-react';

const SAMPLE_PROMPTS = [
  "My iPhone 6s battery dies so fast after iOS 11 update",
  "Siri is inserting a space before my first word when I dictate",
  "How do I revert to previous iOS? Can I delete iOS 11?",
  "iPhone SE storage full alert but I don't have any apps!",
  "My MacBook Pro screen cracked and overheating, need repair cost"
];

export default function ChatView({ onSendMessage }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your AI Apple Support Assistant. Ask me any question about your iPhone, iPad, Mac, iOS updates, battery, or account!",
      intent: null,
      retrieved_cases: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeInspectorIndex, setActiveInspectorIndex] = useState(null);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText })
      });

      const data = await res.json();

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response,
        intent: data.intent,
        confidence: data.confidence,
        escalate: data.escalate,
        reason: data.reason,
        retrieved_cases: data.retrieved_cases || []
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "Sorry, I couldn't reach the backend server. Make sure `python main.py` is running on http://127.0.0.1:8000.",
          intent: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectedBotMsg = activeInspectorIndex !== null ? messages[activeInspectorIndex] : null;

  return (
    <div style={styles.grid}>
      {/* Left Chat Main Area */}
      <div className="glass-panel" style={styles.chatContainer}>
        {/* Quick Prompts Banner */}
        <div style={styles.quickBanner}>
          <span style={styles.quickLbl}>
            <Sparkles size={14} color="var(--apple-amber)" /> Suggested Queries:
          </span>
          <div style={styles.quickPromptsList}>
            {SAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                style={styles.promptBtn}
                onClick={() => handleSend(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Message Log */}
        <div style={styles.messageLog}>
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {msg.sender === 'bot' && (
                <div style={styles.botAvatar}>
                  <Bot size={18} color="#fff" />
                </div>
              )}

              <div
                style={{
                  ...styles.bubble,
                  ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble)
                }}
              >
                {msg.sender === 'bot' && msg.intent && (
                  <div style={styles.badgeRow}>
                    <span className="badge-pill badge-blue">
                      ⚡ Intent: {msg.intent} ({Math.round((msg.confidence || 0.9) * 100)}%)
                    </span>
                    {msg.escalate && (
                      <span className="badge-pill badge-amber">
                        <ShieldAlert size={12} /> DM Escalation Recommended
                      </span>
                    )}
                  </div>
                )}

                <p style={styles.msgText}>{msg.text}</p>

                {msg.sender === 'bot' && msg.retrieved_cases?.length > 0 && (
                  <button
                    style={styles.inspectBtn}
                    onClick={() => setActiveInspectorIndex(idx)}
                  >
                    <Search size={13} /> Grounded Sources ({msg.retrieved_cases.length} vector matches) <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {msg.sender === 'user' && (
                <div style={styles.userAvatar}>
                  <User size={18} color="#fff" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
              <div style={styles.botAvatar}>
                <Bot size={18} color="#fff" />
              </div>
              <div style={{ ...styles.bubble, ...styles.botBubble }}>
                <span style={styles.typingText}>Searching 8,000 vector embeddings & classifying intent...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          style={styles.inputForm}
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            style={styles.textInput}
            type="text"
            placeholder="Ask Apple Support (e.g. My iPhone battery is draining so fast)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button style={styles.sendBtn} type="submit" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Right Grounding RAG Inspector Panel */}
      <div className="glass-panel" style={styles.inspectorContainer}>
        <div style={styles.inspectorHeader}>
          <FileText size={18} color="var(--apple-cyan)" />
          <h3 style={{ fontSize: '1rem', color: '#fff' }}>Grounding Inspector (RAG)</h3>
        </div>

        {selectedBotMsg && selectedBotMsg.retrieved_cases?.length > 0 ? (
          <div style={styles.inspectorBody}>
            <div style={styles.inspectorMeta}>
              <div><strong>Query:</strong> "{selectedBotMsg.retrieved_cases[0]?.text_query}"</div>
              <div style={{ marginTop: '4px' }}>
                <strong>Classified Intent:</strong> <span style={{ color: 'var(--apple-cyan)' }}>{selectedBotMsg.intent}</span>
              </div>
            </div>

            <h4 style={styles.sectionHeading}>Top-3 Retrieved Past Cases:</h4>

            {selectedBotMsg.retrieved_cases.map((caseItem, i) => (
              <div key={i} className="glass-card" style={styles.caseCard}>
                <div style={styles.caseHeader}>
                  <span className="badge-pill badge-green">
                    Match # {i + 1}
                  </span>
                  <span style={styles.simScore}>
                    {(caseItem.similarity * 100).toFixed(1)}% Cosine Similarity
                  </span>
                </div>
                <div style={styles.caseField}>
                  <strong>Customer Tweet:</strong>
                  <p>{caseItem.text_query}</p>
                </div>
                <div style={styles.caseField}>
                  <strong>Apple's Official Response:</strong>
                  <p style={{ color: 'var(--apple-cyan)' }}>{caseItem.text_reply}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyInspector}>
            <Search size={36} color="var(--text-dim)" />
            <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '0.88rem', textAlign: 'center' }}>
              Send a query or click <strong>"Grounded Sources"</strong> on any bot response to inspect the exact historical Twitter cases retrieved from the vector database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '20px',
    minHeight: '620px'
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '620px',
    overflow: 'hidden'
  },
  quickBanner: {
    padding: '12px 16px',
    background: 'rgba(0, 0, 0, 0.25)',
    borderBottom: '1px solid var(--panel-border)'
  },
  quickLbl: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  },
  quickPromptsList: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  promptBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    color: 'var(--text-main)',
    padding: '4px 12px',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  messageLog: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  messageRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  botAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'var(--apple-blue)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  userAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'var(--apple-purple)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  bubble: {
    maxWidth: '75%',
    padding: '14px 18px',
    borderRadius: '16px',
    fontSize: '0.92rem',
    lineHeight: '1.45'
  },
  botBubble: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    borderTopLeftRadius: '4px'
  },
  userBubble: {
    background: 'var(--apple-blue)',
    color: '#fff',
    borderTopRightRadius: '4px'
  },
  badgeRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '8px',
    flexWrap: 'wrap'
  },
  msgText: {
    wordBreak: 'break-word'
  },
  inspectBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '10px',
    background: 'rgba(0, 113, 227, 0.15)',
    border: '1px solid rgba(41, 216, 255, 0.3)',
    color: 'var(--apple-cyan)',
    fontSize: '0.75rem',
    padding: '4px 10px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  typingText: {
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
    fontSize: '0.85rem'
  },
  inputForm: {
    display: 'flex',
    gap: '10px',
    padding: '16px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderTop: '1px solid var(--panel-border)'
  },
  textInput: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    color: '#fff',
    padding: '12px 16px',
    fontSize: '0.92rem',
    outline: 'none'
  },
  sendBtn: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    background: 'var(--apple-blue)',
    border: 'none',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  inspectorContainer: {
    height: '620px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  inspectorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 20px',
    borderBottom: '1px solid var(--panel-border)',
    background: 'rgba(0, 0, 0, 0.2)'
  },
  inspectorBody: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto'
  },
  inspectorMeta: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px'
  },
  sectionHeading: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    marginBottom: '12px'
  },
  caseCard: {
    padding: '14px',
    marginBottom: '12px'
  },
  caseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  simScore: {
    fontSize: '0.78rem',
    color: 'var(--apple-green)',
    fontWeight: '600'
  },
  caseField: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '6px'
  },
  emptyInspector: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px'
  }
};
