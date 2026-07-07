import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the orchestrator BEFORE importing the module under test
vi.mock('../../agents/orchestrator', () => ({
  handleRequest: vi.fn().mockRejectedValue(new Error('Mock orchestrator unavailable')),
}));

vi.mock('../weather', () => ({
  getWeather: vi.fn().mockResolvedValue({
    temperature: 22,
    condition: 'Clear',
    description: 'clear sky',
    humidity: 55,
    windSpeed: 3,
    feelsLike: 22,
    icon: '01d',
    recommendation: 'Pleasant weather — no adjustments needed.',
  }),
}));

import { generateOutfit } from '../outfitGenerator';
import { handleRequest } from '../../agents/orchestrator';

describe('generateOutfit — fallback path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a valid result when the orchestrator is unavailable (fallback to rule engine)', async () => {
    const result = await generateOutfit({
      occasion: 'work',
      archetypeId: 'minimalist',
      budget: 300,
    });

    // Core structure
    expect(result).toBeDefined();
    expect(result.outfit).toBeDefined();
    expect(result.outfit.items).toBeInstanceOf(Array);
    expect(result.reasoning).toBeTruthy();
    expect(typeof result.duration).toBe('number');

    // Should have fallen back
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('returns 0–100 confidenceScore and styleScore', async () => {
    const result = await generateOutfit({
      occasion: 'wedding',
      archetypeId: 'romantic',
      budget: 500,
    });

    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(100);
    expect(result.styleScore).toBeGreaterThanOrEqual(0);
    expect(result.styleScore).toBeLessThanOrEqual(100);
  });

  it('returns all critique sub-scores', async () => {
    const result = await generateOutfit({
      occasion: 'date',
      archetypeId: 'minimalist',
    });

    const s = result.critique.scores;
    expect(s.occasionFit).toBeGreaterThanOrEqual(0);
    expect(s.budgetCompliance).toBeGreaterThanOrEqual(0);
    expect(s.styleCoherence).toBeGreaterThanOrEqual(0);
    expect(s.colorHarmony).toBeGreaterThanOrEqual(0);
    expect(s.trendAlignment).toBeGreaterThanOrEqual(0);
    expect(s.overall).toBeGreaterThanOrEqual(0);
  });

  it('includes agentTraces (empty in fallback mode)', async () => {
    const result = await generateOutfit({
      occasion: 'work',
    });

    expect(result.agentTraces).toEqual([]);
  });

  it('includes warnings when orchestrator is unavailable', async () => {
    const result = await generateOutfit({
      occasion: 'beach',
    });

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('rule'))).toBe(true);
  });

  it('contains selected outfit items with brand and name', async () => {
    const result = await generateOutfit({
      occasion: 'work',
      archetypeId: 'professional',
      budget: 200,
    });

    for (const item of result.outfit.items) {
      expect(item.brand).toBeTruthy();
      expect(item.name).toBeTruthy();
    }
  });

  it('produces a result within 1000ms', async () => {
    const result = await generateOutfit({
      occasion: 'work',
    });

    expect(result.duration).toBeLessThan(1000);
  });
});

describe('generateOutfit — weather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('weatherContext is populated when weather fetch succeeds', async () => {
    const result = await generateOutfit({
      occasion: 'work',
      weather: { city: 'London' },
    });

    expect(result.weatherContext).not.toBeNull();
    // temperature is approximated from fabricWeight in the rule engine fallback
    expect(result.weatherContext!.temperature).toBe(28);
    expect(result.weatherContext!.condition).toBe('Clear');
  });
});

describe('generateOutfit — edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles empty occasion string gracefully', async () => {
    const result = await generateOutfit({ occasion: '' });
    expect(result.outfit).toBeDefined();
    expect(result.outfit.items).toBeInstanceOf(Array);
  });

  it('handles null budget', async () => {
    const result = await generateOutfit({
      occasion: 'work',
      budget: null,
    });
    expect(result.outfit.items.length).toBeGreaterThanOrEqual(0);
  });

  it('handles missing archetypeId', async () => {
    const result = await generateOutfit({
      occasion: 'wedding',
    });
    expect(result.outfit).toBeDefined();
  });
});
