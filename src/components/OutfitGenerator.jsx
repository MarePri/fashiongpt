import React, { useState, useCallback, useRef, useEffect } from 'react';
import useOutfitGenerator from '../hooks/useOutfitGenerator.js';
import { useSavedOutfitsContext } from '../hooks/SavedOutfitsContext.jsx';
import { useStyleMemoryContext } from '../hooks/StyleMemoryContext.jsx';
import OutfitCard from './OutfitCard.jsx';
import CriticScore from './CriticScore.jsx';
import GeneratingAnimation from './GeneratingAnimation.jsx';
import InteractiveOutfitBuilder from './InteractiveOutfitBuilder.jsx';
import StyleCoachInsight from './StyleCoachInsight.jsx';
import OutfitBattle from './OutfitBattle.jsx';
import { OCCASIONS } from '../data/occasions.js';
import { ARCHETYPES } from '../data/archetypes.js';
import { OutfitSkeleton } from './Skeleton.jsx';
import WeatherWidget from './WeatherWidget.jsx';
import { isOfflineMode } from '../services/config.js';
import { generateOfflineLooks } from '../services/offlineEngine.js';

/**
 * OutfitGenerator — Multi-step structured outfit generation.
 * Step 1: Pick occasion + style preference + budget
 * Step 2: Generating 3 looks (loading state with magic animation)
 * Step 3: Compare 3 looks with "Why This Works", save/rate/regenerate
 */
