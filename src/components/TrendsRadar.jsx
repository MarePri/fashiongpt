import React from 'react';

/**
 * TrendsRadar — current fashion trend display.
 * @param {{ trends: import('../types/index.js').Trend[] }} props
 */
function TrendsRadar({ trends }) {
  return (
    <div className="section-pad" style={{ paddingBottom: 40 }}>
      <div className="section-title">Trend Radar</div>
      <div className="section-sub">What's moving in fashion right now.</div>
      <div className="trend-list">
        {trends.map((t, i) => (
          <div className="trend-item" key={i}>
            <div className="trend-item-header">
              <span className="trend-name">{t.name}</span>
              <span className={`trend-dir ${t.dir}`}>{t.dir === 'up' ? '↑ Rising' : '↓ Fading'}</span>
            </div>
            <div className="trend-bar-wrap">
              <div
                className="trend-bar"
                style={{
                  width: `${t.pct}%`,
                  background: t.dir === 'up'
                    ? 'linear-gradient(90deg, var(--accent), var(--accent2))'
                    : 'linear-gradient(90deg, #555, #444)',
                }}
              />
            </div>
            <div className="trend-desc">{t.desc}</div>
            {t.brands.length > 0 && (
              <div className="trend-brands">
                {t.brands.map(b => <span className="trend-brand-tag" key={b}>{b}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(TrendsRadar);
