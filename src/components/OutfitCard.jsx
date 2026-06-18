import React, { useState } from 'react';
import ProductRecommendations from './ProductRecommendations.jsx';
import FeedbackBar from './FeedbackBar.jsx';

/**
 * OutfitCard — displays an outfit with items, scores, "Why This Works" breakdown,
 * and optional actions (save, rate, regenerate, compare).
 */
function OutfitCard({ outfit, showActions, rating, onSave, onRate, onRegenerate, onRemove, isSaved, scores, showWhyThisWorks, onFeedback }) {
  const [showWhy, setShowWhy] = useState(showWhyThisWorks || false);
  if (!outfit) return null;
  const total = outfit.items?.reduce((s, i) => s + (i.price || 0), 0) || 0;

  // Normalize scores from different possible locations
  const s = scores || outfit.scores || {};

  // Determine if each dimension is strong (≥70), medium (≥40), or needs work
  const scoreDefs = [
    { key: 'occasionFit', label: 'Occasion Fit', value: s.occasionFit ?? s.occasion_fit ?? 75, icon: '📋' },
    { key: 'colorHarmony', label: 'Color Harmony', value: s.colorHarmony ?? s.color_harmony ?? 70, icon: '🎨' },
    { key: 'styleCoherence', label: 'Style Coherence', value: s.styleCoherence ?? s.style_coherence ?? 75, icon: '✨' },
    { key: 'trendAlignment', label: 'Trend Alignment', value: s.trendAlignment ?? s.trend_alignment ?? 70, icon: '📈' },
    { key: 'weatherFit', label: 'Weather Fit', value: s.weatherFit ?? s.weather_fit ?? 75, icon: '🌤️' },
  ];

  // "Why This Works" checkmarks
  const whyThisWorks = scoreDefs.map(def => ({
    ...def,
    status: def.value >= 70 ? 'pass' : def.value >= 40 ? 'neutral' : 'fail',
  }));

  return (
    <div className="outfit-card">
      <div className="outfit-card-header">
        <div className="outfit-card-header-top">
          <span className="ai-label">✦ AI Styled</span>
          {outfit.styleCategory && (
            <span className="outfit-category-badge">{outfit.styleCategory}</span>
          )}
        </div>
        <h4>{outfit.name || 'Complete Outfit'}</h4>
        <p>{outfit.why || 'Curated for your occasion'}</p>
      </div>

      {/* Product items */}
      <ProductRecommendations items={outfit.items} />

      {/* ══════════════════════════════════════════════════════════
          WHY THIS WORKS — Visual breakdown (always shown)
          ══════════════════════════════════════════════════════════ */}
      <div className="outfit-why-section">
        <button
          className={`outfit-why-toggle${showWhy ? ' active' : ''}`}
          onClick={() => setShowWhy(!showWhy)}
        >
          <span>🔍 Why This Works</span>
          <span className="outfit-why-arrow">{showWhy ? '▲' : '▼'}</span>
        </button>

        {showWhy && (
          <div className="outfit-why-breakdown">
            {whyThisWorks.map(def => (
              <div key={def.key} className={`outfit-why-row ${def.status}`}>
                <span className="outfit-why-icon">{def.icon}</span>
                <span className="outfit-why-label">{def.label}</span>
                <div className="outfit-why-bar-track">
                  <div
                    className="outfit-why-bar-fill"
                    style={{
                      width: `${def.value}%`,
                      background: def.status === 'pass'
                        ? 'var(--up)'
                        : def.status === 'neutral'
                          ? 'var(--accent2)'
                          : 'var(--down)',
                    }}
                  />
                </div>
                <span className="outfit-why-score">{def.value}</span>
                <span className="outfit-why-check">
                  {def.status === 'pass' ? '✓' : def.status === 'neutral' ? '○' : '⚠'}
                </span>
              </div>
            ))}

            {outfit.whyDetailed && (
              <div className="outfit-why-note">
                <span className="outfit-why-note-icon">💡</span>
                <span className="outfit-why-note-text">{outfit.whyDetailed}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scores row */}
      {scoreDefs.length > 0 && (
        <div className="outfit-scores">
          {scoreDefs.slice(0, 3).map(def => (
            <div className="score-pill" key={def.key}>
              <div className="score-val" style={{
                color: def.value >= 70 ? 'var(--up)' : def.value >= 40 ? 'var(--accent2)' : 'var(--down)',
              }}>{def.value}</div>
              <div className="score-lbl">{def.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      <div className="outfit-total">
        <span>Total look</span>
        <strong>€{total.toFixed(2)}</strong>
      </div>

      {/* Actions row */}
      {showActions && (
        <div className="outfit-actions">
          <div className="outfit-actions-left">
            {onSave && (
              <button
                className={`outfit-action-btn save${isSaved ? ' saved' : ''}`}
                onClick={onSave}
                title={isSaved ? 'Saved' : 'Save this look'}
              >
                {isSaved ? '❤️' : '🤍'}
              </button>
            )}

            {onRate !== undefined && (
              <div className="outfit-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`rating-star${(rating || 0) >= star ? ' active' : ''}`}
                    onClick={() => onRate(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            )}

            {onRemove && (
              <button className="outfit-action-btn remove" onClick={onRemove} title="Remove">
                🗑️
              </button>
            )}
          </div>

          <div className="outfit-actions-right">
            {onRegenerate && (
              <button className="outfit-action-btn regenerate" onClick={onRegenerate} title="Regenerate this look">
                🔄 Regenerate
              </button>
            )}
          </div>
        </div>
      )}

      {/* Emotional Feedback */}
      {onFeedback && <FeedbackBar outfit={outfit} onFeedback={onFeedback} compact />}
    </div>
  );
}

export default React.memo(OutfitCard);
