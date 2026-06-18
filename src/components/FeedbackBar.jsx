import React, { useState, useCallback } from 'react';

/**
 * FeedbackBar — Quick emotional feedback buttons.
 * 
 * After every outfit generation or saved look review, the user can react with:
 * 😍 Love It — strong positive signal
 * 🙂 Like It — positive signal
 * 👎 Not For Me — negative signal
 *
 * Also shows a learning notification when feedback is recorded.
 */
export default function FeedbackBar({ outfit, onFeedback, compact }) {
  const [selected, setSelected] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');

  const handleFeedback = useCallback((type, label) => {
    setSelected(type);
    onFeedback?.(type);

    // Show learning notification
    const messages = {
      love: [
        "FashionGPT will find more looks like this! ❤️",
        "Saved to your style memory! You love this aesthetic.",
        "Great taste! Similar looks will appear in your recommendations.",
      ],
      like: [
        "FashionGPT is learning your preferences ✨",
        "Noted! This style is going into your profile.",
        "Got it! More styles like this in the future.",
      ],
      dislike: [
        "Noted! FashionGPT will avoid similar looks.",
        "Feedback recorded — your style memory gets sharper.",
        "Thanks! This helps FashionGPT understand you better.",
      ],
    };

    const msgs = messages[type] || messages.like;
    setNotificationText(msgs[Math.floor(Math.random() * msgs.length)]);

    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }, [onFeedback]);

  const buttons = [
    { type: 'love', icon: '😍', label: 'Love It', color: 'var(--up)' },
    { type: 'like', icon: '🙂', label: 'Like It', color: 'var(--accent2)' },
    { type: 'dislike', icon: '👎', label: 'Not For Me', color: 'var(--down)' },
  ];

  if (compact) {
    return (
      <div className="fb-compact">
        {buttons.map(btn => (
          <button
            key={btn.type}
            className={`fb-btn fb-btn-compact${selected === btn.type ? ' selected' : ''}`}
            onClick={() => handleFeedback(btn.type, btn.label)}
            title={btn.label}
          >
            {btn.icon}
          </button>
        ))}
        {showNotification && (
          <div className="fb-notification fb-notification-inline">
            <span className="fb-notif-icon">✨</span>
            <span className="fb-notif-text">{notificationText}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fb-bar">
      <div className="fb-label">How did this look feel?</div>
      <div className="fb-buttons">
        {buttons.map(btn => (
          <button
            key={btn.type}
            className={`fb-btn${selected === btn.type ? ' selected' : ''}`}
            onClick={() => handleFeedback(btn.type, btn.label)}
          >
            <span className="fb-btn-icon">{btn.icon}</span>
            <span className="fb-btn-label">{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Learning notification */}
      {showNotification && (
        <div className="fb-notification">
          <span className="fb-notif-icon">🧠</span>
          <div className="fb-notif-content">
            <span className="fb-notif-title">FashionGPT Learned</span>
            <span className="fb-notif-text">{notificationText}</span>
          </div>
        </div>
      )}
    </div>
  );
}
