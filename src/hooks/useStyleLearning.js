import { useState, useCallback, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'fashiongpt_style_learning';

/**
 * @typedef {Object} RatedLook
 * @property {string} outfitId
 * @property {string} outfitName
 * @property {number} rating - 1-5
 * @property {number} timestamp
 * @property {string[]} likedColors - colors extracted from this outfit (if rating >= 4)
 * @property {string[]} likedCategories - categories extracted from this outfit (if rating >= 4)
 */

/**
 * @typedef {Object} LearntPrefs
 * @property {string[]} likedColors - Colors that appear in high-rated outfits
 * @property {string[]} likedCategories - Categories that appear in high-rated outfits
 * @property {number} totalRatings - Total number of ratings given
 * @property {number} highRatings - Number of 4+ star ratings
 * @property {boolean} isLearning - true when totalRatings >= 3
 * @property {string} profileSummary - Human-readable summary of learned preferences
 */

/**
 * Load learning data from LocalStorage.
 */
function loadLearning() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ratings: [] };
    return JSON.parse(raw);
  } catch {
    return { ratings: [] };
  }
}

/**
 * useStyleLearning — tracks which styles, colors, and categories the user rates
 * highly, then exposes a "learning" signal that can be used to bias future outfit
 * generation. All data is deterministic (no real ML), making the demo transparent.
 *
 * @returns {{
 *   learntPrefs: LearntPrefs,
 *   trackRating: (outfitId: string, outfitName: string, rating: number, items?: object[]) => void,
 *   getBoostMessage: (items: object[]) => string | null,
 *   resetLearning: () => void,
 * }}
 */
export default function useStyleLearning() {
  const [data, setData] = useState(loadLearning);

  // Persist to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.warn('[useStyleLearning] Failed to persist to LocalStorage');
    }
  }, [data]);

  /**
   * Track a rating. If >= 4 stars, extract colors and categories from the
   * outfit items to build up learned preferences.
   */
  const trackRating = useCallback((outfitId, outfitName, rating, items = []) => {
    const likedColors = [];
    const likedCategories = [];
    if (rating >= 4 && items.length > 0) {
      const seenColors = new Set();
      const seenCats = new Set();
      for (const item of items) {
        const color = (item.color || '').toLowerCase().trim();
        const cat = (item.category || '').toLowerCase().trim();
        if (color && !seenColors.has(color)) {
          likedColors.push(color);
          seenColors.add(color);
        }
        if (cat && !seenCats.has(cat)) {
          likedCategories.push(cat);
          seenCats.add(cat);
        }
      }
    }
    const entry = {
      outfitId,
      outfitName,
      rating,
      timestamp: Date.now(),
      likedColors,
      likedCategories,
    };
    setData(prev => ({
      ratings: [...prev.ratings, entry],
    }));
  }, []);

  /**
   * Derive learned preferences from all high-rated (4+) outfits.
   */
  const learntPrefs = useMemo(() => {
    const { ratings } = data;
    const totalRatings = ratings.length;
    const highRatings = ratings.filter(r => r.rating >= 4).length;
    const isLearning = totalRatings >= 3;

    // Aggregate liked colors and categories from high-rated outfits
    const colorCounts = {};
    const catCounts = {};
    for (const r of ratings) {
      if (r.rating >= 4) {
        for (const c of r.likedColors) {
          colorCounts[c] = (colorCounts[c] || 0) + 1;
        }
        for (const c of r.likedCategories) {
          catCounts[c] = (catCounts[c] || 0) + 1;
        }
      }
    }

    // Sort by frequency, pick top 3
    const likedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([color]) => color);
    const likedCategories = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // Build human-readable summary
    let profileSummary = '';
    if (isLearning) {
      const parts = [];
      if (likedColors.length > 0) {
        parts.push(`prefers ${likedColors.join(', ')} tones`);
      }
      if (likedCategories.length > 0) {
        parts.push(`favors ${likedCategories.join(', ')}`);
      }
      profileSummary = parts.length > 0
        ? `Learned: ${parts.join('; ')}`
        : 'Style profile refining…';
    }

    return { likedColors, likedCategories, totalRatings, highRatings, isLearning, profileSummary };
  }, [data]);

  /**
   * Check if the current outfit items match any learned preferences and
   * return a human-readable boost message, or null if there's no match.
   */
  const getBoostMessage = useCallback((items = []) => {
    if (!learntPrefs.isLearning) return null;
    if (items.length === 0) return null;

    const outfitColors = items.map(i => (i.color || '').toLowerCase().trim()).filter(Boolean);
    const outfitCats = items.map(i => (i.category || '').toLowerCase().trim()).filter(Boolean);

    // Count how many of our learned preferences match
    const matchingColors = learntPrefs.likedColors.filter(c => outfitColors.includes(c));
    const matchingCats = learntPrefs.likedCategories.filter(c => outfitCats.includes(c));
    const totalMatches = matchingColors.length + matchingCats.length;

    if (totalMatches === 0) return null;

    const highCount = learntPrefs.highRatings;
    const detailParts = [];
    if (matchingColors.length > 0) {
      detailParts.push(`${matchingColors.join(', ')} tones`);
    }
    if (matchingCats.length > 0) {
      detailParts.push(matchingCats.join(', '));
    }

    return `✨ Boosted — you rated ${highCount} similar look${highCount > 1 ? 's' : ''} highly (${detailParts.join(', ')})`;
  }, [learntPrefs]);

  /**
   * Reset all learning data.
   */
  const resetLearning = useCallback(() => {
    setData({ ratings: [] });
  }, []);

  return { learntPrefs, trackRating, getBoostMessage, resetLearning };
}
