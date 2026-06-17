// ─── Wardrobe Agent ────────────────────────────────────────────────────────────
// Curates product selections from the available pool based on profile + occasion.
// Never calls other agents — returns curated selections to orchestrator.

import type {
  WardrobeAgentInput,
  WardrobeAgentOutput,
  WardrobeSelection,
  Product,
} from './types';
import * as logger from './logger';

const AGENT = 'WardrobeAgent';
const DEFAULT_BUDGET = 250;

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Match products against style tags from the user's profile and occasion.
 */
function filterByStyleTags(pool: Product[], tags: string[]): Product[] {
  if (tags.length === 0) return pool;
  const lowerTags = tags.map(t => t.toLowerCase());
  return pool.filter(p =>
    p.style.some(s => lowerTags.includes(s.toLowerCase()))
  );
}

/**
 * Filter products by category, returning best matches sorted by style relevance.
 */
function filterByCategory(
  pool: Product[],
  category: string,
  styleTags: string[],
  count: number
): Product[] {
  const candidates = pool.filter(p => p.cat.toLowerCase() === category.toLowerCase());
  if (candidates.length === 0) return [];

  // Score by style tag overlap, then sort
  const scored = candidates.map(p => {
    const overlap = p.style.filter(s =>
      styleTags.some(t => t.toLowerCase() === s.toLowerCase())
    ).length;
    return { product: p, score: overlap * 10 + (p.trend || 50) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.product);
}

/**
 * Select the best single product for a category within budget.
 * Returns null if no affordable product exists.
 */
function pickAffordable(
  pool: Product[],
  category: string,
  styleTags: string[],
  maxPrice: number
): Product | null {
  const candidates = pool.filter(
    p => p.cat.toLowerCase() === category.toLowerCase() && p.price <= maxPrice
  );
  if (candidates.length === 0) return null;

  // Score by style tag overlap + trendiness
  const scored = candidates.map(p => {
    const overlap = p.style.filter(s =>
      styleTags.some(t => t.toLowerCase() === s.toLowerCase())
    ).length;
    return {
      product: p,
      score: overlap * 15 + (p.trend || 50) - p.price * 0.1,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].product;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Curate a set of product selections given profile, occasion, and budget.
 * Always returns a valid WardrobeAgentOutput — never throws.
 */
export async function curateWardrobe(input: WardrobeAgentInput): Promise<WardrobeAgentOutput> {
  const start = Date.now();
  const warnings: string[] = [];

  logger.info(AGENT, 'Curating wardrobe', {
    occasion: input.occasion,
    budget: input.budget,
    profile: input.profile.archetype.id,
  });

  try {
    // Import product pool
    const { PRODUCTS } = await import('../data/products');
    const pool: Product[] = PRODUCTS;

    // Determine effective budget
    const effectiveBudget = input.budget ?? DEFAULT_BUDGET;
    let remaining = effectiveBudget;

    // Build style tags from profile + occasion classification
    const styleTags = [...input.profile.styleTags];

    // Try importing occasion map for additional tags
    try {
      const { OCCASION_MAP } = await import('../data/occasionMap');
      for (const [, entry] of Object.entries(OCCASION_MAP)) {
        const e = entry as { keywords: string[]; styleTags: string[] };
        if (e.keywords.some(k => input.occasion.toLowerCase().includes(k))) {
          for (const tag of e.styleTags) {
            if (!styleTags.includes(tag)) styleTags.push(tag);
          }
        }
      }
    } catch {
      logger.warn(AGENT, 'Could not load occasion map');
    }

    // Filter pool by style tags
    const filtered = filterByStyleTags(pool, styleTags);
    if (filtered.length === 0) {
      warnings.push('No products matched style tags — using unfiltered pool');
    }
    const workPool = filtered.length > 0 ? filtered : pool;

    // Determine categories to fill: required first, then preferred
    const categories = [
      ...input.requiredCategories.map(c => ({ cat: c, required: true })),
      ...input.preferredCategories
        .filter(c => !input.requiredCategories.includes(c))
        .map(c => ({ cat: c, required: false })),
    ];

    const selections: WardrobeSelection[] = [];
    const categoryCoverage: Record<string, boolean> = {};
    let fallbackApplied = false;

    // Phase 1: Fill required categories
    for (const { cat, required } of categories) {
      const product = pickAffordable(workPool, cat, styleTags, remaining);

      if (product) {
        selections.push({
          product,
          reason: `Best match for ${cat} matching "${input.profile.archetype.name}" style`,
          category: cat,
        });
        categoryCoverage[cat] = true;
        remaining -= product.price;
      } else if (required) {
        // Fallback: try from full pool without style filter
        const fallback = pickAffordable(pool, cat, styleTags, remaining);
        if (fallback) {
          selections.push({
            product: fallback,
            reason: `Fallback — no style match found for ${cat}`,
            category: cat,
          });
          categoryCoverage[cat] = true;
          remaining -= fallback.price;
          fallbackApplied = true;
          warnings.push(`Fallback used for required category: ${cat}`);
        } else {
          categoryCoverage[cat] = false;
          warnings.push(`Could not fill required category: ${cat}`);
        }
      }
    }

    const totalCost = selections.reduce((s, sel) => s + sel.product.price, 0);

    logger.info(AGENT, 'Wardrobe curated', {
      selections: selections.length,
      totalCost,
      budgetRemaining: remaining,
      fallbackApplied,
      duration: Date.now() - start,
    });

    return {
      selections,
      totalCost,
      categoryCoverage,
      budgetRemaining: remaining,
      fallbackApplied,
      warnings,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(AGENT, 'Wardrobe curation failed', { error: msg });
    warnings.push(`Wardrobe error: ${msg}`);
    return {
      selections: [],
      totalCost: 0,
      categoryCoverage: {},
      budgetRemaining: input.budget ?? DEFAULT_BUDGET,
      fallbackApplied: true,
      warnings,
    };
  }
}

export default { curateWardrobe };
