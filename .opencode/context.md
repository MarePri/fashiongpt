# FashionGPT — Project Context

## Environment
- Runtime: Vite 5 + React 19 (Browser SPA), **TypeScript added**
- Language: JavaScript (JSX) + **TypeScript (.ts) under src/agents/**
- Build: `npm run build` → vite build (supports both .js and .ts)
- Dev: `npm run dev` → vite dev

## Project Type
- [x] Application (Web SPA) — AI fashion stylist
- Offline-first: full fallback mode without API key
- **New: Agent Layer** — typed, orchestrator-coordinated agent system

## Architecture (Current)
```
src/
├── App.jsx               # Slim orchestrator (UI)
├── main.jsx / index.css  # Entry point + styles
├── components/           # 10 presentational components
├── hooks/                # 4 business-logic hooks
├── data/                 # 7 static data files
├── services/             # AI service with retry + offline fallback
├── utils/                # Color harmony, budget, outfit scoring
├── types/index.js        # JSDoc type definitions
└── agents/               # NEW — TypeScript agent layer
    ├── types.ts          # All interfaces, inputs/outputs, types
    ├── logger.ts         # Structured logging utility
    ├── profile.agent.ts  # Style profile analysis
    ├── wardrobe.agent.ts # Product curation/selection
    ├── outfit.agent.ts   # Outfit composition + scoring
    ├── critic.agent.ts   # Outfit critique/review
    └── orchestrator.ts   # Central coordinator (agents never call each other)
```

## Agent Architecture

### Rules Enforced
| Rule | Enforcement |
|------|------------|
| No agent-to-agent calls | Only orchestrator imports agents |
| Typed I/O | Every agent has strict input/output interfaces in types.ts |
| Never throw | Every agent captures errors, returns fallback |
| Logging | All agents use `logger.ts` with timestamps and levels |
| No UI coupling | Agents are pure infrastructure — can be tested standalone |

### Orchestrator Flows
| Request Type | Agent Pipeline |
|-------------|---------------|
| `analyze_profile` | ProfileAgent (single) |
| `critique_outfit` | CriticAgent (single) |
| `build_outfit` | ProfileAgent → WardrobeAgent → OutfitAgent → CriticAgent (4 steps) |
| `build_capsule` | ProfileAgent → WardrobeAgent (2 steps) |

### Key interfaces (types.ts)
- `OrchestratorRequest` / `OrchestratorResponse` — typed request/response
- `AgentTrace` — execution trace per agent (duration, warnings, success)
- `ProfileAgentInput/Output` — style profile analysis
- `WardrobeAgentInput/Output` — product curation
- `OutfitAgentInput/Output` — outfit composition
- `CriticAgentInput/Output` — critique with 6 scoring dimensions

## What's Been Done (This Session)
1. ✅ Added TypeScript support (typescript, tsconfig.json)
2. ✅ Created `src/agents/types.ts` — all interfaces
3. ✅ Created `src/agents/logger.ts` — structured logging
4. ✅ Created `profile.agent.ts` — archetype→profile mapping with brand affinities
5. ✅ Created `wardrobe.agent.ts` — occasion/ budget/ style-based product selection
6. ✅ Created `outfit.agent.ts` — outfit composition with 4 scoring dimensions
7. ✅ Created `critic.agent.ts` — 6-dimension critique with approval/verdict
8. ✅ Created `orchestrator.ts` — central coordinator with 4 request types
9. ❌ **Pending: Build verification** — need to compile TypeScript and check zero errors

## Key Decisions
1. TypeScript only for agent layer — existing JS stays as-is (gradual adoption)
2. Agents are **async functions**, not classes — simpler composition for orchestrator
3. Product pool seeded into ProfileAgent lazily (avoids circular deps)
4. Critic scores on 6 dimensions: occasionFit, budgetCompliance, styleCoherence, colorHarmony, trendAlignment, overall
5. Orchestrator returns full execution trace for observability
6. All errors caught at agent level → fallback return (never throws to caller)
7. Logger uses `console.error/warn/log/debug` with ISO timestamps — no external deps

## Pending
- **Build verification** — run `npx tsc --noEmit` then `vite build` to confirm zero TypeScript + JS errors
- Build already has JS part verified (57 modules, 0 errors) — just need to add TS compilation

## Build Status
- Before agents: 57 modules, 1.61s, 0 errors
- After agents: Need to verify TypeScript compilation
- Expected to pass — all JS code unchanged, TS code has JSDoc imports from existing data
