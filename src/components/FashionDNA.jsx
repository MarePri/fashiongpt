import React from 'react';
import ColorDot from './ColorDot.jsx';

/**
 * FashionDNA — style archetype quiz + result display.
 * @param {{
 *   archetypes: import('../types/index.js').Archetype[],
 *   selectedArchetype: string|null,
 *   dnaResult: import('../types/index.js').DnaResult|null,
 *   dnaLoading: boolean,
 *   buildFashionDNA: (a: import('../types/index.js').Archetype) => void,
 *   onReset: () => void
 * }} props
 */
export default function FashionDNA({ archetypes, selectedArchetype, dnaResult, dnaLoading, buildFashionDNA, onReset }) {
  return (
    <div className="section-pad" style={{ paddingBottom: 40 }}>
      <div className="section-title">FashionDNA</div>
      <div className="section-sub">Discover your personal style archetype.</div>

      {!dnaResult ? (
        <>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Which feels most like you?</div>
          <div className="dna-archetype-grid">
            {archetypes.map(a => (
              <div
                key={a.id}
                className={`archetype-card${selectedArchetype === a.id ? ' selected' : ''}`}
                onClick={() => buildFashionDNA(a)}
              >
                <div className="archetype-icon">{a.icon}</div>
                <div className="archetype-name">{a.name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{a.desc.slice(0, 40)}…</div>
              </div>
            ))}
          </div>
          {dnaLoading && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
              <div className="thinking-dots" style={{ justifyContent: 'center', marginBottom: 8 }}><span /><span /><span /></div>
              Analyzing your style DNA…
            </div>
          )}
        </>
      ) : (
        <div className="dna-result">
          <div className="dna-card">
            <div className="dna-profile-header">
              <div className="dna-big-icon">{dnaResult.archetype.icon}</div>
              <div>
                <div className="dna-name">{dnaResult.archetype.name}</div>
                <div className="dna-desc">{dnaResult.meta.headline}</div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Your palette</div>
            <div className="dna-colors">
              {dnaResult.archetype.colors.map(c => (
                <div className="color-dot-wrap" key={c}>
                  <ColorDot colorName={c} />
                  <span className="color-dot-label">{c}</span>
                </div>
              ))}
            </div>

            <div className="divider" />

            {[['Trend Sensitivity', 72], ['Style Confidence', dnaResult.meta.confidence || 84], ['Versatility', 68], ['Investment Mindset', 78]].map(([label, val]) => (
              <div className="dna-stat" key={label}>
                <div className="dna-stat-label">{label}</div>
                <div className="dna-stat-bar"><div className="dna-stat-fill" style={{ width: `${val}%` }} /></div>
                <div className="dna-stat-val">{val}</div>
              </div>
            ))}

            <div className="divider" />

            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Trending match</div>
            <div style={{ fontSize: 13, color: 'var(--accent2)', fontWeight: 500 }}>✦ {dnaResult.meta.trend_match}</div>

            <div style={{ marginTop: 12, background: 'rgba(201,130,107,0.08)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>WARDROBE GAP</div>
              <div style={{ fontSize: 13 }}>Add: <strong>{dnaResult.meta.missing}</strong></div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, marginTop: 14 }}>Best brands for you</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {dnaResult.archetype.brands.map(b => <span className="trend-brand-tag" key={b}>{b}</span>)}
            </div>
          </div>

          <button className="btn-ghost" style={{ width: '100%' }} onClick={onReset}>
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}
