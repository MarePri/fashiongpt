import React from 'react';
import OutfitCard from './OutfitCard.jsx';

/**
 * Chat panel — conversation view with input.
 * @param {{
 *   messages: import('../types/index.js').ChatMessage[],
 *   input: string,
 *   loading: boolean,
 *   setInput: (v: string) => void,
 *   sendMessage: (text?: string) => void,
 *   prompts: string[],
 *   chatEndRef: React.RefObject
 * }} props
 */
function ChatPanel({ messages, input, loading, setInput, sendMessage, prompts, chatEndRef }) {
  return (
    <>
      <div className="chat-area">
        {messages.length === 0 && (
          <div className="chat-hero">
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
              <span className="pulse-dot" />AI Stylist · Always on
            </p>
            <h1>Describe what<br />you want to <em>achieve</em></h1>
            <p style={{ marginTop: 12 }}>Not what product. What feeling. What moment. What impression.</p>
            <div className="divider" />
            <div className="prompt-chips">
              {prompts.map((p, i) => (
                <button key={p} className="chip" onClick={() => sendMessage(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={m.id || i} className={`msg ${m.role}`}>
            <div className="msg-avatar">{m.role === 'ai' ? '✦' : '👤'}</div>
            <div style={{ maxWidth: '85%' }}>
              <div className="msg-bubble">{m.content}</div>
              {m.outfit && <OutfitCard outfit={m.outfit} />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg ai">
            <div className="msg-avatar">✦</div>
            <div className="msg-bubble thinking">
              <div className="thinking-dots"><span /><span /><span /></div>
              Styling your look…
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-input-wrap">
        <div className="chat-input-row">
          <textarea
            className="chat-input"
            rows={1}
            placeholder="Describe your occasion, mood, or goal…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              // Enter (alone) → send
              if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                sendMessage();
              }
              // Cmd/Ctrl+Enter → send (alternative)
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                sendMessage();
              }
              // Esc → clear input or blur textarea
              if (e.key === 'Escape') {
                if (input) {
                  setInput('');
                } else {
                  e.target.blur();
                }
              }
            }}
          />
          <button className="chat-send" disabled={!input.trim() || loading} onClick={() => sendMessage()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default React.memo(ChatPanel);
