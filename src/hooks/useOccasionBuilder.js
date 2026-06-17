import { useState, useCallback } from 'react';
import { callAI } from '../services/ai.js';
import { parseOutfitFromProducts } from '../utils/outfit.js';

/**
 * Hook managing occasion builder state and logic.
 */
export default function useOccasionBuilder() {
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [occasionResult, setOccasionResult] = useState(null);
  const [occasionLoading, setOccasionLoading] = useState(false);

  const buildOccasionOutfit = useCallback(async (occ) => {
    setSelectedOccasion(occ.id);
    setOccasionResult(null);
    setOccasionLoading(true);
    try {
      const system = `You are FashionGPT, an AI stylist. Return ONLY valid JSON, no markdown, no explanation outside JSON.
Format: {"name":"[outfit name]","why":"[1 sentence why]","style_tip":"[1 practical tip]","trend_note":"[current trend this taps]"}`;
      const text = await callAI(
        system,
        `Build an outfit for: ${occ.label} (${occ.vibe}). Give it a creative name and explain the styling logic briefly.`
      );
      let meta = {};
      try {
        meta = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch {
        meta = {
          name: `${occ.label} Look`,
          why: 'Curated for your occasion',
          style_tip: 'Layer for versatility',
          trend_note: 'Touches on quiet luxury',
        };
      }
      const outfit = parseOutfitFromProducts('', occ.label);
      outfit.name = meta.name || `${occ.label} Look`;
      outfit.why = meta.why;
      setOccasionResult({ outfit, meta });
    } catch {
      setOccasionResult(null);
    }
    setOccasionLoading(false);
  }, []);

  return { selectedOccasion, occasionResult, occasionLoading, buildOccasionOutfit };
}
