# Project Context — fashiongpt

## Environment
- Language: JavaScript (React) + TypeScript (Agents)
- Build: `npm run build` (vite, 75 modules, 0 errors)
- Test: `npm test` (vitest, jsdom, 6 tests pass)
- Package: npm

## Delivered This Session (13 commits)

### Phase 1 — Outfit Experience
- OutfitGenerator (3 looks, multi-step flow), CriticScore, SavedLooks, OutfitCard, tabs

### Phase 2 — Memory & Performance
- useMemory (session persistence), SavedOutfitsContext (real-time sync), parallel generation (Promise.all, 3×), GeneratingAnimation, Discovery screen

### Fixes
- Removed agent traces / og-meta debug UI
- Try This Look now uses key-based remount (tryLookNonce → fresh mount)

### Phase 3 — StyleCoach
- Refinement: feedback input in results, re-runs generation with feedback in styleGoal
- Enter to submit, Escape to cancel, spinner while refining

### Phase 4 — Code Splitting
- React.lazy for all 7 tabs + Suspense fallback
- Main chunk: 172 kB (was 227, -24%), 9 lazy chunks load on demand

## In Progress — Style Memory (Personalization)

### useStyleMemory.js (DONE)
- Tracks brands/categories/colors from saves (positive) and regenerations (negative)
- Weighted signals from ratings (4-5★ = strong positive, 1-2★ = negative)
- getPreferences() → UserPreferences-compatible object (preferredBrands, preferredCategories, excludedCategories)
- getSummary() → human-readable profile text for styleGoal injection
- localStorage key: `fashiongpt_style_memory`

### StyleMemoryContext.jsx (DONE)
- React context provider, consumer hook (useStyleMemoryContext)

### Pending: Wire into App.jsx & OutfitGenerator.jsx
- Add StyleMemoryProvider in App
- Pass styleMem context to OutfitGenerator
- On save: recordSave(result, occasionId, archetypeId)
- On rate: recordRate(result, rating)
- On regenerate: recordRegenerate(oldResult)
- Before generate: inject getPreferences() + getSummary() into payload

## Files Changed
- `src/hooks/useStyleMemory.js` (NEW — 225 lines)
- `src/hooks/StyleMemoryContext.jsx` (NEW — 42 lines)
- `src/App.jsx` (TBD)
- `src/components/OutfitGenerator.jsx` (TBD)

## Relevant Architecture
- `useOutfitGenerator.generate({occasion, budget, archetypeId, styleGoal, preferredCategories})` calls `outfitGenerator.ts` → orchestrator
- `SavedOutfit.result.outfit.items[]` — each item has brand, cat, color, price
- `OutfitGenerator` has handleSave, handleRate, handleRegenerate — these are where we hook style memory
- Two providers pattern: `<SavedOutfitsProvider>` and `<StyleMemoryProvider>` wrap tab content