export default function OutfitGenerator({ memory }) {
  const generator = useOutfitGenerator();
  const saved = useSavedOutfitsContext();
  const styleMem = useStyleMemoryContext();

  const initialOccasion = memory?.data?.lastInputs?.occasion || null;
  const initialArchetype = memory?.data?.lastInputs?.archetype || null;
  const initialBudget = memory?.data?.lastInputs?.budget || '';
  const initialStep = memory?.data?.lastResults && memory.isReturning ? 'results' : 'input';

  const [step, setStep] = useState(initialStep);
  const [selectedOccasion, setSelectedOccasion] = useState(initialOccasion);
  const [selectedArchetype, setSelectedArchetype] = useState(initialArchetype);
  const [budget, setBudget] = useState(initialBudget);
  const [looks, setLooks] = useState(() => {
    if (memory?.data?.lastResults && memory.isReturning) return memory.data.lastResults;
    return [];
  });
  const [showBanner, setShowBanner] = useState(memory?.isReturning ?? false);
  const [expandedLook, setExpandedLook] = useState(null);
  const [activeVariation, setActiveVariation] = useState(0);
  const [refiningIndex, setRefiningIndex] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [customizingIndex, setCustomizingIndex] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [saveToast, setSaveToast] = useState(null);
  const [genStage, setGenStage] = useState(-1);
  const [genProgress, setGenProgress] = useState(0);
  const genTimerRef = useRef(null);
  const errorRef = useRef(null);

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
    styleMem?.recordSave(look, selectedOccasion, selectedArchetype);

    // Show save celebration toast
    const totalSaved = saved.savedOutfits.length + 1;
    setSaveToast({
      message: totalSaved === 1
        ? '🎉 First look saved! Your style journey begins.'
        : totalSaved === 5
          ? '🌟 5 looks saved! FashionGPT is learning your style.'
          : totalSaved === 10
            ? '🏆 10 looks saved! You\'re building a style library.'
            : totalSaved === 25
              ? '👑 25 looks saved! Style icon status.'
              : '❤️ Look saved!',
      emoji: totalSaved === 1 ? '🎉' : totalSaved === 5 ? '🌟' : totalSaved === 10 ? '🏆' : totalSaved === 25 ? '👑' : '✓',
    });
    setTimeout(() => setSaveToast(null), 3000);
  }, [looks, selectedOccasion, selectedArchetype, budget, saved, styleMem]);

  // Cleanup genTimer on unmount
  useEffect(() => {
    return () => {
      if (genTimerRef.current) {
        clearInterval(genTimerRef.current);
        genTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => { setRefiningIndex(null); }, [activeVariation]);

  // Fetch weather for outfit context on mount
  useEffect(() => {
    let cancelled = false;
    import('../services/weather.ts').then(({ getWeather }) => {
      getWeather({ city: 'Madrid' }).then(data => {
        if (!cancelled) setWeatherData(data);
      }).catch(() => {});
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Local keyboard shortcuts: 1-3 select look, s saves
  useEffect(() => {
    const handleKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (step !== 'results') return;
      const key = e.key.toLowerCase();
      if (key === '1') { e.preventDefault(); setActiveVariation(0); }
      if (key === '2') { e.preventDefault(); setActiveVariation(1); }
      if (key === '3') { e.preventDefault(); setActiveVariation(2); }
      if (key === 's' && looks[activeVariation]) { e.preventDefault(); handleSave(activeVariation); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [step, activeVariation, looks, handleSave]);

  const styleVariations = [
    { id: selectedArchetype, label: 'Your Style' },
    { id: selectedArchetype === 'minimalist' ? 'romantic' : selectedArchetype === 'romantic' ? 'professional' : 'minimalist', label: 'Alternative' },
    { id: null, label: 'Surprise Me' },
  ];

  // Style category names for looks
  const STYLE_CATEGORIES = ['Modern Classic', 'Contemporary Edge', 'Relaxed Luxe'];

  /**
   * Run generation: trigger 3 look variants in parallel.
   */
  const handleGenerate = useCallback(async () => {
    if (!selectedOccasion) return;

    setStep('generating');
    setLooks([]);
    setExpandedLook(null);
    setCompareMode(false);
    errorRef.current = null;

    // Start real-time progress tracking synced to actual generation time
    const genStartTime = Date.now();
    setGenStage(0);
    setGenProgress(0);
    genTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - genStartTime;
      // Map elapsed to agent stage (2.5s per stage = ~10s full pipeline)
      const stageDuration = 2500;
      const stage = Math.min(Math.floor(elapsed / stageDuration), 3);
      setGenStage(stage);
      // Progress: ease-in-out curve over ~10s, cap at 95% until done
      const raw = Math.min(elapsed / 10000, 1);
      const eased = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      setGenProgress(Math.round(eased * 95));
    }, 200);

    const occasionObj = OCCASIONS.find(o => o.id === selectedOccasion);
    const occasionText = occasionObj ? `${occasionObj.label} — ${occasionObj.vibe}` : selectedOccasion;
    const budgetNum = budget ? parseFloat(budget) : null;
    const memPrefs = styleMem?.getPreferences() || {};
    const memSummary = styleMem?.getSummary() || '';

    let results;

    // Offline mode: return seed outfits immediately (no API call)
    if (isOfflineMode()) {
      console.info('[OutfitGenerator] Offline mode — using seed outfits');
      const seeds = await generateOfflineLooks();
      results = seeds.map((seed, i) => ({
        ...seed,
        variationIndex: i,
        variationLabel: styleVariations[i]?.label || 'Look',
        styleCategory: STYLE_CATEGORIES[i] || 'Signature Style',
      }));
    } else {
      const promises = [0, 1, 2].map((i) => {
        const variationLabel = styleVariations[i]?.label || 'Versatile';
        const variationGoal = memSummary
          ? `${variationLabel} look for ${occasionText}. ${memSummary}`
          : `${variationLabel} look for ${occasionText}`;
        return generator
          .generate({
            occasion: occasionText,
            budget: budgetNum,
            archetypeId: styleVariations[i]?.id || undefined,
            styleGoal: variationGoal,
            preferredCategories: memPrefs.preferredCategories,
            weather: weatherData ? { city: 'Madrid' } : undefined,
          })
          .then((result) =>
            result
              ? {
                  ...result,
                  variationIndex: i,
                  variationLabel: styleVariations[i]?.label || 'Look',
                  styleCategory: STYLE_CATEGORIES[i] || 'Signature Style',
                }
              : null
          )
          .catch((err) => {
            console.warn(`[OutfitGenerator] Look ${i + 1} failed:`, err);
            return null;
          });
      });
      results = await Promise.all(promises);
    }

    // Clear progress timer (all paths: success, error, or component unmount)
    const clearGenTimer = () => {
      if (genTimerRef.current) {
        clearInterval(genTimerRef.current);
        genTimerRef.current = null;
      }
      setGenStage(4);
      setGenProgress(100);
    };

    if (results.length === 0) {
      clearGenTimer();
      setStep('error');
      errorRef.current = 'All generation attempts failed. The AI service may be temporarily unavailable.';
      return;
    }

    clearGenTimer();
    setLooks(results);
    setStep('results');
    setActiveVariation(0);
    setShowBanner(false);

    memory?.recordGeneration(
      { occasion: selectedOccasion, archetype: selectedArchetype, budget },
      results
    );
    styleMem?.recordGeneration(selectedOccasion, selectedArchetype);
  }, [selectedOccasion, selectedArchetype, budget, generator, memory, styleMem]);

  const handleModifyLook = useCallback((index, modifiedLook) => {
    setLooks(prev => {
      const next = [...prev];
      if (next[index] && modifiedLook) {
        next[index] = { ...next[index], ...modifiedLook };
      }
      return next;
    });
  }, []);

  const handleCustomizeToggle = useCallback((index) => {
    setCustomizingIndex(prev => prev === index ? null : index);
  }, []);

  const handleRegenerate = useCallback(async (index) => {
    if (!selectedOccasion) return;
    const occasionObj = OCCASIONS.find(o => o.id === selectedOccasion);
    const occasionText = occasionObj ? `${occasionObj.label} — ${occasionObj.vibe}` : selectedOccasion;
    const budgetNum = budget ? parseFloat(budget) : null;

    const oldLook = looks[index];
    if (oldLook) styleMem?.recordRegenerate(oldLook);

    try {
      const result = await generator.generate({
        occasion: occasionText,
        budget: budgetNum,
        archetypeId: styleVariations[index]?.id || undefined,
        styleGoal: `${styleVariations[index]?.label || 'Versatile'} look`,
      });
      if (result) {
        setLooks(prev => {
          const next = [...prev];
          next[index] = {
            ...result,
            variationIndex: index,
            variationLabel: styleVariations[index]?.label || 'Look',
            styleCategory: STYLE_CATEGORIES[index] || 'Signature Style',
          };
          return next;
        });
      }
    } catch (err) {
      console.warn(`[OutfitGenerator] Regeneration ${index + 1} failed:`, err);
    }
  }, [selectedOccasion, selectedArchetype, budget, generator, looks, styleMem]);

  const handleRefine = useCallback(async (index, feedback) => {
    if (!feedback.trim() || !selectedOccasion) return;
    const occasionObj = OCCASIONS.find(o => o.id === selectedOccasion);
    const occasionText = occasionObj ? `${occasionObj.label} — ${occasionObj.vibe}` : selectedOccasion;
    const budgetNum = budget ? parseFloat(budget) : null;

    setRefiningIndex(index);
    setFeedbackText('');

    const memPrefs = styleMem?.getPreferences() || {};
    const memSummary = styleMem?.getSummary() || '';

    try {
      const variationLabel = styleVariations[index]?.label || 'Versatile';
      const baseGoal = `${variationLabel} look for ${occasionText}`;
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
          next[index] = {
            ...result,
            variationIndex: index,
            variationLabel: styleVariations[index]?.label || 'Look',
            styleCategory: STYLE_CATEGORIES[index] || 'Signature Style',
          };
          return next;
        });
      }
    } catch (err) {
      console.warn(`[OutfitGenerator] Refine ${index + 1} failed:`, err);
    } finally {
      setRefiningIndex(null);
    }
  }, [selectedOccasion, selectedArchetype, budget, generator, styleMem]);

  const handleRate = useCallback((id, rating) => {
    saved.rateOutfit(id, rating);
  }, [saved]);

  // Feedback handler: records emotional reaction into style memory
  const handleFeedback = useCallback((lookIndex) => {
    return (type) => {
      const look = looks[lookIndex];
      if (!look) return;

      // Map emotional feedback to weighted signals
      const signalMap = {
        love: { rating: 5, weight: 3 },
        like: { rating: 4, weight: 1 },
        dislike: { rating: 2, weight: -2 },
      };

      const signal = signalMap[type];
      if (signal) {
        styleMem?.recordRate(look, signal.rating);
      }

      // If they love it, also auto-save
      if (type === 'love') {
        const occasionLabel = OCCASIONS.find(o => o.id === selectedOccasion)?.label || selectedOccasion || 'Custom';
        saved.saveOutfit(
          look.outfit?.name || `Styled Look ${lookIndex + 1}`,
          occasionLabel,
          look,
          budget ? parseFloat(budget) : null
        );
      }
    };
  }, [looks, styleMem, saved, selectedOccasion, budget]);

  // ─── Step: INPUT ──────────────────────────────────────────────────────────

  if (step === 'input') {
    return (
      <div className="section-pad outfit-gen">
        {/* ═══════════════════════════════════════════════════════
           QUICK GENERATE — 3-click outfit generation
           ═══════════════════════════════════════════════════════ */}
        <div className="og-quick-section">
          <button
            className="og-quick-btn"
            onClick={() => {
              const randomOccasion = OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)];
              const randomArch = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
              setSelectedOccasion(randomOccasion.id);
              setSelectedArchetype(randomArch.id);
              // Trigger generation on next tick after state settles
              setTimeout(() => {
                const btn = document.querySelector('.og-generate-btn');
                if (btn) btn.click();
              }, 50);
            }}
          >
            <span className="og-quick-btn-icon">⚡</span>
            <span>
              <div>Quick Generate</div>
              <div className="og-quick-btn-sub">Random occasion & style — 3 looks instantly</div>
            </span>
          </button>
          <div className="og-divider">or customize your look</div>
        </div>

        <div className="section-title">Create Your Look</div>
        <div className="section-sub">Tell us the occasion and we'll style 3 complete outfits.</div>

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

        <div className="og-steps">
          <div className="og-step active"><span className="og-step-num">1</span> Occasion</div>
          <div className="og-step"><span className="og-step-num">2</span> Style</div>
          <div className="og-step"><span className="og-step-num">3</span> Generate</div>
        </div>

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

        <WeatherWidget />

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
    return <GeneratingAnimation stage={genStage} progress={genProgress} />;
  }

  // ─── Step: ERROR ─────────────────────────────────────────────────────────

  if (step === 'error') {
    const isNetworkError = errorRef.current?.includes('fetch') || errorRef.current?.includes('network') || errorRef.current?.includes('NetworkError');
    const suggestion = isNetworkError
      ? 'The AI service may be unreachable. Check your internet or API proxy.'
      : 'Try different occasion or style choices and generate again.';

    return (
      <div className="section-pad outfit-gen">
        <div className="og-error">
          <div className="og-error-icon">⚠️</div>
          <div className="og-error-title">Generation Failed</div>
          <div className="og-error-msg">{errorRef.current || 'Could not generate outfits.'}</div>
          <div className="og-error-suggestion">{suggestion}</div>
          <button className="btn-primary" onClick={() => setStep('input')}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Step: RESULTS — Compare 3 looks ─────────────────────────────────────

  const activeLook = looks[activeVariation];
  const critique = activeLook?.critique;
  const activeScores = critique?.scores || {};

  return (
    <div className="section-pad outfit-gen">
      {/* Save celebration toast */}
      {saveToast && (
        <div className="og-save-toast" key={saveToast.message}>
          <span className="og-save-toast-icon">{saveToast.emoji}</span>
          <span className="og-save-toast-msg">{saveToast.message}</span>
        </div>
      )}

      <div className="og-results-header">
        <div className="section-title">
          Your 3 Looks
          {styleMem?.hasData && <span className="og-personalized-badge">✦ Personalized</span>}
        </div>
        <div className="section-sub">
          {OCCASIONS.find(o => o.id === selectedOccasion)?.label || 'Styled for you'}
          {budget ? ` · €${budget} budget` : ''}
          {weatherData && ` · ${weatherData.temperature}°C ${weatherData.condition}`}
        </div>
      </div>

      {/* Look tabs with scores */}
      <div className="og-look-tabs">
        {looks.map((look, i) => {
          const lookScore = look.critique?.scores?.overall || 75;
          return (
            <button
              key={i}
              className={`og-look-tab${activeVariation === i ? ' active' : ''}`}
              onClick={() => setActiveVariation(i)}
            >
              <span className="og-look-tab-label">{look.variationLabel || `Look ${i + 1}`}</span>
              <span className="og-look-tab-sub">{STYLE_CATEGORIES[i] || 'Signature'}</span>
              <span className={`og-look-tab-score ${lookScore >= 70 ? 'high' : 'low'}`}>
                {lookScore}
              </span>
            </button>
          );
        })}
        {/* Customize button */}
        <button
          className={`og-customize-btn${customizingIndex === activeVariation ? ' active' : ''}`}
          onClick={() => handleCustomizeToggle(activeVariation)}
          title={customizingIndex === activeVariation ? 'Close builder' : 'Customize this look'}
        >
          ✏️ {customizingIndex === activeVariation ? 'Done' : 'Customize'}
        </button>
      </div>

      {/* Compare mode toggle */}
      {looks.length > 1 && (
        <div className="og-compare-bar">
          <button
            className={`og-compare-toggle${compareMode ? ' active' : ''}`}
            onClick={() => setCompareMode(!compareMode)}
          >
            {compareMode ? '✕ Close Compare' : '⇄ Compare All 3'}
          </button>
        </div>
      )}

      {/* Outfit Battle — side-by-side with Pick Winner */}
      {compareMode ? (
        <OutfitBattle
          looks={looks}
          styleCategories={STYLE_CATEGORIES}
          onPickWinner={(index) => {
            setCompareMode(false);
            setActiveVariation(index);
          }}
          onRegenerate={handleRegenerate}
        />
      ) : (
        /* Single look view */
        activeLook && (
          <div className="og-active-look">
            <OutfitCard
              outfit={activeLook.outfit}
              scores={activeScores}
              showActions
              showWhyThisWorks={true}
              onSave={() => handleSave(activeVariation)}
              onRegenerate={() => handleRegenerate(activeVariation)}
              isSaved={saved.isSaved(activeLook.outfit?.name || '')}
              onFeedback={handleFeedback(activeVariation)}
            />

            {/* InteractiveOutfitBuilder: Customize this look */}
            {customizingIndex === activeVariation && (
              <InteractiveOutfitBuilder
                look={activeLook}
                onModify={(modifiedLook) => handleModifyLook(activeVariation, modifiedLook)}
                onClose={() => setCustomizingIndex(null)}
              />
            )}

            {/* StyleCoach: Educational Insight Cards */}
            <div className="og-critic-section">
              <div className="og-critic-toggle" onClick={() => setExpandedLook(expandedLook === activeVariation ? null : activeVariation)}>
                <span>🧠 StyleCoach — Why This Works</span>
                <span className="og-toggle-arrow">{expandedLook === activeVariation ? '▲' : '▼'}</span>
              </div>
              {expandedLook === activeVariation && (
                <StyleCoachInsight
                  critique={critique}
                  styleScore={activeLook.styleScore}
                  weatherContext={activeLook.weatherContext}
                  occasion={selectedOccasion}
                  archetypeId={selectedArchetype}
                />
              )}
            </div>

            {/* Refine */}
            {refiningIndex === activeVariation ? (
              <div className="og-refine-box">
                <div className="og-refine-spinner" />
                <span className="og-refine-label">Refining your look…</span>
              </div>
            ) : (
              <div className="og-refine-section">
                <button
                  className="og-refine-toggle"
                  onClick={() => { setRefiningIndex(-1); setFeedbackText(''); }}
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
                        if (e.key === 'Enter') { setRefiningIndex(null); handleRefine(activeVariation, feedbackText); }
                        if (e.key === 'Escape') setRefiningIndex(null);
                      }}
                      autoFocus
                    />
                    <div className="og-refine-form-actions">
                      <button className="og-refine-submit" disabled={!feedbackText.trim()} onClick={() => { const fb = feedbackText; setRefiningIndex(null); handleRefine(activeVariation, fb); }}>
                        Refine →
                      </button>
                      <button className="og-refine-cancel" onClick={() => setRefiningIndex(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
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
