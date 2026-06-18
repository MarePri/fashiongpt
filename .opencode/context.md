# FashionGPT — Project Context

## Environment
- **Runtime:** Vite 5 + React 18 (Browser SPA), TS + JS
- **Build:** `npm run build` → vite build (72 modules, ~2s, 0 errors)
- **Test:** `npm test` → vitest run (currently 6 tests)
- **TypeScript:** `tsc --noEmit` → 0 errors
- **Deps:** react, react-dom, @supabase/supabase-js, vitest, jsdom

## GitHub SHAs (this session)
```
401009f  →  parallel 3-look generation (Promise.all)
28743fc  →  vitest + useMemory unit tests
9960c61  →  memory persistence (useMemory, tab/input restore, welcome banner)
ddc6d10  →  the full outfit experience (generator, critic, saved looks, card, tabs)
```

## Phase 1 ✅ — The Outfit Experience
| Component | Purpose |
|-----------|---------|
| `OutfitGenerator.jsx` | Multi-step: occasion → style → budget → 3-look compare |
| `CriticScore.jsx` | Score bars, verdict, weather, suggestions, issues |
| `SavedLooks.jsx` | Collection with stats bar, filters (all/rated/unrated) |
| `OutfitCard.jsx` | Enhanced: save heart, star rating, regenerate, remove |
| `App.jsx` | Tabs: Outfit(#1), Saved(#2), DNA, Trends, Chat, Capsule |
| `useSavedOutfits.js` | LocalStorage persistence (save/rate/remove/isSaved) |

## Phase 2.1 ✅ — Memory Persistence
| File | What |
|------|------|
| `useMemory.js` | localStorage session: lastTab, lastInputs, lastResults, lastVisit, isReturning, recordGeneration, lastSeenAgo |
| App.jsx+OutfitGenerator | Tab restore, input pre-fill, welcome-back banner, auto-save results |
| `__tests__/useMemory.test.js` | 6 tests (save/restore, partial merge, recordGeneration, clear, corrupt data) |

## Phase 2.2 ✅ — Parallel Generation
- `handleGenerate` now uses `Promise.all` instead of sequential for-loop
- 3 looks fire simultaneously → ~3× speedup (slowest look wins)

## Phase 2.3 🔜 — Real-time Saved Sync (IN PROGRESS)
**Goal:** Lift `useSavedOutfits` to React context so OutfitGenerator and SavedLooks share the same state — save/rate/remove in one tab instantly updates the other.

**Approach:**
1. Create `src/hooks/SavedOutfitsContext.jsx` — wraps `useSavedOutfits` in a React context with Provider + consumer hook
2. App.jsx wraps children in `<SavedOutfitsProvider>`
3. OutfitGenerator: replace `const saved = useSavedOutfits()` with `const saved = useSavedOutfitsContext()`
4. SavedLooks: same swap — remove direct hook call
5. Build verify + commit

**`useSavedOutfits` API to preserve:**
```js
{ savedOutfits, saveOutfit(name, occasion, result, budget), removeOutfit(id), rateOutfit(id, rating), isSaved(name) }
```

## Anti-Patterns (pre-existing)
- Color harmony logic duplicated across `outfit.agent.ts`, `critic.agent.ts`, `utils/outfit.js`
- Anthropic API key lives in client bundle (security risk for production)
