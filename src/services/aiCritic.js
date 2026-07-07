/**
 * AI-Powered Critic — uses Claude to generate a natural-language outfit critique.
 *
 * When online, sends outfit details to Claude and returns a structured critique
 * with a natural-language one-sentence verdict suitable for the verdictSource badge.
 * When offline or on error, the caller falls back to the deterministic CriticAgent.
 *
 * Uses the same `callAI` / `parseAIJSON` pattern as the existing AI services.
 */
import { callAI, parseAIJSON } from './ai.js';

// ─── Prompt Templates ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are FashionGPT's CriticAgent — a fashion critique specialist.

Analyze the outfit details and return a structured critique in valid JSON only (no markdown).

Return JSON with this exact shape:
{
  "scores": {
    "occasionFit": <0-100>,
    "budgetCompliance": <0-100>,
    "styleCoherence": <0-100>,
    "colorHarmony": <0-100>,
    "trendAlignment": <0-100>,
    "overall": <0-100>
  },
  "suggestions": ["string", "..."],
  "issues": ["string", "..."],
  "verdict": "<full multi-sentence critique of the outfit>",
  "approved": true/false,
  "naturalLanguageCritique": "<ONE crisp natural-language sentence explaining why this outfit works or doesn't — this appears in the verdict badge, so make it punchy and insightful>"
}

Rules:
- Scores must be 0-100 integers.
- "naturalLanguageCritique" must be ONE sentence — conversational, warm, specific to the outfit.
- "verdict" can be 2-3 sentences with full detail.
- "approved" is true if overall >= 60 AND issues <= 1.
- Be honest and specific — reference actual items, colors, brands from the outfit.`;

/**
 * Build the user message from the outfit and context.
 * @param {import('../agents/types').Outfit} outfit
 * @param {{ occasion: string, budget: number|null, profile: import('../agents/types').StyleProfile }} context
 * @returns {string}
 */
function buildUserMessage(outfit, context) {
  const items = outfit.items
    .map((i) => `  - ${i.brand} "${i.name}" (${i.cat || '?'}, ${i.color || '?'}, €${i.price ?? '?'})`)
    .join('\n');

  return [
    `Occasion: ${context.occasion}`,
    `Budget: ${context.budget != null ? `€${context.budget}` : 'No limit'}`,
    `Profile: ${context.profile?.archetype?.name || 'Unknown'}`,
    `Style tags: ${(context.profile?.styleTags || []).join(', ')}`,
    `\nItems:\n${items}`,
  ].join('\n');
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Call Claude to critique an outfit.
 * Returns null if offline or if the AI response is invalid.
 *
 * @param {import('../agents/types').Outfit} outfit
 * @param {{ occasion: string, budget: number|null, profile: import('../agents/types').StyleProfile }} context
 * @returns {Promise<{
 *   scores: import('../agents/types').CriticScores,
 *   suggestions: string[],
 *   issues: string[],
 *   verdict: string,
 *   approved: boolean,
 *   naturalLanguageCritique: string,
 * } | null>}
 */
export async function critiqueWithAI(outfit, context) {
  try {
    const userMessage = buildUserMessage(outfit, context);
    const text = await callAI(SYSTEM_PROMPT, userMessage, 800);

    if (!text) return null;

    const parsed = parseAIJSON(text);
    if (!parsed) return null;

    // Validate required fields
    const scores = parsed.scores;
    if (!scores || typeof scores.overall !== 'number') return null;

    // Ensure naturalLanguageCritique exists
    const naturalLanguageCritique =
      parsed.naturalLanguageCritique || parsed.verdict || '';

    return {
      scores: {
        occasionFit: clamp(scores.occasionFit ?? 50),
        budgetCompliance: clamp(scores.budgetCompliance ?? 50),
        styleCoherence: clamp(scores.styleCoherence ?? 50),
        colorHarmony: clamp(scores.colorHarmony ?? 50),
        trendAlignment: clamp(scores.trendAlignment ?? 50),
        overall: clamp(scores.overall ?? 50),
      },
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      verdict: typeof parsed.verdict === 'string' ? parsed.verdict : '',
      approved: parsed.approved === true,
      naturalLanguageCritique,
    };
  } catch (err) {
    console.warn('[AICritic] Critique failed, caller will fall back:', err.message);
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export default { critiqueWithAI };
