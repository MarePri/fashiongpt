import React, { useState, useCallback, useRef, useEffect } from 'react';
import useOutfitGenerator from '../hooks/useOutfitGenerator.js';
import { useSavedOutfitsContext } from '../hooks/SavedOutfitsContext.jsx';
import { useStyleMemoryContext } from '../hooks/StyleMemoryContext.jsx';
import OutfitCard from './OutfitCard.jsx';
import CriticScore from './CriticScore.jsx';
import GeneratingAnimation from './GeneratingAnimation.jsx';
import { OCCASIONS } from '../data/occasions.js';
import { ARCHETYPES } from '../data/archetypes.js';
import { OutfitSkeleton } from './Skeleton.jsx';

/**
 * OutfitGenerator — Multi-step structured outfit generation.
 * Step 1: Pick occasion + style preference + budget
 * Step 2: Generating 3 looks (loading state)
 * Step 3: Compare 3 looks, save/rate/regenerate
 *
 * Props:
 *   memory — useMemory hook (optional) for session persistence
 *   presetArchetype — archetype ID from Discovery (higher priority than memory)
 */
export default function OutfitGenerator({ memory }) {
  const generator = useOutfitGenerator();
  const saved = useSavedOutfitsContext();
  const styleMem = useStyleMemoryContext();

  // Restore inputs from session memory
  const initialOccasion = memory?.data?.lastInputs?.occasion || null;
  const initialArchetype = memory?.data?.lastInputs?.archetype || null;
  const initialBudget = memory?.data?.lastInputs?.budget || '';

  // If returning with previous results, show them immediately
  const initialStep = memory?.data?.lastResults && memory.isReturning ? 'results' : 'input';

  const [step, setStep] = useState(initialStep);
  const [selectedOccasion, setSelectedOccasion] = useState(initialOccasion);
  const [selectedArchetype, setSelectedArchetype] = useState(initialArchetype);
  const [budget, setBudget] = useState(initialBudget);
  const [looks, setLooks] = useState(() => {
    if (memory?.data?.lastResults && memory.isReturning) {
      return memory.data.lastResults;
    }
    return [];
  });
  const [showBanner, setShowBanner] = useState(memory?.isReturning ?? false);
  const [expandedLook, setExpandedLook] = useState(null);
  const [activeVariation, setActiveVariation] = useState(0);
  const [refiningIndex, setRefiningIndex] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const errorRef = useRef(null);

  // Close refine form when switching between looks
  useEffect(() => { setRefiningIndex(null); }, [activeVariation]);

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

    // Inject learned style memory into generation (personalization)
    const memPrefs = styleMem?.getPreferences() || {};
    const memSummary = styleMem?.getSummary() || '';

    // Generate 3 looks IN PARALLEL — ~3× faster than sequential
    const promises = [0, 1, 2].map((i) => {
      const variationLabel = styleVariations[i]?.label || 'Versatile';
      const variationGoal = memSummary
        ? `A ${variationLabel.toLowerCase()} look for ${occasionText}. ${memSummary}`
        : `A ${variationLabel.toLowerCase()} look for ${occasionText}`;
      return generator
        .generate({
          occasion: occasionText,
          budget: budgetNum,
          archetypeId: styleVariations[i]?.id || undefined,
          styleGoal: variationGoal,
          preferredCategories: memPrefs.preferredCategories,
        })
        .then((result) =>
          result
            ? { ...result, variationIndex: i, variationLabel: styleVariations[i]?.label || 'Look' }
            : null
        )
        .catch((err) => {
          console.warn(`[OutfitGenerator] Look ${i + 1} failed:`, err);
          return null;
        });
    });

    const results = (await Promise.all(promises)).filter(Boolean);

    if (results.length === 0) {
      setStep('error');
      errorRef.current = 'Could not generate outfits. Try again with different choices.';
      return;
    }

    setLooks(results);
    setStep('results');
    setActiveVariation(0);
    setShowBanner(false);

    // Persist to session memory
    memory?.recordGeneration(
      { occasion: selectedOccasion, archetype: selectedArchetype, budget },
      results
    );
    styleMem?.recordGeneration(selectedOccasion, selectedArchetype);
  }, [selectedOccasion, selectedArchetype, budget, generator, memory, styleMem]);

  /**
   * Regenerate a single look.
   */
  const handleRegenerate = useCallback(async (index) => {
    if (!selectedOccasion) return;
    const occasionObj = OCCASIONS.find(o => o.id === selectedOccasion);
    const occasionText = occasionObj ? `${occasionObj.label} — ${occasionObj.vibe}` : selectedOccasion;
    const budgetNum = budget ? parseFloat(budget) : null;

    // Record the old look as a negative signal (user didn't want it)
    const oldLook = looks[index];
    if (oldLook) styleMem?.recordRegenerate(oldLook);

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
  }, [selectedOccasion, selectedArchetype, budget, generator, looks, styleMem]);

  /**
   * Refine a look with user feedback — re-runs generation with feedback appended to styleGoal.
   */
  const handleRefine = useCallback(async (index, feedback) => {
    if (!feedback.trim() || !selectedOccasion) return;
    const occasionObj = OCCASIONS.find(o => o.id === selectedOccasion);
    const occasionText = occasionObj ? `${occasionObj.label} — ${occasionObj.vibe}` : selectedOccasion;
    const budgetNum = budget ? parseFloat(budget) : null;

    setRefiningIndex(index);
    setFeedbackText('');

    // Inject style memory preference data
    const memPrefs = styleMem?.getPreferences() || {};
    const memSummary = styleMem?.getSummary() || '';

    try {
      const baseGoal = `A ${(styleVariations[index]?.label || 'versatile').toLowerCase()} look for ${occasionText}`;
      const feedbackSuffix = `User feedback: ${feedback.trim()}`;
      const fullGoal = memSummary
        ? `${baseGoal}. ${memSummary} ${feedbackSuffix}`
        : `${baseGoal}. ${feedbackSuffix}`;
      const result = await generator.generate({
        occasion: occasionText,
        budget: budgetNum,
        archetypeId: styleVariations[index]?.id || undefined,
        styleGoal: fullGoal,
        preferredCategories: memPrefs.preferredCategories,
      });
      if (result) {
        setLooks(prev => {
          const next = [...prev];
          next[index] = { ...result, variationIndex: index, variationLabel: styleVariations[index]?.label || 'Look' };
          return next;
        });
      }
    } catch (err) {
      console.warn(`[OutfitGenerator] Refine ${index + 1} failed:`, err);
    } finally {
      setRefiningIndex(null);
    }
  }, [selectedOccasion, selectedArchetype, budget, generator, styleMem]);

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
    // Record in style memory (learns user's taste)
    styleMem?.recordSave(look, selectedOccasion, selectedArchetype);
  }, [looks, selectedOccasion, selectedArchetype, budget, saved, styleMem]);

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
        {/* Welcome back banner */}
        {showBanner && memory?.lastSeenAgo && (
          <div className="og-banner">
            <div className="og-banner-icon">👋</div>
            <div className="og-banner-text">
              <strong>Welcome back!</strong> Your last visit was {memory.lastSeenAgo()}.
              {looks.length > 0 && (
                <span> Want to <button className="og-banner-link" onClick={() => setStep('results')}>see your last looks</button>?</span>
              )}
            </div>
            <button className="og-banner-close" onClick={() => setShowBanner(false)}>✕</button>
          </div>
        )}

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
    return <GeneratingAnimation />;
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
        <div className="section-title">
          Your 3 Looks
          {styleMem?.hasData && <span className="og-personalized-badge">✦ Personalized</span>}
        </div>
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

          {/* StyleCoach: Iterative Refinement */}
          {refiningIndex === activeVariation ? (
            <div className="og-refine-box">
              <div className="og-refine-spinner" />
              <span className="og-refine-label">Refining your look…</span>
            </div>
          ) : (
            <div className="og-refine-section">
              <button
                className="og-refine-toggle"
                onClick={() => {
                  setRefiningIndex(-1); // will use -1 as "show input" sentinel
                  setFeedbackText('');
                }}
              >
                ✨ StyleCoach — Refine This Look
              </button>
              {refiningIndex === -1 && (
                <div className="og-refine-form">
                  <input
                    className="og-refine-input"
                    type="text"
                    placeholder='e.g. "more colorful", "less formal", "add accessories"'
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        setRefiningIndex(null);
                        handleRefine(activeVariation, feedbackText);
                      }
                      if (e.key === 'Escape') setRefiningIndex(null);
                    }}
                    autoFocus
                  />
                  <div className="og-refine-form-actions">
                    <button
                      className="og-refine-submit"
                      disabled={!feedbackText.trim()}
                      onClick={() => {
                        const fb = feedbackText;
                        setRefiningIndex(null);
                        handleRefine(activeVariation, fb);
                      }}
                    >
                      Refine →
                    </button>
                    <button className="og-refine-cancel" onClick={() => setRefiningIndex(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
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
