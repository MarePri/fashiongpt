# Mission: Restore + Migrate FashionGPT Architecture

## M0: Phase 0 — Project Scaffolding | status: completed
- [x] S0.1: Create directory structure & types
- [x] S0.2: Extract CSS into src/index.css
- [x] S0.3: Extract data layer (products, occasions, trends, archetypes, prompts)
- [x] S0.4: Extract utilities (color, outfit, budget)
- [x] S0.5: Create component stubs (OutfitCard, ColorDot, etc.)
- [x] S0.6: Create service stubs (ai, ai.mock, config)
- [x] S0.7: Create page stubs (Chat, Style, Trends, DNA, Capsule)
- [x] S0.8: Slim App.jsx to orchestrator + build verification

## M1: Phase 1 — Service Layer Enhancement | status: completed
### T1.1: Enhance AI service
- [x] S1.1.1: Add retry logic (2 retries, exponential backoff) | verified: `ai.js` L38-77
- [x] S1.1.2: Add response validation for AI JSON responses | verified: `ai.js` L10-22, L84-104
- [x] S1.1.3: Add token usage tracking | verified: `ai.mock.js` L7-14

### T1.2: Enhance outfit service
- [x] S1.2.1: Add style scoring algorithm (non-random) | verified: `outfit.agent.ts` scoring functions
- [x] S1.2.2: Add color harmony validation | verified: `outfit.agent.ts` + `critic.agent.ts` COLOR_GROUPS
- [x] S1.2.3: Add occasion-to-category mapping as data file | verified: `data/occasionMap.js`

## M2: Phase 2 — Agent Layer & Orchestrator (TypeScript) | status: completed
- [x] S2.1.1: Create outfit.agent.ts — specialized outfit generation | verified: 166 lines, scoring engine
- [x] S2.1.2: Create profile.agent.ts — fashionDNA analysis | verified: 183 lines, archetype profiling
- [x] S2.1.3: Create wardrobe.agent.ts — capsule wardrobe builder | verified: 210 lines, product curation
- [x] S2.1.4: Create critic.agent.ts — constraint validation | verified: 245 lines, multi-metric scoring
- [x] S2.1.5: Create orchestrator.ts — intent routing | verified: 323 lines, 4 request types
- [x] S2.1.6: Create shared types.ts + logger.ts | verified: types.ts (221 lines), logger.ts (48 lines)

## M3: Phase 3 — TypeScript Infrastructure & New Layers | status: completed
- [x] S3.1.1: Add TypeScript + tsconfig (allowJs: true, checkJs: false for mixed codebase)
- [x] S3.1.2: Create TS types in agents/types.ts (mirrors JS types/index.js with full TS interfaces)
- [x] S3.1.3: Add DB layer in TypeScript (client.ts, types.ts, 5 repositories)
- [x] S3.1.4: Add weather service in TypeScript (weather.ts with real API + offline fallback)
- [x] S3.1.5: Add outfit generator service in TypeScript (outfitGenerator.ts — full flow coordinator)
- [x] S3.1.6: Verify tsc --noEmit passes + vite build (58 modules, 0 errors)

## M4: Phase 4 — Backend Proxy & Security | status: completed ✅
### T4.1: Create backend
- [x] S4.1.1: Create server/ directory with Express + cors + dotenv | verified: `server/`
- [x] S4.1.2: Add POST /api/chat proxy route | verified: `server/index.js`
- [x] S4.1.3: Add POST /api/outfit proxy route | verified: `server/index.js`
- [x] S4.1.4: Add POST /api/dna proxy route | verified: `server/index.js`
- [x] S4.1.5: Update ai.js to call local backend (API_PROXY_URL) | verified: `ai.js` L47
- [x] S4.1.6: Add server/package.json with deps (express, cors, dotenv) | verified: `server/package.json`

## M5: Phase 5 — Polish & Production Readiness | status: completed ✅
### T5.1: Error handling
- [x] S5.1.1: Add React ErrorBoundary component | verified: `ErrorBoundary.jsx` + `main.jsx` wrapped
- [x] S5.1.2: Add loading skeletons for all async operations | verified: `Skeleton.jsx` (Chat/Outfit/DNA)

### T5.2: Performance
- [x] S5.2.1: Add React.memo to OutfitCard, ChatPanel, FashionDNA, ProductRecommendations, CapsuleWardrobe, TrendsRadar, Sidebar, Dashboard | verified: 8 components with memo
- [x] S5.2.2: Add useCallback to event handlers | verified: stable hook references in App.jsx
- [x] S5.2.3: Add unique IDs as key props instead of array index | verified: ChatPanel `m.id || i`, prompts `key={p}`
