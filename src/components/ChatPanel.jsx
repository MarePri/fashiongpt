import React, { useState } from 'react';
import OutfitCard from './OutfitCard.jsx';

/**
 * ChatPanel — transformed from a chatbot into a visual Style Coach.
 * 
 * Instead of bare text bubbles, messages are rendered as styled cards
 * with outfit previews, scores, suggested actions, and personality.
 * 
 * The input bar has quick prompts AND a text input for when users
 * want to type something specific.
 */
function ChatPanel({ messages, input, loading, setInput, sendMessage, prompts, chatEndRef }) {
  const [showAllPrompts, setShowAllPrompts] = useState(false);

  // Quick action categories
  const quickActions = [
    { icon: '💒', label: 'Wedding Guest', action: 'I need an outfit for a summer wedding' },
    { icon: '🌹', label: 'Date Night', action: 'First date outfit — I want to feel confident' },
    { icon: '✈️', label: 'City Break', action: 'Going to Barcelona for 5 days — what to pack?' },
    { icon: '🔥', label: 'Streetwear', action: 'Streetwear outfit under €150' },
    { icon: '💼', label: 'Office', action: 'Professional office outfit that stands out' },
    { icon: '🎪', label: 'Festival', action: 'Festival outfit — bold and expressive' },
  ];

  return (
    <>
      <div className="chat-area">
        {messages.length === 0 ? (
          /* ── Empty State: Visual Style Coach landing ── */
          <div className="chat-hero">
            <div className="chat-hero-badge">
              <span className="pulse-dot" />Style Coach · Always on
            </div>
            <h1>What's your <em>style goal</em>?</h1>
            <p className="chat-hero-sub">
              Tell me what you need and I'll help you build the perfect look — with specific products, scores, and styling rationale.
            </p>
            <div className="divider" />

            {/* Quick action cards instead of text chips */}
            <div className="chat-quick-actions">
              {quickActions.map((qa, i) => (
                <button
                  key={i}
                  className="chat-quick-action"
                  onClick={() => sendMessage(qa.action)}
                >
                  <span className="chat-qa-icon">{qa.icon}</span>
                  <span className="chat-qa-label">{qa.label}</span>
                </button>
              ))}
            </div>

            {/* Prompt chips (less prominent) */}
            <div className="divider" />
            <div className="prompt-chips">
              {prompts.slice(0, showAllPrompts ? prompts.length : 4).map((p) => (
                <button key={p} className="chip" onClick={() => sendMessage(p)}>{p}</button>
              ))}
              {prompts.length > 4 && (
                <button className="chip chip-more" onClick={() => setShowAllPrompts(!showAllPrompts)}>
                  {showAllPrompts ? 'Show less ▲' : `${prompts.length - 4} more ▼`}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── Messages: Styled visual cards ── */
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={m.id || i} className={`chat-msg ${m.role}`}>
                {/* Avatar */}
                <div className="chat-msg-avatar">
                  {m.role === 'ai' ? (
                    <span className="chat-ai-avatar">✦</span>
                  ) : (
                    <span className="chat-user-avatar">👤</span>
                  )}
                </div>

                {/* Content */}
                <div className="chat-msg-content">
                  {/* Role label */}
                  {m.role === 'ai' && (
                    <span className="chat-msg-role">Style Coach</span>
                  )}

                  {/* Text content — styled as a coach card, not a bubble */}
                  <div className={`chat-msg-text ${m.role === 'ai' ? 'chat-coach-text' : 'chat-user-text'}`}>
                    {m.content}
                  </div>

                  {/* Outfit card if present */}
                  {m.outfit && (
                    <div className="chat-msg-outfit">
                      <OutfitCard
                        outfit={m.outfit}
                        showWhyThisWorks={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="chat-msg ai">
                <div className="chat-msg-avatar">
                  <span className="chat-ai-avatar">✦</span>
                </div>
                <div className="chat-msg-content">
                  <span className="chat-msg-role">Style Coach</span>
                  <div className="chat-loading-indicator">
                    <div className="chat-loading-dots">
                      <span /><span /><span />
                    </div>
                    <span className="chat-loading-text">Thinking about your look…</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── Input Bar ── */}
      <div className="chat-input-wrap">
        <div className="chat-input-row">
          <textarea
            className="chat-input"
            rows={1}
            placeholder="Describe your occasion, mood, or style goal…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                sendMessage();
              }
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                sendMessage();
              }
              if (e.key === 'Escape') {
                if (input) setInput('');
                else e.target.blur();
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
