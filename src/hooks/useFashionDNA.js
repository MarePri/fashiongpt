import { useState, useCallback } from 'react';
import { getFashionDNA } from '../services/ai.js';

/**
 * Hook managing FashionDNA state and logic.
 */
export default function useFashionDNA() {
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [dnaResult, setDnaResult] = useState(null);
  const [dnaLoading, setDnaLoading] = useState(false);

  const buildFashionDNA = useCallback(async (archetype) => {
    setSelectedArchetype(archetype.id);
    setDnaResult(null);
    setDnaLoading(true);
    try {
      const meta = await getFashionDNA(archetype);
      setDnaResult({ archetype, meta });
    } catch {
      setDnaResult(null);
    }
    setDnaLoading(false);
  }, []);

  const reset = useCallback(() => {
    setDnaResult(null);
    setSelectedArchetype(null);
  }, []);

  return { selectedArchetype, dnaResult, dnaLoading, buildFashionDNA, reset };
}
