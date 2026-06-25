# FashionGPT Project Context

## Environment
- Language: JavaScript (JSX) + TypeScript
- Runtime: Node.js via Vite (v5.4.21)
- Build: `npm run build` → use `npx.cmd vite build` (PowerShell execution policy blocks `npm.ps1`)
- TS Check: `tsc --noEmit` — pass (exit 0)
- Test: `npm test` (vitest) — no tests exist
- Package Manager: npm

## Project Type
- [x] Application (SPA — Fashion AI Stylist)

## Structure
- Source: src/ (25+ components, 8 hooks, 7 agents, 5 services, 8 data files, 6 rule files)
- Entry: src/main.jsx → src/App.jsx
- Agents pipeline: Profile → Wardrobe → Outfit → Critic → orchestrator → outfitGenerator.ts
- 9 tabs: Home, Outfit, Saved, Discover, DNA, Trends, Chat, Capsule, Evolution

## Completed Missions

### Mission 1: First 100 Users UX Fixes
**13/13 issues** — bugs, weather, celebrations, onboarding, empty states, animations.

### Mission 2: Portfolio Polish (Phase 6)
**7/7 items** — seed data, offline mode, keyboard shortcuts, print CSS, splash screen, quick generate, empty states + SYNC-2 bugfix.

### Phases M2–M6: Explainable AI Stylist Upgrade ✓
**5 phases, 12 new/modified files, ~1200+ lines added.** Build clean at 97 modules / 0 errors.

| Phase | Component | Files | What It Does |
|-------|-----------|-------|-------------|
| **M2** | Rule Engine | `src/rules/` (6 files) | Deterministic outfit generation: style/occasion/weather/color rules + scoring orchestrator. Falls back when AI unavailable. |
| **M3** | Interactive Builder | `InteractiveOutfitBuilder.jsx` + wiring + CSS | Swap items (top/bottom/shoes), formality slider, color swap, live score preview. `modifyOutfit()` engine in `outfitEngine.ts`. |
| **M4** | Style Coach | `StyleCoachInsight.jsx` + wiring + CSS | 5-6 educational insight cards: verdict, occasion fit, color harmony, style coherence, trends, weather. "Learn more" expand with tips. |
| **M5** | Outfit Battle | `OutfitBattle.jsx` + wiring + CSS | 3-card side-by-side, dimension compare table, crown indicators for best-in-class, "Pick Winner" mechanic. Replaces old compare view. |
| **M6** | Style Evolution | `StyleEvolution.jsx` + `App.jsx` tab + CSS | Preference dashboard: top brands/categories/colors/occasions/archetypes, avg scores/prices, saved looks gallery, clear data. Tracks user taste over time. |

### Architecture Notes
- Rule engine (`src/rules/`) is imported as **fallback** in `outfitGenerator.ts` — primary path still uses AI orchestrator
- `InteractiveOutfitBuilder` and `StyleCoachInsight` use **dynamic imports** of rule modules (lazy-loaded)
- `StyleMemoryContext` persists to localStorage — feeds preferences back into generation
- `OutfitBattle` uses existing `critique.scores` from any generation method

## Conventions
- Naming: camelCase JSX, PascalCase components
- Styles: single index.css (~2900 lines)
- State: React hooks + Context (SavedOutfitsContext, StyleMemoryContext)
- New rules code in src/rules/, UI in src/components/
