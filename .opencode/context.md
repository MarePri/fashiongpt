# FashionGPT — Project Context

## Environment
- **Runtime:** Vite 5 + React 18 (Browser SPA), TS + JS
- **Build:** `npm run build` → vite build (71 modules, 2.07s, 0 errors)
- **TypeScript:** `tsc --noEmit` → 0 errors
- **Deps:** react, react-dom, @supabase/supabase-js

## Architecture (4-Layer)
```
UI (JSX) → Hooks/Components → Services/Agents (TS) → DB (TS/Supabase)
```

## Phase 1 Complete — The Outfit Experience ✅
| Deliverable | Status |
|-------------|--------|
| `useSavedOutfits.js` — LocalStorage persistence (save/rate/remove) | ✅ |
| `OutfitGenerator.jsx` — Multi-step: occasion → style → budget → 3-look comparison | ✅ |
| `CriticScore.jsx` — Score bars, verdict, weather, suggestions, issues | ✅ |
| `SavedLooks.jsx` — Collection with stats bar, filters (all/rated/unrated), critic toggle | ✅ |
| `OutfitCard.jsx` — Enhanced: save heart, star rating, regenerate button | ✅ |
| `App.jsx` — New tabs: Outfit(#1), Saved(#2); default=outfit | ✅ |
| `index.css` — +300 lines of component styles | ✅ |
| Committed + pushed to GitHub: `ddc6d10` → `origin/main` | ✅ |

## Phase 2 — Memory Persistence ✅
| Delivery | Status |
|----------|--------|
| `useMemory` hook — localStorage session with save/restore/clear/recordGeneration | ✅ |
| App.jsx — restore lastTab on mount, persist tab changes | ✅ |
| OutfitGenerator — pre-fill inputs from memory, show previous results, welcome-back banner | ✅ |
| index.css — og-banner styles with slide-down animation | ✅ |
| Unit tests — 6/6 passing (save/restore roundtrip, partial merge, recordGeneration, clear, corrupt data) | ✅ |
| Build — 72 modules, 0 errors | ✅ |
| GitHub — `9960c61` → `origin/main` | ✅ |

## Key Architecture Decisions
- **Agent pipeline** (ProfileAgent→WardrobeAgent→OutfitAgent→CriticAgent) is production-quality TS but was invisible to users — Phase 1 connected it to UI
- **`useSavedOutfits`** uses LocalStorage directly (not React context) — OutfitGenerator and SavedLooks each have their own instance, share via LocalStorage reads on mount
- **OutfitGenerator** creates its own `useOutfitGenerator` + `useSavedOutfits` — clean component boundary
- **3-look generation** calls generate() 3 times sequentially (parallel in future)
- **Memory persistence** will store lastTab, lastInputs, lastResults, lastVisit in localStorage — so returning users pick up where they left off

## Anti-Patterns Noted
- Color harmony logic duplicated across `outfit.agent.ts`, `critic.agent.ts`, `utils/outfit.js`
- Anthropic API key lives in client bundle (security risk for production)
- No real-time React state sync between OutfitGenerator and SavedLooks (LocalStorage-only)

## Active Files
- `src/hooks/useMemory.js` — **next file to create**
- `src/hooks/useSavedOutfits.js` — existing, works
- `src/App.jsx` — needs memory wiring
- `src/components/OutfitGenerator.jsx` — needs input restoration from memory
