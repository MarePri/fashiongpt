# FashionGPT — Project Context

## Environment
- **Runtime:** Vite 5 + React 18 (Browser SPA), TS + JS
- **Build:** `npm run build` → vite build (75 modules, ~2s, 0 errors)
- **Test:** `npm test` → vitest run (6 tests, all pass)
- **TypeScript:** `tsc --noEmit` → 0 errors
- **Deps:** react, react-dom, @supabase/supabase-js, vitest, jsdom

## Commit Log (this session)
```
5291749  →  Discovery screen CSS
9b75ccc  →  Discovery tab wiring in App.jsx
a29a552  →  Discovery.jsx component (curated looks per archetype)
ac561bc  →  Animated generating screen (icon cycle, agent stages, tips)
2ba8797  →  Real-time saved sync (SavedOutfitsContext)
401009f  →  Parallel generation (Promise.all, 3× speedup)
28743fc  →  vitest + useMemory unit tests
9960c61  →  Memory persistence (useMemory, tab/input restore, banner)
ddc6d10  →  Outfit Experience (generator, critic, saved looks, card, tabs)
```

## All Phases Complete ✅

| Phase | Feature | Status |
|:------|:--------|:-------|
| **1** | **The Outfit Experience** — OutfitGenerator, CriticScore, SavedLooks, enhanced OutfitCard, tab restructure | ✅ `ddc6d10` |
| **2.1** | **Memory Persistence** — useMemory, tab/input restore, welcome-back banner, 6 unit tests | ✅ `9960c61` |
| **2.2** | **Parallel Generation** — Promise.all for 3-look gen (~3× speedup) | ✅ `401009f` |
| **2.3** | **Real-time Saved Sync** — SavedOutfitsContext lifts state to app level | ✅ `2ba8797` |
| **2.4** | **Loading Animations** — GeneratingAnimation: cycling icons, agent stages pipeline, rotating style tips, breathing progress | ✅ `ac561bc` |
| **2.5** | **Discovery Screen** — curated looks per archetype from product catalog, filter chips, color swatches, try-this-look button | ✅ `5291749` |

## Files Created/Modified This Session

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useMemory.js` | NEW | Session persistence (lastTab, lastInputs, lastResults, lastVisit) |
| `src/hooks/useSavedOutfits.js` | EXISTING | LocalStorage persistence (save/rate/remove/isSaved) |
| `src/hooks/SavedOutfitsContext.jsx` | NEW | React context wrapping useSavedOutfits for cross-tab sync |
| `src/components/OutfitGenerator.jsx` | MODIFIED | Memory wiring, parallel gen, GeneratingAnimation |
| `src/components/CriticScore.jsx` | NEW | Score breakdown with bars, weather, suggestions |
| `src/components/SavedLooks.jsx` | NEW | Collection view, stats bar, filters, critic toggle |
| `src/components/OutfitCard.jsx` | MODIFIED | Save/rate/regenerate actions, memo |
| `src/components/GeneratingAnimation.jsx` | NEW | Animated loading: icons cycle, stage pipeline, tips |
| `src/components/Discovery.jsx` | NEW | Curated looks by archetype, filter, try-this-look |
| `src/App.jsx` | MODIFIED | 7 tabs (Outfit, Saved, Discover, DNA, Trends, Chat, Capsule), memory wiring, context provider |
| `src/index.css` | MODIFIED | +500 lines: generator, critic, saved, banner, animation, discovery |
| `src/hooks/__tests__/useMemory.test.js` | NEW | 6 unit tests for useMemory |
| `vite.config.js` | MODIFIED | vitest + jsdom config |
| `.opencode/context.md` | MODIFIED | This file |

## Key Architecture
- **Agent pipeline** (Profile→Wardrobe→Outfit→Critic) wired through UI via OutfitGenerator
- **SavedOutfitsContext** provides shared React state for OutfitGenerator + SavedLooks tabs
- **useMemory** persists session independently of saved outfits (lastTab, inputs, results)
- **Discovery** uses static product data (no API calls) to show curated looks by archetype

## Anti-Patterns (pre-existing)
- Color harmony logic duplicated across `outfit.agent.ts`, `critic.agent.ts`, `utils/outfit.js`
- Anthropic API key lives in client bundle (security risk for production)

## Remaining Work
- StyleCoach (iterative refine → regenerate feedback loop)
- Any other Phase 3 items the user wants
