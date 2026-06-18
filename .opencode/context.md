# Project Context

## Environment
- Language: JavaScript (React JSX) + TypeScript (infrastructure)
- Runtime: Node.js (via Vite)
- Build: `npm run build` → vite build (2.26s, 77 modules, 0 errors)
- Test: `npm test` → vitest run (6 tests, all pass)
- Package Manager: npm

## Project Type
- [x] Application (Web SPA)
- [ ] Library/Package
- [ ] Microservice
- [ ] Monorepo

## Infrastructure
- Container: None
- Orchestration: None
- CI/CD: None detected
- Cloud: Supabase (configured, not connected to UI)

## Structure
- Source: `src/`
- Tests: `src/hooks/__tests__/`
- Entry: `src/main.jsx`

## Tech Stack
- React 18 + Vite 5
- TypeScript 6 (agents, db, services)
- JavaScript (UI components, hooks)
- Supabase (DB client, 5 repositories)
- Anthropic Claude API (via ai.js)
- Vitest + jsdom (testing)

## Key Architecture
- 3-layer: UI → Services → Agents → DB
- Code-split by tab (React.lazy + Suspense)
- ErrorBoundary wraps app
- LocalStorage persistence via useMemory hook
- 4 agents: Profile, Wardrobe, Outfit, Critic
- Orchestrator coordinates agent pipeline

## Current Build Status
- Build: ✅ PASS (79 modules, 2.53s, 0 errors)
- Tests: ✅ 34/34 pass (4 test files)
- Lint: Not configured

## Conventions
- Naming: camelCase (JS), PascalCase (components)
- Imports: relative paths
- CSS: Single index.css file, CSS-in-JS template strings in components
- Error handling: try/catch with graceful fallbacks, mock data when API fails
- State: useState in hooks, context for shared state (SavedOutfitsContext, StyleMemoryContext)

## V1 Completed (June 2026)
- ✅ Color harmony extracted to shared `src/utils/colorHarmony.ts`
- ✅ AbortController added to all async hooks (ai.js, useChat, useOutfitGenerator, useFashionDNA)
- ✅ useCapsuleWardrobe race condition fixed (buildingRef guard)
- ✅ WeatherWidget created and integrated into OutfitGenerator
- ✅ Keyboard shortcuts: Cmd/Ctrl+Enter (ChatPanel), Esc (cancel refine)
- ✅ Error recovery suggestions with actionable messages

## Known Open Issues
- AI API key in client bundle (security risk for production)
- No request deduplication
