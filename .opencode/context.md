# FashionGPT - Project Context

## Environment
- **Language**: JavaScript (React JSX)
- **Runtime**: Node.js (Vite dev server running on localhost:5173)
- **Build**: `npm run build` → `vite build`
- **Dev**: `npm run dev` → `vite`
- **Package Manager**: npm
- **Dependencies**: react ^18.3.1, react-dom ^18.3.1
- **Dev Dependencies**: @vitejs/plugin-react ^4.3.1, vite ^5.4.1

## Project Type
- Application (SPA — Vite + React, single-page with 5 tabs)

## Architecture (After Phase 0 Migration)
```
src/
├── index.css              ← Extracted CSS (167 lines)
├── main.jsx               ← React mount + CSS import
├── App.jsx                ← Slim orchestrator (~140 lines)
├── types/
│   └── index.js           ← JSDoc typedefs for all data shapes
├── data/
│   ├── brands.js          ← BRANDS array
│   ├── products.js        ← 36 products (was inline in App.jsx)
│   ├── occasions.js       ← 8 occasions
│   ├── trends.js          ← 8 trends
│   ├── archetypes.js      ← 4 archetypes
│   └── prompts.js         ← 8 prompt suggestions
├── utils/
│   ├── color.js           ← COLOR_HEX map
│   ├── budget.js          ← extractBudget() parser
│   └── outfit.js          ← parseOutfitFromProducts() + generateOfflineOutfit()
├── services/
│   ├── config.js          ← hasApiKey(), isOfflineMode()
│   ├── ai.mock.js         ← generateOfflineChatResponse() + generateOfflineDNA()
│   └── ai.js              ← callAI() + getFashionDNA() with offline fallback
├── components/
│   ├── ColorDot.jsx       ← Color dot display
│   ├── OutfitCard.jsx     ← Outfit card with scores & total
│   └── Navbar.jsx         ← Tab navigation bar
├── pages/
│   ├── ChatPage.jsx       ← Chat tab (messages, input, prompts)
│   ├── StylePage.jsx      ← Occasion Builder tab
│   ├── TrendsPage.jsx     ← Trend Radar tab
│   ├── DnaPage.jsx        ← FashionDNA tab
│   └── CapsulePage.jsx    ← Capsule Wardrobe tab
└── hooks/                 ← (empty, for future use)
```

## What's Been Done (Phase 0 Complete ✅)

### Restructuring (no behavior change)
1. Extracted CSS from template string → `src/index.css`
2. Extracted static data (PRODUCTS, OCCASIONS, TRENDS, ARCHETYPES, PROMPTS, BRANDS) → `src/data/*.js`
3. Extracted utility functions (COLOR_HEX, extractBudget, parseOutfitFromProducts) → `src/utils/*.js`
4. Extracted AI integration (callAI, getFashionDNA) with offline fallback → `src/services/*.js`
5. Extracted components (Navbar, OutfitCard, ColorDot) → `src/components/*.jsx`
6. Extracted page render code → `src/pages/*.jsx`
7. Created type definitions (JSDoc) in `src/types/index.js`

### New Functionality Added
8. `extractBudget()` — parses "€100", "100 euro", "under 150", "budget 200" from text
9. `parseOutfitFromProducts()` rewritten — sorts by price, selects within budget if constraint found
10. `generateOfflineOutfit()` — works without any API key
11. `generateOfflineChatResponse()` — template-based mock AI for all common queries
12. `generateOfflineDNA()` — mock DNA analysis for each archetype
13. `callAI()` now auto-falls back to offline mode when no API key is detected
14. `getFashionDNA()` with offline fallback

### Behavioral Changes
- **Budget accuracy**: Outfit generation now respects price constraints from user messages
- **Offline mode**: App works fully without any API key
- **No visual changes**: All 5 tabs, styling, interactions preserved exactly

## API Key Situation
- **No API keys set**. App runs in offline mode by default (fully functional).
- `.env.local` has all keys commented out.

## Active Node Processes
- (none currently — killed for memory compaction)

## Current Phase: Phase 1 — Service Layer Enhancement (in progress)
### T1.1: Enhance AI service (files to modify)
- `src/services/ai.js` — add retry logic (2 retries, exponential backoff), add response validation for AI JSON
- `src/services/ai.mock.js` — add token usage tracking object to mock responses
- `src/services/config.js` — add retry config constants

### T1.2: Enhance outfit service (files to modify)
- `src/utils/outfit.js` — replace random scores with computed style scoring algorithm; add color harmony validation
- `src/data/products.js` — (reference only, no changes needed)

### T1.3: Add occasion-category mapping (new file)
- `src/data/occasionMap.js` — explicit map of occasion → required categories

## Build Verification
- Phase 0 build: ✅ 50 modules, 1.62s, 0 errors
- Phase 1 build: pending

## Next Phases After Phase 1
- Phase 2: Agent layer & Orchestrator (outfit.agent, profile.agent, wardrobe.agent, critic.agent)
- Phase 3: TypeScript migration (convert .jsx → .tsx)
- Phase 4: Backend proxy for API security
- Phase 5: Polish (error boundaries, React.memo, unique keys)
