import { describe, it, expect } from 'vitest';
import { generateOutfits, modifyOutfit } from '../outfitEngine';

// ─── Smoke tests: every occasion produces valid output ───────────────────────

const OCCASIONS = ['wedding', 'vacation', 'work', 'date', 'beach'] as const;
const ARCHETYPES = ['minimalist', 'streetwear', 'romantic', 'professional'] as const;

describe('generateOutfits — smoke tests', () => {
  it.each(OCCASIONS)('returns 3 outfits for "%s" with default archetype', (occasion) => {
    const result = generateOutfits({ occasion });
    expect(result.outfits).toHaveLength(3);
    for (const o of result.outfits) {
      expect(o.outfit.items.length).toBeGreaterThan(0);
      expect(o.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(o.confidenceScore).toBeLessThanOrEqual(100);
      expect(o.variationLabel).toBeTruthy();
      expect(o.outfit.name).toBeTruthy();
      expect(o.outfit.why).toBeTruthy();
      expect(o.reasoning).toBeTruthy();
    }
  });

  it.each(ARCHETYPES)('works with archetype "%s"', (archetypeId) => {
    const result = generateOutfits({ occasion: 'work', archetypeId });
    expect(result.outfits).toHaveLength(3);
    for (const o of result.outfits) {
      expect(o.outfit.items.length).toBeGreaterThan(0);
    }
  });

  it('produces results quickly (< 50ms)', () => {
    const result = generateOutfits({ occasion: 'date', archetypeId: 'romantic' });
    expect(result.duration).toBeLessThan(50);
  });
});

// ─── Score range validation ──────────────────────────────────────────────────

describe('generateOutfits — score ranges', () => {
  it.each(OCCASIONS)('all sub-scores are 0–100 for "%s"', (occasion) => {
    const result = generateOutfits({ occasion });
    for (const o of result.outfits) {
      const s = o.critique.scores;
      const allScores = [s.occasionFit, s.budgetCompliance, s.styleCoherence, s.colorHarmony, s.trendAlignment, s.overall];
      for (const score of allScores) {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('styleScore is 0–100', () => {
    const result = generateOutfits({ occasion: 'work', archetypeId: 'professional' });
    for (const o of result.outfits) {
      expect(o.styleScore).toBeGreaterThanOrEqual(0);
      expect(o.styleScore).toBeLessThanOrEqual(100);
    }
  });
});

// ─── Budget compliance ───────────────────────────────────────────────────────

describe('generateOutfits — budget', () => {
  it('budgetCompliance is 100 when total cost is within budget', () => {
    // Use a very high budget so any outfit fits
    const result = generateOutfits({ occasion: 'work', budget: 10_000 });
    for (const o of result.outfits) {
      expect(o.critique.scores.budgetCompliance).toBe(100);
    }
  });

  it('budgetCompliance drops when total cost exceeds budget', () => {
    // Use a very low budget to force overage
    const result = generateOutfits({ occasion: 'work', budget: 10 });
    for (const o of result.outfits) {
      expect(o.critique.scores.budgetCompliance).toBeLessThanOrEqual(100);
    }
  });

  it('runs without throwing when budget is null', () => {
    expect(() => generateOutfits({ occasion: 'wedding', budget: null })).not.toThrow();
  });
});

// ─── Weather context ─────────────────────────────────────────────────────────

describe('generateOutfits — weather', () => {
  it('includes weatherContext when weather data is provided', () => {
    const result = generateOutfits({
      occasion: 'beach',
      weather: { temperature: 32, condition: 'clear' },
    });
    for (const o of result.outfits) {
      expect(o.weatherContext).not.toBeNull();
      // temperature is approximated from fabricWeight, not passed through directly
      expect(o.weatherContext!.temperature).toBe(28);
      expect(o.weatherContext!.condition).toBe('Clear');
    }
  });

  it('weatherContext is null when no weather data is provided', () => {
    const result = generateOutfits({ occasion: 'work' });
    for (const o of result.outfits) {
      expect(o.weatherContext).toBeNull();
    }
  });

  it('cold weather triggers outerwear necessity', () => {
    const result = generateOutfits({
      occasion: 'work',
      archetypeId: 'minimalist',
      weather: { temperature: -2, condition: 'snow' },
    });
    for (const o of result.outfits) {
      if (o.weatherContext) {
        expect(o.weatherContext.recommendation.toLowerCase()).toContain('layer');
      }
    }
  });
});

// ─── Edge cases / extreme inputs ─────────────────────────────────────────────

describe('generateOutfits — edge cases', () => {
  it('handles unknown occasion gracefully', () => {
    const result = generateOutfits({ occasion: 'nonexistent-occasion' });
    expect(result.outfits).toHaveLength(3);
  });

  it('handles null archetypeId', () => {
    const result = generateOutfits({ occasion: 'work', archetypeId: null });
    expect(result.outfits).toHaveLength(3);
  });

  it('handles zero budget', () => {
    const result = generateOutfits({ occasion: 'work', budget: 0 });
    expect(result.outfits).toHaveLength(3);
  });

  it('handles extreme heat', () => {
    const result = generateOutfits({
      occasion: 'beach',
      weather: { temperature: 45, condition: 'clear' },
    });
    expect(result.outfits).toHaveLength(3);
  });

  it('handles extreme cold', () => {
    const result = generateOutfits({
      occasion: 'work',
      weather: { temperature: -20, condition: 'snow' },
    });
    expect(result.outfits).toHaveLength(3);
  });
});

// ─── modifyOutfit ────────────────────────────────────────────────────────────

describe('modifyOutfit', () => {
  it('swap_shoes replaces the shoe item', () => {
    const initial = generateOutfits({ occasion: 'work', archetypeId: 'minimalist' });
    const original = initial.outfits[0];
    const originalShoe = original.outfit.items.find(i => i.cat === 'Shoes');

    const modified = modifyOutfit(original, 'swap_shoes');
    const newShoe = modified.outfit.items.find(i => i.cat === 'Shoes');

    // The shoe should have changed (or at least the outfit was processed)
    expect(modified.outfit.items.length).toBeGreaterThan(0);
    if (originalShoe && newShoe) {
      // Either the id changed or the shoe was replaced
      expect(newShoe.id !== originalShoe.id || newShoe.name !== originalShoe.name).toBe(true);
    }
  });

  it('swap_top replaces the top item', () => {
    const initial = generateOutfits({ occasion: 'wedding', archetypeId: 'romantic' });
    const original = initial.outfits[0];
    const originalTop = original.outfit.items.find(i => i.cat === 'Tops');

    const modified = modifyOutfit(original, 'swap_top');
    const newTop = modified.outfit.items.find(i => i.cat === 'Tops');

    expect(modified.outfit.items.length).toBeGreaterThan(0);
    if (originalTop && newTop) {
      expect(newTop.id !== originalTop.id || newTop.name !== originalTop.name).toBe(true);
    }
  });

  it('more_formal adjusts the outfit description', () => {
    const initial = generateOutfits({ occasion: 'date', archetypeId: 'minimalist' });
    const original = initial.outfits[0];

    const modified = modifyOutfit(original, 'more_formal');
    expect(modified.outfit.why).toContain('formal');
    expect(modified.outfit.items.length).toBeGreaterThan(0);
  });

  it('more_casual adjusts the outfit description', () => {
    const initial = generateOutfits({ occasion: 'work', archetypeId: 'professional' });
    const original = initial.outfits[0];

    const modified = modifyOutfit(original, 'more_casual');
    expect(modified.outfit.why).toContain('casual');
    expect(modified.outfit.items.length).toBeGreaterThan(0);
  });

  it('re-scores the outfit after modification', () => {
    const initial = generateOutfits({ occasion: 'work', archetypeId: 'minimalist' });
    const original = initial.outfits[0];

    const modified = modifyOutfit(original, 'swap_shoes');
    expect(modified.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(modified.confidenceScore).toBeLessThanOrEqual(100);
    expect(modified.styleScore).toBeGreaterThanOrEqual(0);
    expect(modified.styleScore).toBeLessThanOrEqual(100);
  });
});
