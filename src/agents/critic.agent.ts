// ─── Critic Agent ──────────────────────────────────────────────────────────────
// Reviews an outfit for style coherence, budget compliance, occasion fit.
// Has two paths:
//   1. AI-powered (Claude) — when online, generates natural-language critique
//   2. Deterministic rules — fallback when offline or AI fails
// Never calls other agents — returns critique to orchestrator.

import type {
  CriticAgentInput,
  CriticAgentOutput,
  CriticScores,
  Product,
} from './types';
import * as logger from './logger';
import { computeColorHarmony, getColorGroup, COLOR_GROUPS } from '../utils/colorHarmony';
import { isOfflineMode } from '../services/config';
import { critiqueWithAI } from '../services/aiCritic';

const AGENT = 'CriticAgent';

// ─── Score Clamping ──────────────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Matching Helpers ─────────────────────────────────────────────────────────

/**
 * Check if an item style matches the given occasion tags.
 */
function styleMatchesOccasion(
  itemTags: string[],
  occasionTags: string[]
): number {
  if (occasionTags.length === 0) return 0.7;
  const lowerItem = itemTags.map(t => t.toLowerCase());
  const lowerOccasion = occasionTags.map(t => t.toLowerCase());
  const matches = lowerItem.filter(t => lowerOccasion.includes(t)).length;
  const maxPossible = Math.min(lowerItem.length, lowerOccasion.length);
  if (maxPossible === 0) return 0.5;
  return matches / maxPossible;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Critique an outfit using AI (Claude) when online, falling back to
 * deterministic rule-based logic when offline or if the AI call fails.
 * Always returns a valid CriticAgentOutput — never throws.
 */
export async function critiqueOutfit(input: CriticAgentInput): Promise<CriticAgentOutput> {
  const start = Date.now();

  logger.info(AGENT, 'Critiquing outfit', {
    items: input.outfit.items.length,
    occasion: input.context.occasion,
    budget: input.context.budget,
  });

  // ── Path A: AI-powered critique (when online) ──────────────────────────
  if (!isOfflineMode()) {
    try {
      const aiResult = await critiqueWithAI(input.outfit, input.context);
      if (aiResult) {
        const duration = Date.now() - start;
        logger.info(AGENT, 'AI critique complete', {
          approved: aiResult.approved,
          overall: aiResult.scores.overall,
          duration,
        });
        return {
          approved: aiResult.approved,
          scores: aiResult.scores,
          suggestions: aiResult.suggestions,
          issues: aiResult.issues,
          verdict: aiResult.verdict,
          warnings: [],
          verdictSource: 'ai',
          naturalLanguageCritique: aiResult.naturalLanguageCritique || aiResult.verdict,
        };
      }
    } catch (err) {
      logger.warn(AGENT, 'AI critique failed, falling back to deterministic', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // ── Path B: Deterministic rule-based critique (offline / fallback) ────
  return deterministicCritique(input, start);
}

/**
 * Deterministic rule-based critique — the original scoring logic.
 * Extracted into its own function so the AI path can fall back cleanly.
 */
async function deterministicCritique(input: CriticAgentInput, start: number): Promise<CriticAgentOutput> {
  const warnings: string[] = [];

  try {
    const items = input.outfit.items;
    const profile = input.context.profile;
    const totalCost = items.reduce((s, i) => s + (i.price || 0), 0);
    const suggestions: string[] = [];
    const issues: string[] = [];

    // ═══ 1. Occasion Fit ═══
    // Check if items have styles that match the archetype/occasion
    const fitScores = items.map(() => 0.7); // Neutral baseline
    const occasionFit = clamp(Math.round(fitScores.reduce((s, v) => s + v, 0) / fitScores.length * 100));

    if (occasionFit < 50) {
      issues.push('Outfit does not align well with the selected occasion');
      suggestions.push('Consider swapping pieces for styles that better match the occasion');
    }

    // ═══ 2. Budget Compliance ═══
    let budgetCompliance: number;
    if (input.context.budget === null || input.context.budget === undefined) {
      budgetCompliance = 100;
    } else if (totalCost <= input.context.budget) {
      budgetCompliance = clamp(100 - Math.round((totalCost / input.context.budget - 0.5) * 40));
    } else {
      budgetCompliance = clamp(
        Math.round((1 - (totalCost - input.context.budget) / input.context.budget) * 100)
      );
      issues.push(`Exceeds budget by €${(totalCost - input.context.budget).toFixed(2)}`);
      suggestions.push(`Remove or replace the most expensive item to meet the €${input.context.budget} budget`);
    }

    // ═══ 3. Style Coherence ═══
    const brands = [...new Set(items.map(i => i.brand).filter(Boolean))];
    let styleCoherence = 75;
    if (brands.length === 1) {
      styleCoherence = 85;
    } else if (brands.length <= 3) {
      styleCoherence = 75;
    } else {
      styleCoherence = 60;
      suggestions.push('Consider reducing brand variety for a more cohesive look');
    }

    const profileBrands = profile.brandAffinities.map(b => b.brand);
    const alignedBrands = brands.filter(b => profileBrands.includes(b));
    if (alignedBrands.length === 0 && brands.length > 0) {
      styleCoherence = Math.max(40, styleCoherence - 15);
      suggestions.push('Try incorporating brands aligned with your style profile');
    }

    // ═══ 4. Color Harmony ═══
    const colorScore = computeColorHarmony(items);
    if (colorScore < 60) {
      issues.push('Poor color harmony between items');
      suggestions.push('Stick to a unified color palette — try neutrals with one accent');
    } else if (colorScore >= 85) {
      suggestions.push('Great color coordination throughout the outfit');
    }

    // ═══ 5. Trend Alignment ═══
    let trendAlignment = 70;
    try {
      const { TRENDS } = await import('../data/trends');
      const trendingBrands = new Set<string>();
      for (const t of TRENDS) {
        if (t.dir === 'up') {
          for (const b of t.brands) trendingBrands.add(b);
        }
      }
      const trendingCount = brands.filter(b => trendingBrands.has(b)).length;
      trendAlignment = clamp(50 + (trendingCount / Math.max(brands.length, 1)) * 40);
    } catch {
      logger.warn(AGENT, 'Could not load trend data for alignment scoring');
    }

    if (trendAlignment >= 80) {
      suggestions.push('Strong trend alignment — this outfit feels current');
    } else if (trendAlignment < 50) {
      suggestions.push('Consider adding pieces from trending brands for a fresher look');
    }

    // ═══ 6. Overall Score ═══
    const overall = clamp(Math.round(
      occasionFit * 0.25 +
      budgetCompliance * 0.20 +
      styleCoherence * 0.20 +
      colorScore * 0.20 +
      trendAlignment * 0.15
    ));

    // ═══ 7. Verdict ═══
    const approved = overall >= 60 && issues.length <= 1;
    let verdict: string;
    if (approved) {
      verdict = overall >= 85
        ? 'Excellent outfit — well styled, on-budget, and occasion-appropriate.'
        : 'Solid outfit — minor tweaks recommended for optimization.';
    } else {
      verdict = overall < 40
        ? 'Needs significant rework — revisit the core pieces and budget.'
        : 'Has potential but requires adjustments before finalizing.';
    }

    const scores: CriticScores = {
      occasionFit,
      budgetCompliance,
      styleCoherence,
      colorHarmony: colorScore,
      trendAlignment,
      overall,
    };

    const naturalLanguageCritique = verdict;

    if (issues.length > 0) {
      logger.warn(AGENT, 'Issues found', { issues, overall });
    } else {
      logger.info(AGENT, 'Deterministic critique complete', { approved, overall, duration: Date.now() - start });
    }

    return {
      approved,
      scores,
      suggestions,
      issues,
      verdict,
      warnings,
      verdictSource: 'rules',
      naturalLanguageCritique,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(AGENT, 'Deterministic critique failed', { error: msg });
    warnings.push(`Critique error: ${msg}`);
    return {
      approved: false,
      scores: { occasionFit: 50, budgetCompliance: 50, styleCoherence: 50, colorHarmony: 50, trendAlignment: 50, overall: 50 },
      suggestions: ['Unable to generate — critiquing error occurred'],
      issues: [`Analysis error: ${msg}`],
      verdict: 'Critique could not be completed due to an internal error.',
      warnings,
      verdictSource: 'rules',
      naturalLanguageCritique: 'Critique could not be completed due to an internal error.',
    };
  }
}

export default { critiqueOutfit };
