# FashionGPT Project Context

## Environment
- JSX + TS, Vite v5.4.21, build: `npx.cmd vite build`
- 97 modules, 0 errors (last verified)
- 9 tabs: Home, Outfit, Saved, Discover, DNA, Trends, Chat, Capsule, Evolution

## Completed Work

### M1: First 100 Users UX Fixes
13/13 issues — bugs, weather, celebration animations, onboarding, empty states.

### Phase 6: Portfolio Polish
7/7 — seed data, offline mode, keyboard shortcuts, print CSS, splash screen, quick generate, empty states. Plus SYNC-2 bugfix (Promise.all reference).

### M2: Rule-Based Outfit Engine (6 files)
- `src/rules/` — styleRules, occasionRules, weatherRules, colorRules, outfitEngine (orchestrator), index
- Deterministic 3-look generation with scoring, critique, explanations
- Wired as fallback in `outfitGenerator.ts` when AI orchestrator fails

### M3: Interactive Outfit Builder
- `InteractiveOutfitBuilder.jsx` — swap items, formality slide, color swap, live scores
- `modifyOutfit()` engine in outfitEngine.ts (7 actions)
- Customize button in look tabs on OutfitGenerator

### M4: Style Coach
- `StyleCoachInsight.jsx` — 5-6 educational insight cards per look
- Explains occasion fit, color harmony, style coherence, trends, weather
- Replaced old "Expert Critique" toggle

### M5: Outfit Battle
- `OutfitBattle.jsx` — 3-card grid, dimension compare table, Pick Winner
- Replaced old basic compare view

### M6: Style Evolution
- `StyleEvolution.jsx` — dashboard: top brands/categories/colors/occasions/archetypes
- Saved looks gallery, avg scores/prices, clear data
- "Evolution" tab added to App.jsx sidebar

### Build: 97 modules, 0 errors ✓
### Committed: `52ace85` — pushed to origin/main ✓

## Key Files
- `src/services/outfitGenerator.ts` — main flow, now has rule engine fallback
- `src/rules/outfitEngine.ts` — rule orchestrator, modifyOutfit
- `src/components/OutfitGenerator.jsx` — wired with builder, coach, battle
- `src/App.jsx` — routing for all 9 tabs
- `src/index.css` — ~2900 lines, all component styles
