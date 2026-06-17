import React from 'react';
import ProductRecommendations from './ProductRecommendations.jsx';

/**
 * @param {{ outfit: import('../types/index.js').Outfit | null }} props
 */
function OutfitCard({ outfit }) {
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
    </div>
  );
}

export default React.memo(OutfitCard);
