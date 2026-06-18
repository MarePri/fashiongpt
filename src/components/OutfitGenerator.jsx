import React, { useState, useCallback, useRef } from 'react';
import useOutfitGenerator from '../hooks/useOutfitGenerator.js';
import useSavedOutfits from '../hooks/useSavedOutfits.js';
import OutfitCard from './OutfitCard.jsx';
import CriticScore from './CriticScore.jsx';
import { OCCASIONS } from '../data/occasions.js';
import { ARCHETYPES } from '../data/archetypes.js';
import { OutfitSkeleton } from './Skeleton.jsx';

/**
 * OutfitGenerator — Multi-step structured outfit generation.
 * Step 1: Pick occasion + style preference + budget
 * Step 2: Generating 3 looks (loading state)
 * Step 3: Compare 3 looks, save/rate/regenerate
 */
export default function OutfitGenerator() {
  const generator = useOutfitGenerator();
  const saved = useSavedOutfits();

  const [step, setStep] = useState('input'); // 'input' | 'generating' | 'results' | 'error'
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [budget, setBudget] = useState('');
  const [looks, setLooks] = useState([]);
  const [expandedLook, setExpandedLook] = useState(null);
  const [activeVariation, setActiveVariation] = useState(0);
  const errorRef = useRef(null);

  // Archetypes for style variation (used for generating 3 different looks)
  const styleVariations = [
    { id: selectedArchetype, label: 'Your Style' },
    { id: selectedArchetype === 'minimalist' ? 'romantic' : selectedArchetype === 'romantic' ? 'professional' : 'minimalist', label: 'Alternative' },
    { id: null, label: 'Surprise Me' },
  ];

  /**
   * Run generation: trigger 3 look variants.
   */
  const handleGenerate = useCallback(async () => {
    if (!selectedOccasion) return;

    setStep('generating');
    setLooks([]);
    setExpandedLook(null);
    errorRef.current = null;

    const occasionObj = OCCASIONS.find(o => o.id === selectedOccasion);
    const occasionText = occasionObj ? `${occasionObj.label} — ${occasionObj.vibe}` : selectedOccasion;
    const budgetNum = budget ? parseFloat(budget) : null;
    const results = [];

    // Generate 3 looks with varying style parameters
    for (let i = 0; i < 3; i++) {
      try {
        const styleGoal = styleVariations[i]?.label || 'Versatile';
        const result = await generator.generate({
          occasion: occasionText,
          budget: budgetNum,
          archetypeId: styleVariations[i]?.id || undefined,
          styleGoal: `A ${styleGoal.toLowerCase()} look for ${occasionText}`,
        });
        if (result) {
          results.push({ ...result, variationIndex: i, variationLabel: styleVariations[i]?.label || 'Look' });
        }
      } catch (err) {
        console.warn(`[OutfitGenerator] Look ${i + 1} failed:`, err);
      }
    }

    if (results.length === 0) {
      setStep('error');
      errorRef.current = 'Could not generate outfits. Try again with different choices.';
      return;
    }

    setLooks(results);
    setStep('results');
    setActiveVariation(0);
  }, [selectedOccasion, selectedArchetype, budget, generator]);

  /**
   * Regenerate a single look.
   */
  const handleRegenerate = useCallback(async (index) => {
    if (!selectedOccasion) return;
    const occasionObj = OCCASIONS.find(o => o.id === selectedOccasion);
    const occasionText = occasionObj ? `${occasionObj.label} — ${occasionObj.vibe}` : selectedOccasion;
    const budgetNum = budget ? parseFloat(budget) : null;

    try {
      const result = await generator.generate({
        occasion: occasionText,
        budget: budgetNum,
        archetypeId: styleVariations[index]?.id || undefined,
        styleGoal: `A ${styleVariations[index]?.label || 'versatile'} look`,
      });
      if (result) {
        setLooks(prev => {
          const next = [...prev];
          next[index] = { ...result, variationIndex: index, variationLabel: styleVariations[index]?.label || 'Look' };
          return next;
        });
      }
    } catch (err) {
      console.warn(`[OutfitGenerator] Regeneration ${index + 1} failed:`, err);
    }
  }, [selectedOccasion, selectedArchetype, budget, generator]);

  /**
   * Save the active look.
   */
  const handleSave = useCallback((index) => {
    const look = looks[index];
    if (!look) return;
    const occasionLabel = OCCASIONS.find(o => o.id === selectedOccasion)?.label || selectedOccasion || 'Custom';
    saved.saveOutfit(
      look.outfit?.name || `Styled Look ${index + 1}`,
      occasionLabel,
      look,
      budget ? parseFloat(budget) : null
    );
  }, [looks, selectedOccasion, budget, saved]);

  /**
   * Rate a saved look (via the saved outfit ID after saving).
   */
  const handleRate = useCallback((id, rating) => {
    saved.rateOutfit(id, rating);
  }, [saved]);

  // ─── Step: INPUT — Pick occasion, style, budget ──────────────────────────

  if (step === 'input') {
    return (
      <div className="section-pad outfit-gen">
        <div className="section-title">Create Your Look</div>
        <div className="section-sub">Tell us the occasion and we'll style 3 complete outfits.</div>

        {/* Step indicator */}
        <div className="og-steps">
          <div className="og-step active"><span className="og-step-num">1</span> Occasion</div>
          <div className="og-step"><span className="og-step-num">2</span> Style</div>
          <div className="og-step"><span className="og-step-num">3</span> Generate</div>
        </div>

        {/* Occasion picker */}
        <div className="og-section">
          <div className="og-section-title">What's the occasion?</div>
          <div className="occasion-grid">
            {OCCASIONS.map(occ => (
              <div
                key={occ.id}
                className={`occasion-card${selectedOccasion === occ.id ? ' active' : ''}`}
                onClick={() => setSelectedOccasion(occ.id)}
              >
                <div className="oc-icon">{occ.icon}</div>
                <div className="oc-label">{occ.label}</div>
                <div className="oc-vibe">{occ.vibe}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Style preference */}
        <div className="og-section">
          <div className="og-section-title">Your style vibe</div>
          <div className="og-archetype-row">
            {ARCHETYPES.map(a => (
              <div
                key={a.id}
                className={`og-archetype-chip${selectedArchetype === a.id ? ' active' : ''}`}
                onClick={() => setSelectedArchetype(selectedArchetype === a.id ? null : a.id)}
              >
                <span className="og-arch-icon">{a.icon}</span>
                <span className="og-arch-name">{a.name}</span>
              </div>
            ))}
            <div
              className={`og-archetype-chip${selectedArchetype === null ? ' active' : ''}`}
              onClick={() => setSelectedArchetype(null)}
            >
              <span className="og-arch-icon">🎲</span>
              <span className="og-arch-name">Surprise Me</span>
            </div>
          </div>
        </div>

        {/* Budget (optional) */}
        <div className="og-section">
          <div className="og-section-title">Budget <span className="og-optional">(optional)</span></div>
          <div className="og-budget-row">
            <span className="og-euro">€</span>
            <input
              className="og-budget-input"
              type="number"
              min="0"
              step="10"
              placeholder="No limit"
              value={budget}
              onChange={e => setBudget(e.target.value)}
            />
            <div className="og-budget-chips">
              {[50, 100, 150, 200, 300].map(v => (
                <button
                  key={v}
                  className={`og-budget-chip${parseFloat(budget) === v ? ' active' : ''}`}
                  onClick={() => setBudget(budget === String(v) ? '' : String(v))}
                >€{v}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          className="btn-primary og-generate-btn"
          disabled={!selectedOccasion}
          onClick={handleGenerate}
        >
          ✦ Generate 3 Looks
        </button>
      </div>
    );
  }

  // ─── Step: GENERATING ────────────────────────────────────────────────────

  if (step === 'generating') {
    return (
      <div className="section-pad outfit-gen">
        <div className="og-generating">
          <div className="og-generating-icon">✦</div>
          <div className="og-generating-title">Creating your looks</div>
          <div className="og-generating-sub">Analyzing occasion, weather, and trends…</div>
          <div className="og-generating-bar-track">
            <div className="og-generating-bar-fill" />
          </div>
          <div className="og-generating-looks">
            <OutfitSkeleton />
            <OutfitSkeleton />
            <OutfitSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // ─── Step: ERROR ─────────────────────────────────────────────────────────

  if (step === 'error') {
    return (
      <div className="section-pad outfit-gen">
        <div className="og-error">
          <div className="og-error-icon">⚠️</div>
          <div className="og-error-title">Something went wrong</div>
          <div className="og-error-msg">{errorRef.current || 'Generation failed. Please try again.'}</div>
          <button className="btn-primary" onClick={() => setStep('input')}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Step: RESULTS — Compare 3 looks ─────────────────────────────────────

  const activeLook = looks[activeVariation];

  return (
    <div className="section-pad outfit-gen">
      <div className="og-results-header">
        <div className="section-title">Your 3 Looks</div>
        <div className="section-sub">
          {OCCASIONS.find(o => o.id === selectedOccasion)?.label || 'Styled for you'}
          {budget ? ` · €${budget} budget` : ''}
        </div>
      </div>

      {/* Look tabs */}
      <div className="og-look-tabs">
        {looks.map((look, i) => (
          <button
            key={i}
            className={`og-look-tab${activeVariation === i ? ' active' : ''}`}
            onClick={() => setActiveVariation(i)}
          >
            <span className="og-look-tab-label">{look.variationLabel || `Look ${i + 1}`}</span>
            <span className={`og-look-tab-score ${(look.critique?.scores?.overall || 0) >= 70 ? 'high' : 'low'}`}>
              {look.critique?.scores?.overall || '—'}
            </span>
          </button>
        ))}
      </div>

      {/* Active look */}
      {activeLook && (
        <div className="og-active-look">
          <OutfitCard
            outfit={activeLook.outfit}
            showActions
            onSave={() => handleSave(activeVariation)}
            onRegenerate={() => handleRegenerate(activeVariation)}
            isSaved={saved.isSaved(activeLook.outfit?.name || '')}
          />

          {/* Critic score breakdown */}
          <div className="og-critic-section">
            <div className="og-critic-toggle" onClick={() => setExpandedLook(expandedLook === activeVariation ? null : activeVariation)}>
              <span>🔍 Why This Outfit?</span>
              <span className="og-toggle-arrow">{expandedLook === activeVariation ? '▲' : '▼'}</span>
            </div>
            {expandedLook === activeVariation && (
              <CriticScore
                critique={activeLook.critique}
                styleScore={activeLook.styleScore}
                weatherContext={activeLook.weatherContext}
              />
            )}
          </div>

          {/* Generation details */}
          <div className="og-meta">
            <span className="og-meta-item">✦ Confidence: {activeLook.confidenceScore}%</span>
            <span className="og-meta-item">⏱ {activeLook.duration > 1000 ? `${(activeLook.duration / 1000).toFixed(1)}s` : `${activeLook.duration}ms`}</span>
            {activeLook.approved && <span className="og-meta-item og-approved">✓ Critic Approved</span>}
          </div>

          {/* Agent traces (debug) */}
          {activeLook.agentTraces && activeLook.agentTraces.length > 0 && (
            <details className="og-traces">
              <summary className="og-traces-summary">Execution details</summary>
              <div className="og-traces-list">
                {activeLook.agentTraces.map((t, i) => (
                  <div key={i} className={`og-trace-item ${t.success ? 'ok' : 'fail'}`}>
                    <span>{t.agent}</span>
                    <span>{t.duration}ms</span>
                    <span>{t.success ? '✓' : '✗'}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Bottom actions */}
      <div className="og-bottom-actions">
        <button className="btn-ghost" onClick={() => setStep('input')}>
          ← Change Options
        </button>
        <span className="og-saved-count">
          {saved.savedOutfits.length > 0 && `📁 ${saved.savedOutfits.length} saved`}
        </span>
      </div>
    </div>
  );
}
