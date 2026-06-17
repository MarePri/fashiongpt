import { useState, useCallback } from 'react';
import { PRODUCTS } from '../data/products.js';

/**
 * Hook managing capsule wardrobe state and logic.
 */
export default function useCapsuleWardrobe() {
  const [capsuleResult, setCapsuleResult] = useState(null);
  const [capsuleLoading, setCapsuleLoading] = useState(false);

  const buildCapsule = useCallback(() => {
    setCapsuleResult(null);
    setCapsuleLoading(true);
    try {
      const picks = [
        PRODUCTS.find(p => p.cat === 'Tops' && p.brand === 'Zara'),
        PRODUCTS.find(p => p.cat === 'Tops' && p.brand === 'Pull&Bear'),
        PRODUCTS.find(p => p.cat === 'Bottoms' && p.color === 'Black'),
        PRODUCTS.find(p => p.cat === 'Bottoms' && p.brand === 'Stradivarius'),
        PRODUCTS.find(p => p.cat === 'Dresses'),
        PRODUCTS.find(p => p.cat === 'Outerwear'),
        PRODUCTS.find(p => p.cat === 'Shoes' && p.brand === 'Zara'),
        PRODUCTS.find(p => p.cat === 'Shoes' && p.brand === 'Pull&Bear'),
        PRODUCTS.find(p => p.cat === 'Bags'),
        PRODUCTS.find(p => p.cat === 'Accessories' || p.cat === 'Loungewear'),
      ].filter(Boolean);
      const total = picks.reduce((s, p) => s + p.price, 0);
      const combos = Math.floor(picks.length * (picks.length - 1) * 1.4);
      setCapsuleResult({ picks, total, combos });
    } catch {
      setCapsuleLoading(false);
    }
    setCapsuleLoading(false);
  }, []);

  const reset = useCallback(() => {
    setCapsuleResult(null);
  }, []);

  return { capsuleResult, capsuleLoading, buildCapsule, reset };
}
