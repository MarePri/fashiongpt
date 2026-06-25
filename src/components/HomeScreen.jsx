import React, { useState, useEffect, useMemo } from 'react';
import { useStyleMemoryContext } from '../hooks/StyleMemoryContext.jsx';
import { useSavedOutfitsContext } from '../hooks/SavedOutfitsContext.jsx';
import { ARCHETYPES } from '../data/archetypes.js';
import { OCCASIONS } from '../data/occasions.js';
import WeatherWidget from './WeatherWidget.jsx';
import StyleMemoryPanel from './StyleMemoryPanel.jsx';
import DelightWidget from './DelightWidget.jsx';

/**
 * HomeScreen — Personal Stylist Dashboard.
 * The first thing the user sees. Should feel alive, personal, and magical.
 *
 * Sections:
 * 1. Greeting + time-of-day awareness
 * 2. Today's Style Insight (+ weather)
 * 3. Style DNA Snapshot
 * 4. Saved Looks Summary (recent favorites)
 * 5. Quick Actions
 * 6. Learning insights from Style Memory
 * 7. Delight moments (tips, stats)
 */
export default function HomeScreen({ memory, dna, onNavigate }) {
  const styleMem = useStyleMemoryContext();
  const saved = useSavedOutfitsContext();
  const [greeting, setGreeting] = useState('');
  const [timeIcon, setTimeIcon] = useState('☀️');
  const [styleTip, setStyleTip] = useState('');
  const [insightText, setInsightText] = useState('');
  const [showMilestone, setShowMilestone] = useState(true);

  // Time-aware greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
      setTimeIcon('🌅');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
      setTimeIcon('☀️');
    } else if (hour < 21) {
      setGreeting('Good evening');
      setTimeIcon('🌆');
    } else {
      setGreeting('Good night');
      setTimeIcon('🌙');
    }
  }, []);

  // Rotating style tips (delight)
  const TIPS = [
    'A well-fitted blazer instantly elevates any casual outfit.',
    'Contrasting textures (denim + silk + leather) create visual interest.',
    'The golden ratio for accessories: rule of three.',
    'Monochromatic outfits are universally flattering — play with shades.',
    'Your belt should match your shoes for a polished look.',
    'A statement accessory is worth more than a busy pattern.',
    'White sneakers work with almost every casual outfit.',
    'Layering adds depth: start light, layer darker.',
    'The hem of your trousers should just kiss the top of your shoes.',
    'Less is more — one bold piece, the rest neutral.',
    'Earth tones are having a moment — olive, rust, and terracotta.',
    'A silk scarf adds instant polish to any outfit.',
    'High-waisted bottoms elongate the legs — especially in monochrome.',
    'Double denim works if the washes are different enough.',
  ];

  useEffect(() => {
    setStyleTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  // Generate a personal insight from style memory
  useEffect(() => {
    const mem = styleMem?.memory;
    if (!mem || mem.totalSaves === 0) {
      setInsightText('Start saving outfits and FashionGPT will learn your style!');
      return;
    }

    // Build a personal insight
    const insights = [];

    const topBrands = Object.entries(mem.brandSignals || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
    if (topBrands.length > 0) {
      insights.push(`You gravitate toward ${topBrands.join(' & ')}`);
    }

    const topColors = Object.entries(mem.colorSignals || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
    if (topColors.length > 0) {
      insights.push(`Your palette leans ${topColors.join(' & ')}`);
    }

    const topCats = Object.entries(mem.categorySignals || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 1).map(([k]) => k);
    if (topCats.length > 0) {
      insights.push(`You love ${topCats[0]}`);
    }

    if (mem.totalSaves > 5) {
      const archetypeEntries = Object.entries(mem.archetypeSignals || {})
        .sort((a, b) => b[1] - a[1]);
      if (archetypeEntries.length > 0) {
        const topArch = archetypeEntries[0][0];
        const arch = ARCHETYPES.find(a => a.id === topArch);
        if (arch) {
          insights.unshift(`Your style DNA is ${arch.name}`);
        }
      }
    }

    setInsightText(insights.length > 0
      ? insights.join(' · ')
      : `You've saved ${mem.totalSaves} look${mem.totalSaves > 1 ? 's' : ''} so far!`
    );
  }, [styleMem?.memory]);

  // Recent favorites
  const recentFaves = useMemo(() => {
    return saved.savedOutfits
      .filter(o => o.rating >= 4)
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .slice(0, 3);
  }, [saved.savedOutfits]);

  // Style score improvement (progress tracking)
  const styleProgress = useMemo(() => {
    const mem = styleMem?.memory;
    if (!mem || mem.totalSaves === 0) return null;

    const totalRated = saved.savedOutfits.filter(o => o.rating > 0).length;
    const lovedCount = saved.savedOutfits.filter(o => o.rating >= 4).length;
    const avgRating = totalRated > 0
      ? (saved.savedOutfits.reduce((s, o) => s + (o.rating || 0), 0) / saved.savedOutfits.length).toFixed(1)
      : null;

    return {
      total: saved.savedOutfits.length,
      loved: lovedCount,
      rated: totalRated,
      avg: avgRating,
      generations: mem.totalGenerations,
    };
  }, [styleMem?.memory, saved.savedOutfits]);

  // Archetype info for display
  const archetypeInfo = useMemo(() => {
    const mem = styleMem?.memory;
    if (!mem) return null;
    const archEntries = Object.entries(mem.archetypeSignals || {})
      .sort((a, b) => b[1] - a[1]);
    if (archEntries.length === 0) return null;
    const topArchId = archEntries[0][0];
    const arch = ARCHETYPES.find(a => a.id === topArchId);
    return arch || null;
  }, [styleMem?.memory]);

  // Color display for archetype
  const archetypeColors = useMemo(() => {
    const mem = styleMem?.memory;
    if (!mem) return [];
    return Object.entries(mem.colorSignals || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);
  }, [styleMem?.memory]);

  return (
    <div className="home-screen">
      {/* ═══════════════════════════════════════════════════════════
         ONBOARDING: First-Visit Walkthrough
         ═══════════════════════════════════════════════════════════ */}
      {!memory?.data?.lastVisit && !styleMem?.hasData && (
        <div className="onboarding-overlay">
          <span className="onboarding-icon">✨</span>
          <h2 className="onboarding-title">Your <em>Personal AI Stylist</em></h2>
          <p className="onboarding-text">FashionGPT creates custom outfits from Inditex brands (Zara, Pull&Bear, Bershka & more) — styled for your occasion, budget, and personality.</p>
          <div className="onboarding-steps">
            <div className="onboarding-step">
              <span className="onboarding-step-icon">✨</span>
              <span className="onboarding-step-text"><strong>Generate</strong> — Pick an occasion and get 3 AI-styled looks</span>
            </div>
            <div className="onboarding-step">
              <span className="onboarding-step-icon">❤️</span>
              <span className="onboarding-step-text"><strong>Save & Rate</strong> — Your feedback teaches FashionGPT your taste</span>
            </div>
            <div className="onboarding-step">
              <span className="onboarding-step-icon">🧬</span>
              <span className="onboarding-step-text"><strong>Discover</strong> — Your Style DNA, Trend Radar, and Capsule Wardrobe</span>
            </div>
          </div>
          <button className="onboarding-cta" onClick={() => onNavigate?.('outfit')}>
            ✦ Generate My First Look
          </button>
          <button className="onboarding-dismiss" onClick={() => memory?.save?.({ lastVisit: Date.now() })}>
            I'll explore on my own →
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         SECTION 1: GREETING + TIME
         ═══════════════════════════════════════════════════════════ */}
      <div className="home-greeting-section">
        <div className="home-greeting-icon">{timeIcon}</div>
        <div className="home-greeting-text">
          <h1 className="home-greeting">{greeting}</h1>
          {memory?.data?.lastVisit ? (
            <p className="home-returning">
              Welcome back{memory.lastSeenAgo() ? ` · last seen ${memory.lastSeenAgo()}` : ''}
              {styleMem?.hasData && <span className="learning-indicator" style={{ marginLeft: 8 }}><span className="learning-dot" /> Learning</span>}
            </p>
          ) : (
            <p className="home-returning">Welcome to your personal style studio</p>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 2: TODAY'S STYLE INSIGHT
         ═══════════════════════════════════════════════════════════ */}
      <div className="home-insight-card">
        <div className="home-insight-header">
          <span className="home-insight-label">✦ TODAY'S STYLE INSIGHT</span>
          <span className="home-insight-badge">Personalized</span>
        </div>
        <p className="home-insight-text">{insightText}</p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 3: WEATHER + RECOMMENDED OUTFIT
         ═══════════════════════════════════════════════════════════ */}
      <WeatherWidget />

      {/* ═══════════════════════════════════════════════════════════
         SECTION 4: DELIGHT & WOW MOMENTS (rotating insights)
         ═══════════════════════════════════════════════════════════ */}
      <DelightWidget />

      {/* ═══════════════════════════════════════════════════════════
         SECTION 5: STYLE DNA SNAPSHOT
         ═══════════════════════════════════════════════════════════ */}
      {archetypeInfo && (
        <div className="home-dna-snapshot" onClick={() => onNavigate?.('dna')}>
          <div className="home-dna-header">
            <span className="home-dna-icon">{archetypeInfo.icon}</span>
            <div className="home-dna-info">
              <span className="home-dna-name">{archetypeInfo.name}</span>
              <span className="home-dna-desc">{archetypeInfo.desc}</span>
            </div>
            <span className="home-dna-arrow">→</span>
          </div>
          {archetypeColors.length > 0 && (
            <div className="home-dna-colors">
              {archetypeColors.map(c => (
                <span key={c} className="home-dna-swatch" title={c} style={{ background: colorToHex(c) }} />
              ))}
              <span className="home-dna-colors-label">your palette</span>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         MILESTONE: Style Journey Celebrations
         ═══════════════════════════════════════════════════════════ */}
      {showMilestone && (() => {
        const total = styleMem?.memory?.totalSaves || 0;
        if (total === 0) return null;
        const milestone = total === 1 ? { icon: '🌟', title: 'First Look Saved!', text: 'Your style journey has begun. FashionGPT is starting to learn what you love.' }
          : total === 5 ? { icon: '🔥', title: '5 Looks Saved!', text: 'FashionGPT is getting to know your style. Each save makes recommendations smarter.' }
          : total === 10 ? { icon: '🏆', title: 'Double Digits!', text: '10 looks saved — you\'re building a serious style library.' }
          : total === 25 ? { icon: '👑', title: 'Style Icon!', text: '25 looks! Your FashionGPT style profile is fully developed.' }
          : null;
        if (!milestone) return null;
        return (
          <div className="milestone-banner">
            <span className="milestone-icon">{milestone.icon}</span>
            <div className="milestone-content">
              <span className="milestone-title">{milestone.title}</span>
              <span className="milestone-text">{milestone.text}</span>
            </div>
            <button className="milestone-dismiss" onClick={() => setShowMilestone(false)}>✕</button>
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════════
         SECTION 5: STYLE PROGRESS
         ═══════════════════════════════════════════════════════════ */}
      {styleProgress && styleProgress.total > 0 && (
        <div className="home-progress-row">
          <div className="home-progress-stat">
            <span className="home-progress-val">{styleProgress.total}</span>
            <span className="home-progress-lbl">Saved Looks</span>
          </div>
          <div className="home-progress-stat">
            <span className="home-progress-val">{styleProgress.loved}</span>
            <span className="home-progress-lbl">Loved ❤️</span>
          </div>
          <div className="home-progress-stat">
            <span className="home-progress-val">{styleProgress.avg || '—'}</span>
            <span className="home-progress-lbl">Avg Rating</span>
          </div>
          <div className="home-progress-stat">
            <span className="home-progress-val">{styleProgress.generations}</span>
            <span className="home-progress-lbl">Generations</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         SECTION 6: RECENT FAVORITES
         ═══════════════════════════════════════════════════════════ */}
      {recentFaves.length > 0 && (
        <div className="home-section">
          <div className="home-section-header">
            <h3 className="home-section-title">Recent Favorites</h3>
            <button className="home-section-link" onClick={() => onNavigate?.('looks')}>See all →</button>
          </div>
          <div className="home-faves-row">
            {recentFaves.map(o => (
              <div key={o.id} className="home-fave-item">
                <div className="home-fave-icon">👗</div>
                <div className="home-fave-info">
                  <span className="home-fave-name">{o.name}</span>
                  <span className="home-fave-occasion">{o.occasion}</span>
                </div>
                <span className="home-fave-rating">{'★'.repeat(o.rating || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         SECTION 7: STYLE MEMORY — What FashionGPT Knows
         ═══════════════════════════════════════════════════════════ */}
      <StyleMemoryPanel />

      {/* ═══════════════════════════════════════════════════════════
         SECTION 8: QUICK ACTIONS
         ═══════════════════════════════════════════════════════════ */}
      <div className="home-quick-actions">
        <button className="home-action-card home-action-generate" onClick={() => onNavigate?.('outfit')}>
          <span className="home-action-icon">✨</span>
          <span className="home-action-title">Generate Outfit</span>
          <span className="home-action-desc">AI styles 3 complete looks</span>
        </button>
        <button className="home-action-card home-action-discover" onClick={() => onNavigate?.('discover')}>
          <span className="home-action-icon">🌍</span>
          <span className="home-action-title">Explore Trends</span>
          <span className="home-action-desc">What's in style right now</span>
        </button>
        <button className="home-action-card home-action-dna" onClick={() => onNavigate?.('dna')}>
          <span className="home-action-icon">🧬</span>
          <span className="home-action-title">Style Analysis</span>
          <span className="home-action-desc">Discover your DNA</span>
        </button>
        <button className="home-action-card home-action-looks" onClick={() => onNavigate?.('looks')}>
          <span className="home-action-icon">❤️</span>
          <span className="home-action-title">Saved Looks</span>
          <span className="home-action-desc">Your collection</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 9: STYLE TIP (Delight Moment)
         ═══════════════════════════════════════════════════════════ */}
      <div className="home-tip-card">
        <span className="home-tip-icon">💡</span>
        <div className="home-tip-content">
          <span className="home-tip-label">Today's Style Tip</span>
          <p className="home-tip-text">{styleTip}</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 10: FOOTER / LEARNING SIGNAL
         ═══════════════════════════════════════════════════════════ */}
      {styleMem?.hasData && (
        <div className="home-learning-signal">
          <span className="home-learning-dot" />
          <span>FashionGPT is learning your style with every interaction</span>
        </div>
      )}
    </div>
  );
}

/**
 * Simple color name → hex mapper.
 */
function colorToHex(name) {
  const map = {
    black: '#1a1a1a', white: '#f5f5f5', beige: '#f5e6d0', grey: '#9e9e9e',
    navy: '#1a2744', charcoal: '#36454f', camel: '#c19a6b', tan: '#d2b48c',
    cognac: '#9a4a2a', rust: '#b7410e', cobalt: '#0047ab', blush: '#f4c2c2',
    cream: '#fffdd0', gold: '#d4af37', silver: '#c0c0c0', floral: '#e8b4c8',
    ecru: '#c3b091', ivory: '#fffff0', champagne: '#f7e7ce', chocolate: '#7b3f00',
    slate: '#708090', 'dusty pink': '#dca3a3', sand: '#c2b280',
    multicolor: 'linear-gradient(90deg, #e74c3c, #f39c12, #2ecc71, #3498db, #9b59b6)',
  };
  return map[name?.toLowerCase()] || '#ccc';
}
