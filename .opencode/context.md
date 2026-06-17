# FashionGPT — Project Context

## Environment
- Runtime: Vite 5 + React 18 (Browser SPA), **TypeScript + JavaScript**
- Languages: JS (components, hooks, data, utils, services) + **TS (agents/, db/)**
- Build: `npm run build` → vite build (JS + TS via esbuild)
- Dev: `npm run dev` → vite dev
- Dependencies: react, react-dom, @supabase/supabase-js
- DevDeps: typescript ^6.0, vite ^5.4, @vitejs/plugin-react, @types/node

## Project Type
- AI fashion stylist SPA — offline-first (no API key required)
- Three-layer architecture: UI → Agents → Database

## Architecture (Full State)
```
src/
├── App.jsx                         # Slim UI orchestrator (78 lines)
├── main.jsx / index.css            # Entry + styles
├── hooks/                          # 5 hooks (4 existing + 1 pending)
│   ├── useChat.js
│   ├── useOccasionBuilder.js
│   ├── useFashionDNA.js
│   ├── useCapsuleWardrobe.js
│   └── useOutfitGenerator.js       # ⏳ PENDING — will connect full flow
├── components/                     # 10 presentational components
├── data/                           # 7 static data files (products, occasions, etc.)
├── utils/                          # 3 utility modules (color, budget, outfit)
├── services/                       # Will add weather.ts + outfitGenerator.ts
│   ├── ai.js / ai.mock.js / config.js
├── types/index.js                  # JSDoc types
├── agents/                         # Phase 2 — TS agent layer
│   ├── types.ts                    # All interfaces
│   ├── logger.ts                   # Structured logging
│   ├── profile.agent.ts            # Style profile analysis
│   ├── wardrobe.agent.ts           # Product curation
│   ├── outfit.agent.ts             # Outfit composition with scoring
│   ├── critic.agent.ts             # 6-dimension critique/verdict
│   └── orchestrator.ts             # Central coordinator (agents never call each other)
├── db/                             # Phase 3 — Supabase layer
│   ├── client.ts                   # Singleton client (null-safe offline)
│   ├── types.ts                    # Row/Insert/Update types for all tables
│   ├── index.ts                    # Barrel export
│   └── repositories/               # 5 repository files (CRUD per table)
└── vite-env.d.ts                   # Vite import.meta.env types
```

## Git History (last 3 commits)
```
3e9924c — refactor: extract business logic into hooks + flat components structure
3862326 — feat: add TypeScript agent layer with orchestrator architecture
6e55ba3 — feat: add Supabase database layer with schema and repository pattern
```

## Current Status
### ✅ Completed (Phases 0–3)
- **Phase 0**: App.jsx monolith → 30+ modular files (data/, utils/, services/, components/)
- **Phase 1**: Service enhancements (retry logic, response validation, computed scoring, occasion mapping)
- **Phase 2**: Agent layer (types, logger, 4 agents, orchestrator) — no agent-to-agent calls, typed I/O
- **Phase 3**: Supabase DB layer (SQL migration, client, types, 5 repositories) — AI layer separate

### ⏳ In Progress (Phase 4)
Building the **outfit generator flow**:
```
User Profile → Wardrobe → Occasion → Weather → Outfit Agent → Critic Agent → Approved Outfit
```
Pending files:
- `src/services/weather.ts` — Weather/api fetcher with offline fallback
- `src/services/outfitGenerator.ts` — Full flow coordinator
- `src/hooks/useOutfitGenerator.(js|ts)` — React hook for UI consumption

## Key Design Decisions
1. **Layer isolation**: UI never imports agents directly — goes through services/hooks
2. **Agent isolation**: No agent imports another agent — all through orchestrator
3. **DB isolation**: db/ never imports from agents/ (only imports data shape types)
4. **Offline-safe**: Every layer gracefully falls back when API keys / Supabase URL are missing
5. **TypeScript only for infrastructure**: agents/ and db/ are TS; UI layer stays JS
6. **Repository pattern**: 5 repos, one per table, typed CRUD with Supabase client

## Build Status
- `tsc --noEmit` → zero errors
- `npm run build` → 57 modules, ~1.6s, zero errors (agent & db layers tree-shaken since UI doesn't import them yet)

## Pending Tasks (Phase 4)
1. Create `src/services/weather.ts` — weather data with offline fallback
2. Create `src/services/outfitGenerator.ts` — full flow: Profile → Wardrobe → Occasion → Weather → OutfitAgent → CriticAgent → result
3. Create `src/hooks/useOutfitGenerator.js` — React hook wrapping the generator
4. Verify tsc + build pass
