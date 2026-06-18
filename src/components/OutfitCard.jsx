import React from 'react';
import ProductRecommendations from './ProductRecommendations.jsx';

/**
 * OutfitCard — displays an outfit with items, scores, and optional actions.
 * @param {{
 *   outfit: import('../types/index.js').Outfit | null,
 *   showActions?: boolean,
 *   rating?: number,
 *   onSave?: () => void,
 *   onRate?: (rating: number) => void,
 *   onRegenerate?: () => void,
 *   onRemove?: () => void,
 *   isSaved?: boolean,
 * }} props
 */
function OutfitCard({ outfit, showActions, rating, onSave, onRate, onRegenerate, onRemove, isSaved }) {
  if (!outfit) return null;
  const total = outfit.items?.reduce((s, i) => s + (i.price || 0), 0) || 0;

  return (
    <div className="outfit-card">
      <div className="outfit-card-header">
        <span className="ai-label">✦ AI Styled</span>
        <h4>{outfit.name || 'Complete Outfit'}</h4>
        <p>{outfit.why || 'Curated for your occasion'}</p>
      </div>

      <ProductRecommendations items={outfit.items} />

      {outfit.scores && (
        <div className="outfit-scores">
          {Object.entries(outfit.scores).map(([k, v]) => (
            <div className="score-pill" key={k}>
              <div className="score-val">{v}</div>
              <div className="score-lbl">{k}</div>
            </div>
          ))}
        </div>
      )}

      <div className="outfit-total">
        <span>Total look</span>
        <strong>€{total.toFixed(2)}</strong>
      </div>

      {/* Actions row: Save, Rate, Regenerate */}
      {showActions && (
        <div className="outfit-actions">
          <div className="outfit-actions-left">
            {/* Save button */}
            {onSave && (
              <button
                className={`outfit-action-btn save${isSaved ? ' saved' : ''}`}
                onClick={onSave}
                title={isSaved ? 'Saved' : 'Save this look'}
              >
                {isSaved ? '❤️' : '🤍'}
              </button>
            )}

            {/* Rating stars */}
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

            {/* Remove (for saved looks view) */}
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
    </div>
  );
}

export default React.memo(OutfitCard);
