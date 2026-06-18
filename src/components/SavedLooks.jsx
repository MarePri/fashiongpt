import React, { useState } from 'react';
import useSavedOutfits from '../hooks/useSavedOutfits.js';
import OutfitCard from './OutfitCard.jsx';
import CriticScore from './CriticScore.jsx';

/**
 * SavedLooks — displays user's saved outfits with rating and removal.
 * Reads/writes directly to LocalStorage via useSavedOutfits hook.
 */
function SavedLooks() {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'rated' | 'unrated'
  const { savedOutfits, removeOutfit, rateOutfit } = useSavedOutfits();

  // Filter
  const filtered = savedOutfits.filter(o => {
    if (filter === 'rated') return o.rating > 0;
    if (filter === 'unrated') return o.rating === 0;
    return true;
  });

  const occasionCounts = {};
  savedOutfits.forEach(o => {
    occasionCounts[o.occasion] = (occasionCounts[o.occasion] || 0) + 1;
  });
  const occasions = Object.keys(occasionCounts);

  return (
    <div className="section-pad saved-looks">
      <div className="section-title">My Saved Looks</div>
      <div className="section-sub">
        {savedOutfits.length > 0
          ? `${savedOutfits.length} looks saved`
          : 'Save outfits to build your collection'}
      </div>

      {savedOutfits.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👗</div>
          <p>No saved looks yet. Go to the Outfit tab to generate and save your first look!</p>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div className="sl-stats">
            <div className="sl-stat">
              <span className="sl-stat-val">{savedOutfits.length}</span>
              <span className="sl-stat-lbl">Total</span>
            </div>
            <div className="sl-stat">
              <span className="sl-stat-val">{savedOutfits.filter(o => o.rating > 0).length}</span>
              <span className="sl-stat-lbl">Rated</span>
            </div>
            <div className="sl-stat">
              <span className="sl-stat-val">{savedOutfits.filter(o => o.rating >= 4).length}</span>
              <span className="sl-stat-lbl">Loved</span>
            </div>
            <div className="sl-stat">
              <span className="sl-stat-val">{occasions.length}</span>
              <span className="sl-stat-lbl">Occasions</span>
            </div>
          </div>

          {/* Filters */}
          <div className="sl-filters">
            <button
              className={`sl-filter-btn${filter === 'all' ? ' active' : ''}`}
              onClick={() => setFilter('all')}
            >All</button>
            <button
              className={`sl-filter-btn${filter === 'rated' ? ' active' : ''}`}
              onClick={() => setFilter('rated')}
            >Rated</button>
            <button
              className={`sl-filter-btn${filter === 'unrated' ? ' active' : ''}`}
              onClick={() => setFilter('unrated')}
            >Unrated</button>
          </div>

          {/* Saved looks list */}
          <div className="sl-list">
            {filtered.map(o => (
              <div key={o.id} className="sl-item">
                <div className="sl-item-header">
                  <div className="sl-item-meta">
                    <span className="sl-item-name">{o.name}</span>
                    <span className="sl-item-occasion">{o.occasion}</span>
                    <span className="sl-item-date">
                      {new Date(o.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                <OutfitCard
                  outfit={o.result?.outfit}
                  showActions
                  rating={o.rating}
                  onRate={(r) => rateOutfit(o.id, r)}
                  onRemove={() => removeOutfit(o.id)}
                />

                {/* Critic score toggle */}
                {o.result?.critique && (
                  <div className="sl-critic-toggle" onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                    <span>🔍 Why This Outfit?</span>
                    <span>{expandedId === o.id ? '▲' : '▼'}</span>
                  </div>
                )}
                {expandedId === o.id && o.result?.critique && (
                  <CriticScore
                    critique={o.result.critique}
                    weatherContext={o.result.weatherContext}
                  />
                )}

                <div className="sl-item-divider" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(SavedLooks);
