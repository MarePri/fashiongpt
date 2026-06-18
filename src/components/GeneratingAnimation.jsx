import React, { useState, useEffect, useRef } from 'react';
import { OutfitSkeleton } from './Skeleton.jsx';

/**
 * GeneratingAnimation — animated loading screen for outfit generation.
 *
 * Features:
 * - Cycling fashion icons
 * - Agent stage pipeline (Profile → Wardrobe → Outfit → Critic)
 * - Rotating style tips
 * - Breathing progress bar
 */
const ICONS = ['👗', '👔', '👠', '👜', '💍', '✨'];

const STAGES = [
  { id: 'profile', label: 'Analyzing your style profile', icon: '🧬' },
  { id: 'wardrobe', label: 'Curating pieces for the occasion', icon: '🗂' },
  { id: 'outfit', label: 'Building the perfect outfit', icon: '👔' },
  { id: 'critic', label: 'Scoring and refining', icon: '⭐' },
];

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
];

export default function GeneratingAnimation() {
  const [iconIndex, setIconIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Cycle icon every 600ms
    const iconInterval = setInterval(() => {
      setIconIndex(prev => (prev + 1) % ICONS.length);
    }, 600);

    // Cycle stage every 2.5s (simulates pipeline progression)
    const stageInterval = setInterval(() => {
      setStageIndex(prev => Math.min(prev + 1, STAGES.length - 1));
    }, 2500);

    // Rotate tips every 5s
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 5000);

    // Animate progress bar (smooth ramp over ~10s)
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Ease-in-out: slow start, fast middle, slow end
      const raw = Math.min(elapsed / 10000, 1);
      // Cubic ease-in-out
      const eased = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      setProgress(Math.min(eased * 100, 99)); // cap at 99% until done
    }, 200);

    return () => {
      clearInterval(iconInterval);
      clearInterval(stageInterval);
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const currentStage = STAGES[stageIndex];
  const progressWidth = `${Math.round(progress)}%`;

  return (
    <div className="section-pad outfit-gen">
      <div className="og-generating">
        {/* Animated icon */}
        <div className="og-gen-icon">{ICONS[iconIndex]}</div>
        <div className="og-generating-title">Creating your looks</div>

        {/* Agent stage pipeline */}
        <div className="og-gen-stages">
          {STAGES.map((stage, i) => (
            <div
              key={stage.id}
              className={`og-gen-stage ${
                i < stageIndex ? 'done' : i === stageIndex ? 'active' : 'pending'
              }`}
            >
              <div className="og-gen-stage-dot">
                {i < stageIndex ? '✓' : stage.icon}
              </div>
              <div className="og-gen-stage-label">{stage.label}</div>
            </div>
          ))}
        </div>

        {/* Current stage description */}
        <div className="og-gen-status">{currentStage.label}…</div>

        {/* Breathing progress bar */}
        <div className="og-gen-bar-track">
          <div
            className="og-gen-bar-fill"
            style={{ width: progressWidth }}
          />
        </div>

        {/* Rotating style tip */}
        <div className="og-gen-tip">
          <span className="og-gen-tip-icon">💡</span>
          <span className="og-gen-tip-text">{TIPS[tipIndex]}</span>
        </div>

        {/* Skeletons */}
        <div className="og-generating-looks">
          <OutfitSkeleton />
          <OutfitSkeleton />
          <OutfitSkeleton />
        </div>
      </div>
    </div>
  );
}
