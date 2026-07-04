import React, { createContext, useContext } from 'react';
import useStyleLearning from './useStyleLearning.js';

/**
 * StyleLearningContext — lifts useStyleLearning state to app level so
 * OutfitGenerator, Wardrobe, and other components share the same learned
 * preferences in real-time.
 *
 * Usage:
 *   // App.jsx (root)
 *   <StyleLearningProvider>
 *     <OutfitGenerator />
 *     <Wardrobe />
 *   </StyleLearningProvider>
 *
 *   // Any consuming component
 *   const styleLearn = useStyleLearningContext();
 *   styleLearn.trackRating(id, name, 5, items);
 *   styleLearn.learntPrefs.isLearning; // true after 3+ ratings
 *   styleLearn.getBoostMessage(items); // "Boosted — you rated 2 similar looks highly"
 */

const StyleLearningContext = createContext(null);

export function StyleLearningProvider({ children }) {
  const learning = useStyleLearning();
  return (
    <StyleLearningContext.Provider value={learning}>
      {children}
    </StyleLearningContext.Provider>
  );
}

/**
 * Hook for consuming the shared style-learning state from any component.
 */
export function useStyleLearningContext() {
  const ctx = useContext(StyleLearningContext);
  if (!ctx) {
    throw new Error(
      'useStyleLearningContext must be used within a <StyleLearningProvider>'
    );
  }
  return ctx;
}
