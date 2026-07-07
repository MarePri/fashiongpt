import { describe, it, expect } from 'vitest';
import { generateOutfits, computePreferenceAlignment } from '../outfitEngine';
import { PRODUCTS } from '../../data/products.js';

describe('generateOutfits — style learning integration (regression)', () => {
  // Regression guard: generateOutfits previously threw
  // "ReferenceError: Cannot access 'boostMessages' before initialization"
  // on every call, because boostMessages was referenced before its `let`
  // declaration. This crashed the entire Outfit Generator (the app's hero
  // feature). Keep these two tests passing to catch any reintroduction.
  it('runs without throwing when no learned preferences are passed', () => {
    expect(() =>
      generateOutfits({
        occasion: 'work',
        archetypeId: 'minimalist',
        budget: 300,
        weather: { temperature: 20, condition: 'clear' },
      })
    ).not.toThrow();
  });

  it('runs without throwing when learned preferences are passed', () => {
    expect(() =>
      generateOutfits({
        occasion: 'work',
        archetypeId: 'minimalist',
        budget: 300,
        likedColors: ['navy'],
        likedCategories: ['Tops'],
      })
    ).not.toThrow();
  });
});

describe('computePreferenceAlignment — scoring behavior', () => {
  it('returns a zero score with no matches when no preferences are given', () => {
    const result = computePreferenceAlignment(PRODUCTS.slice(0, 3), undefined, undefined);
    expect(result.score).toBe(0);
    expect(result.matches).toEqual([]);
  });

  it('scores higher when items match a liked color than when they do not', () => {
    const itemWithLikedColor = PRODUCTS.find(p => p.color?.toLowerCase().includes('navy'));
    const itemWithoutLikedColor = PRODUCTS.find(p => !p.color?.toLowerCase().includes('navy'));

    expect(itemWithLikedColor).toBeTruthy();
    expect(itemWithoutLikedColor).toBeTruthy();

    const matched = computePreferenceAlignment([itemWithLikedColor!], ['navy'], undefined);
    const unmatched = computePreferenceAlignment([itemWithoutLikedColor!], ['navy'], undefined);

    expect(matched.score).toBeGreaterThan(unmatched.score);
    expect(matched.matches.length).toBeGreaterThan(0);
  });

  it('generateOutfits respects the archetype style profile\'s preferred colors', () => {
    // Minimalist archetype prefers Navy, Black, White, Beige, Grey.
    // The engine should pick items matching these colors via pickBest/scoreProduct.
    const result = generateOutfits({
      occasion: 'work',
      archetypeId: 'minimalist',
      budget: 300,
    });

    const minimalColors = ['navy', 'black', 'white', 'beige', 'grey'];
    const hasMatchingColor = result.outfits.some(o =>
      o.outfit.items.some(i =>
        minimalColors.some(c => i.color?.toLowerCase().includes(c))
      )
    );

    // At least one item across the 3 outfits should match the archetype's palette.
    expect(hasMatchingColor).toBe(true);
  });
});
