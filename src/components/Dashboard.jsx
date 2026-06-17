import React from 'react';

/**
 * Dashboard — occasion builder grid + results.
 * @param {{
 *   occasions: import('../types/index.js').Occasion[],
 *   selectedOccasion: string|null,
 *   occasionResult: import('../types/index.js').OccasionResult|null,
 *   occasionLoading: boolean,
 *   buildOccasionOutfit: (occ: import('../types/index.js').Occasion) => void
 * }} props
 */
import OutfitCard from './OutfitCard.jsx';

const Dashboard = React.memo(function Dashboard({ occasions, selectedOccasion, occasionResult, occasionLoading, buildOccasionOutfit }) {
  return (
    <div className="section-pad" style={{ paddingBottom: 40 }}>
      <div className="section-title">Occasion Builder</div>
      <div className="section-sub">Pick an occasion and FashionGPT styles the look.</div>
      <div className="occasion-grid">
        {occasions.map(occ => (
          <div
            key={occ.id}
            className={`occasion-card${selectedOccasion === occ.id ? ' active' : ''}`}
            onClick={() => buildOccasionOutfit(occ)}
          >
            <div className="oc-icon">{occ.icon}</div>
            <div className="oc-label">{occ.label}</div>
            <div className="oc-vibe">{occ.vibe}</div>
          </div>
        ))}
      </div>

      {occasionLoading && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
          <div className="thinking-dots" style={{ justifyContent: 'center', marginBottom: 10 }}><span /><span /><span /></div>
          <div style={{ fontSize: 13 }}>Building your look…</div>
        </div>
      )}

      {occasionResult && !occasionLoading && (
        <div style={{ marginTop: 20, animation: 'fadeIn 0.4s' }}>
          <div className="ai-label" style={{ marginBottom: 12 }}>
            ✦ AI Styled · {occasions.find(o => o.id === selectedOccasion)?.label}
          </div>
          {occasionResult.meta.style_tip && (
            <div style={{ background: 'rgba(201,130,107,0.08)', border: '1px solid rgba(201,130,107,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: 'var(--accent2)' }}>
              💡 {occasionResult.meta.style_tip}
            </div>
          )}
          {occasionResult.meta.trend_note && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>Trend: {occasionResult.meta.trend_note}</div>
          )}
          <OutfitCard outfit={occasionResult.outfit} />
        </div>
      )}
    </div>
  );
});

export default Dashboard;
