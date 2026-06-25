import React, { useState, useEffect, useMemo } from 'react';

/**
 * StyleCoachInsight — Educational insight cards showing *why* an outfit works.
 *
 * Analyzes critique scores and surfaces actionable, educational tips:
 * - What each score means
 * - How to improve each dimension
 * - Color harmony principles at play
 * - Occasion-appropriate dressing tips
 */
export default function StyleCoachInsight({ critique, styleScore, weatherContext, occasion, archetypeId }) {
  const [rulesData, setRulesData] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  // Load rule data for educational content
  useEffect(() => {
    Promise.all([
      import('../rules/styleRules.ts').then(m => m.ARCHETYPE_PROFILES || {}).catch(() => ({})),
      import('../rules/occasionRules.ts').then(m => m.OCCASION_RULES || {}).catch(() => ({})),
      import('../rules/colorRules.ts').then(m => ({ computeColorScore: m.computeColorScore, scoreColorPair: m.scoreColorPair })).catch(() => ({})),
      import('../rules/weatherRules.ts').then(m => ({ getWeatherInfluence: m.getWeatherInfluence })).catch(() => ({})),
    ]).then(([archetypes, occasions, colorData]) => {
      setRulesData({ archetypes, occasions, ...colorData });
    });
  }, []);

  const scores = critique?.scores || {};
  const insights = useMemo(() => generateInsights(scores, styleScore, weatherContext, occasion, archetypeId, rulesData), [scores, styleScore, weatherContext, occasion, archetypeId, rulesData]);

  return (
    <div className="style-coach">
      <div className="style-coach-header">
        <span className="style-coach-icon">🧠</span>
        <span className="style-coach-title">Style Coach — Why This Works</span>
      </div>

      <div className="style-coach-grid">
        {insights.map((card, i) => (
          <div
            key={i}
            className={`style-coach-card ${card.tone}${activeCard === i ? ' expanded' : ''}`}
            onClick={() => setActiveCard(activeCard === i ? null : i)}
          >
            <div className="style-coach-card-header">
              <span className="style-coach-card-icon">{card.icon}</span>
              <div className="style-coach-card-meta">
                <span className="style-coach-card-title">{card.title}</span>
                <span className="style-coach-card-subtitle">{card.subtitle}</span>
              </div>
              <span className="style-coach-card-score">{card.score}</span>
            </div>
            <p className="style-coach-card-body">{card.body}</p>
            {card.tip && (
              <div className="style-coach-tip">
                <span className="style-coach-tip-icon">💡</span>
                <span className="style-coach-tip-text">{card.tip}</span>
              </div>
            )}
            {activeCard === i && card.details && (
              <div className="style-coach-details">
                {card.details.map((detail, j) => (
                  <div key={j} className="style-coach-detail-row">
                    <span className="style-coach-detail-bullet">•</span>
                    <span className="style-coach-detail-text">{detail}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="style-coach-toggle">
              {activeCard === i ? '▲ Show less' : '▼ Learn more'}
            </button>
          </div>
        ))}
      </div>

      {/* Archetype personality note */}
      {archetypeId && rulesData?.archetypes?.[archetypeId] && (
        <div className="style-coach-footer">
          <span className="style-coach-footer-icon">👤</span>
          <span className="style-coach-footer-text">
            Your <strong>{rulesData.archetypes[archetypeId].description}</strong> style profile influences these choices.
            Each look is tailored to your preferences.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Insight Generation ───────────────────────────────────────────────────

function generateInsights(scores, styleScore, weatherContext, occasion, archetypeId, rulesData) {
  const cards = [];

  // 1. Overall verdict card
  const overall = scores.overall || 75;
  const verdictTone = overall >= 80 ? 'excellent' : overall >= 65 ? 'good' : overall >= 50 ? 'fair' : 'needs-work';
  const verdictIcons = { excellent: '🏆', good: '👍', fair: '📋', 'needs-work': '🔧' };

  cards.push({
    icon: verdictIcons[verdictTone] || '📋',
    title: 'Overall Verdict',
    subtitle: verdictTone === 'excellent' ? 'Exceptional outfit'
      : verdictTone === 'good' ? 'Solid choice'
      : verdictTone === 'fair' ? 'Room to improve'
      : 'Needs adjustment',
    score: overall,
    tone: verdictTone,
    body: verdictTone === 'excellent'
      ? 'This outfit scores highly across all dimensions — occasion-appropriate, style-coherent, and on-trend.'
      : verdictTone === 'good'
        ? 'A well-put-together look with minor areas to refine for a polished finish.'
        : verdictTone === 'fair'
          ? 'The foundation is there, but some adjustments would elevate this look significantly.'
          : 'This look needs reworking — review the suggestions below for guidance on what to change.',
    tip: verdictTone === 'excellent'
      ? 'Save this look to your collection — it\'s a winner!'
      : verdictTone === 'good'
        ? 'Small tweaks can make a big difference — try the Customize tool to refine.'
        : 'Try regenerating with different style or occasion parameters.',
    details: [
      `Occasion Fit: ${scores.occasionFit || 70}/100 — ${scoreToRating(scores.occasionFit, 'occasion')}`,
      `Color Harmony: ${scores.colorHarmony || 70}/100 — ${scoreToRating(scores.colorHarmony, 'color')}`,
      `Style Coherence: ${scores.styleCoherence || 70}/100 — ${scoreToRating(scores.styleCoherence, 'style')}`,
      `Trend Alignment: ${scores.trendAlignment || 70}/100 — ${scoreToRating(scores.trendAlignment, 'trend')}`,
    ],
  });

  // 2. Occasion Fit
  const occScore = scores.occasionFit || 70;
  cards.push({
    icon: '📋',
    title: 'Occasion Fit',
    subtitle: occScore >= 80 ? 'Perfect for the occasion'
      : occScore >= 65 ? 'Good match'
      : 'Could be better',
    score: occScore,
    tone: occScore >= 70 ? 'good' : 'needs-work',
    body: occScore >= 80
      ? `The outfit's formality level, style tags, and color palette align well with the "${occasion || 'selected'}" occasion.`
      : occScore >= 65
        ? `Most pieces work for this occasion, but one or two items could be adjusted for a stronger match.`
        : `The current pieces don't strongly match the "${occasion || 'selected'}" occasion's style requirements.`,
    tip: occScore < 70
      ? 'Consider swapping casual pieces for more occasion-appropriate alternatives using the Customize tool.'
      : 'Great job matching the occasion — your style intuition is on point!',
    details: [
      'Formality is key — each occasion has an expected dress code that signals respect and awareness.',
      `Current formality score: ${occScore}/100.`,
      'Accessories can bridge the gap between casual and formal without replacing core pieces.',
    ],
  });

  // 3. Color Harmony
  const colorScore = scores.colorHarmony || 70;
  const colorExplanations = {
    excellent: 'The colors in this outfit work together harmoniously, creating visual balance.',
    good: 'Colors are generally well-matched, with a few combinations that could be refined.',
    fair: 'Some color pairings clash or lack contrast — the eye isn\'t guided smoothly across the look.',
    'needs-work': 'Multiple color combinations compete for attention, reducing overall cohesion.',
  };
  const colorTone = colorScore >= 80 ? 'excellent' : colorScore >= 65 ? 'good' : colorScore >= 50 ? 'fair' : 'needs-work';

  cards.push({
    icon: '🎨',
    title: 'Color Harmony',
    subtitle: colorScore >= 80 ? 'Well-balanced palette'
      : colorScore >= 65 ? 'Good color flow'
      : 'Needs color adjustment',
    score: colorScore,
    tone: colorTone,
    body: colorExplanations[colorTone] || 'Color analysis determines how well the items complement each other.',
    tip: colorScore < 70
      ? 'Adding a neutral anchor (white, black, navy, or beige) can instantly improve color harmony.'
      : 'Your color choices show good understanding of palette balance!',
    details: [
      'Monochromatic schemes (same color, different shades) are the safest for high harmony scores.',
      'Complementary colors (opposite on the wheel) create dynamic, confident looks.',
      'Analogous colors (adjacent on the wheel) feel harmonious and sophisticated.',
      'Tip: A neutral anchor piece prevents bold colors from clashing.',
    ],
  });

  // 4. Style Coherence
  const styleScoreVal = scores.styleCoherence || styleScore || 70;
  cards.push({
    icon: '✨',
    title: 'Style Coherence',
    subtitle: styleScoreVal >= 70 ? 'Strong aesthetic consistency'
      : styleScoreVal >= 50 ? 'Mixed style signals'
      : 'Inconsistent style direction',
    score: styleScoreVal,
    tone: styleScoreVal >= 70 ? 'good' : styleScoreVal >= 50 ? 'fair' : 'needs-work',
    body: styleScoreVal >= 70
      ? 'All pieces share compatible style tags, creating a unified aesthetic direction.'
      : styleScoreVal >= 50
        ? 'Some pieces align with your style profile, but others pull in different directions.'
        : 'The outfit mixes styles that don\'t naturally work together — consider a more focused approach.',
    tip: archetypeId
      ? `Your "${archetypeId}" profile prefers specific style tags — stick with pieces sharing those tags for maximum coherence.`
      : 'Try selecting an archetype (Minimalist, Streetwear, etc.) for more style-coherent results.',
    details: [
      'Style coherence measures how well items share style attributes (casual, formal, minimal, etc.).',
      'A focused palette of 2-3 style tags creates stronger looks than mixing every tag.',
      'Brand consistency also contributes — similar brand aesthetics reinforce the overall direction.',
    ],
  });

  // 5. Trend Alignment
  const trendScore = scores.trendAlignment || 70;
  cards.push({
    icon: '📈',
    title: 'Trend Alignment',
    subtitle: trendScore >= 80 ? 'Fresh and current'
      : trendScore >= 65 ? 'Seasonally appropriate'
      : 'Classic, not trendy',
    score: trendScore,
    tone: trendScore >= 70 ? 'good' : 'fair',
    body: trendScore >= 80
      ? 'The outfit incorporates trending pieces and styles — you\'ll look current and fashion-forward.'
      : trendScore >= 65
        ? 'The outfit is seasonally appropriate with some trendy touches.'
        : 'The focus is on timeless pieces rather than seasonal trends — a classic approach.',
    tip: trendScore < 70
      ? 'Adding one statement piece can elevate a classic look into current fashion territory.'
      : 'You\'re on trend! Try experimenting with one bold piece to push boundaries further.',
    details: [
      'Trend scores reflect how current each piece is. Higher numbers = more fashion-forward.',
      'A mix of 80% classic + 20% trendy pieces creates a balanced, wearable look.',
      'Trends change by season — check back regularly for refreshed recommendations.',
    ],
  });

  // 6. Weather Context (if available)
  if (weatherContext) {
    cards.push({
      icon: '🌤️',
      title: 'Weather Consideration',
      subtitle: `${weatherContext.temperature}°C · ${weatherContext.condition || 'Clear'}`,
      score: null,
      tone: 'info',
      body: weatherContext.description || `Dressed for ${weatherContext.temperature}°C weather.`,
      tip: weatherContext.recommendation || 'Check the forecast before finalizing your outfit.',
      details: [
        `Temperature: ${weatherContext.temperature}°C`,
        `Condition: ${weatherContext.condition || 'Clear'}`,
        weatherContext.recommendation ? `Pro tip: ${weatherContext.recommendation}` : '',
      ].filter(Boolean),
    });
  }

  return cards;
}

function scoreToRating(score, dimension) {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs improvement';
}
