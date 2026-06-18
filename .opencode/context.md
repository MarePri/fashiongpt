# Project Context

## Environment
- Language: JavaScript (React) + TypeScript (Agents)
- Runtime: Node.js, Vite 5.4
- Build: `npm run build` (vite build, 75 modules, 0 errors)
- Test: `npm test` (vitest, jsdom env, 6 tests pass)
- Package Manager: npm

## Project Type
- [x] Application (Web/React SPA — fashion styling assistant)
- Infrastructure: None (static SPA, client-side Anthropic API calls)

## Structure
- Source: `src/`
  - `components/` — React components
  - `hooks/` — Custom hooks (useMemory, useSavedOutfits, useOutfitGenerator)
  - `services/` — Business logic (outfitGenerator.ts, weather.ts)
  - `agents/` — Agent pipeline (ProfileAgent→WardrobeAgent→OutfitAgent→CriticAgent via orchestrator.ts)
  - `data/` — Static data (archetypes.js, products.js, occasionMap.js, trends.js)
  - `utils/` — Helpers (outfit.js)
  - `db/` — Database layer (not connected to UI)
  - `server/` — Express server (not used in current flow)
- Tests: `src/hooks/__tests__/useMemory.test.js` (6 tests)
- Entry: `src/App.jsx`

## Current Status
### Outfit Experience (Phase 1) — DELIVERED
- `OutfitGenerator.jsx`: Multi-step flow (occasion → archetype → budget → generate → 3 results)
- `CriticScore.jsx`: Score bars (4 categories), verdict, weather, suggestions, issues
- `SavedLooks.jsx`: Collection with stats bar, filters, inline rate/remove, critic toggle
- `OutfitCard.jsx`: Save heart, star rating, regenerate, remove buttons
- Tab structure: Outfit (default), Saved, Discover, DNA, Trends, Chat, Capsule

### Memory & Performance (Phase 2) — DELIVERED
- `useMemory.js`: Session persistence (lastTab, lastInputs, lastResults, lastVisit, isReturning, recordGeneration)
- `useMemory.test.js`: 6 unit tests (save/restore, merge, recordGeneration, clear, corrupt data)
- `SavedOutfitsContext.jsx`: React context for cross-component outfit sync
- Parallel generation: `Promise.all` for 3 looks (~3× speedup)
- `GeneratingAnimation.jsx`: Cycle icons, agent stage pipeline, style tips, breathing progress bar

### Discovery Screen (Phase 2.5) — DELIVERED
- `Discovery.jsx`: Curated looks per archetype from product catalog
- Filter chips (All / Minimalist / Streetwear / Romantic / Professional)
- Color swatches, item names/brands/prices, "Try This Look" button

### Fixes Applied (commit 44f98c6)
- Removed agent traces debug section
- Removed og-meta div (confidence, duration, critic approved)
- Removed unused CSS (og-meta, og-traces)
- "Try This Look" now uses key-based remount (tryLookNonce → fresh OutfitGenerator mount)

## Pending Tasks
All Phase 2 items delivered.

### Phase 3: StyleCoach — DELIVERED (commit 039b785)
- **handleRefine** function: re-runs `generate()` with user feedback appended to `styleGoal`
  - e.g. styleGoal becomes `"A versatile look for summer wedding. User feedback: more colorful"`
  - Full pipeline re-run (all 4 agents) with feedback as added context
- **Refine UI** in results area:
  - "✨ StyleCoach — Refine This Look" toggle (dashed accent border, below critic section)
  - Text input with placeholder + autoFocus, placeholder: `e.g. "more colorful", "less formal", "add accessories"`
  - Enter to submit, Escape to cancel
  - "Refine →" submit button + "Cancel" button
  - Spinner during refinement (rotating circle + "Refining your look…")
  - Auto-closes on switching look tabs (useEffect on activeVariation)
- Build: 75 modules, 0 errors | Tests: 6/6 pass | CSS: 26.67 kB, JS: 227.35 kB

## Key Architecture Facts
- `useOutfitGenerator` calls `generateOutfit()` from `outfitGenerator.ts`
- `generateOutfit()` calls `handleRequest()` from orchestrator with `type: 'build_outfit'`
- 4 agents run: ProfileAgent → WardrobeAgent → OutfitAgent → CriticAgent
- Anthropic API calls happen inside each agent (TypeScript files in `src/agents/`)
- Results are structured: `outfit.items[]`, `critique.scores{}`, `reasoning`, `agentTraces[]`
- Two independent localStorage keys: `fashiongpt_session` (memory) and `fashiongpt_saved_outfits` (saved)

## Relevant Files
- `src/services/outfitGenerator.ts` — Main entry point for generation (298 lines)
- `src/hooks/useOutfitGenerator.js` — React hook wrapper
- `src/components/OutfitGenerator.jsx` — UI flow
- `src/components/Discovery.jsx` — Curated looks with Try This Look
- `src/hooks/useMemory.js` — Session memory
- `src/hooks/SavedOutfitsContext.jsx` — Shared saved outfits state
