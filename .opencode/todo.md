# Mission: Restore + Migrate FashionGPT Architecture

## M0: Phase 0 — Project Scaffolding | status: completed ✅
- [x] S0.1: Create directory structure & types
- [x] S0.2: Extract CSS into src/index.css
- [x] S0.3: Extract data layer (products, occasions, trends, archetypes, prompts)
- [x] S0.4: Extract utilities (color, outfit, budget)
- [x] S0.5: Create component stubs (OutfitCard, Navbar, ColorDot)
- [x] S0.6: Create service stubs (ai, ai.mock, config)
- [x] S0.7: Create page stubs (Chat, Style, Trends, DNA, Capsule)
- [x] S0.8: Slim App.jsx to orchestrator + update main.jsx + verify build (50 modules, 1.62s, 0 errors)

## M1: Phase 1 — Service Layer Enhancement | status: pending
### T1.1: Enhance AI service
- [ ] S1.1.1: Add retry logic (2 retries, exponential backoff)
- [ ] S1.1.2: Add response validation for AI JSON responses
- [ ] S1.1.3: Add token usage tracking

### T1.2: Enhance outfit service
- [ ] S1.2.1: Add style scoring algorithm (not random)
- [ ] S1.2.2: Add color harmony validation
- [ ] S1.2.3: Add occasion-to-category mapping as data file

## M2: Phase 2 — Agent Layer & Orchestrator | status: pending
### T2.1: Create agent structure
- [ ] S2.1.1: Create outfit.agent.js — specialized outfit generation
- [ ] S2.1.2: Create profile.agent.js — fashionDNA analysis
- [ ] S2.1.3: Create wardrobe.agent.js — capsule wardrobe builder
- [ ] S2.1.4: Create critic.agent.js — constraint validation
- [ ] S2.1.5: Create orchestrator.js — intent routing

## M3: Phase 3 — TypeScript Migration | status: pending
### T3.1: Set up TypeScript
- [ ] S3.1.1: Add TypeScript + tsconfig
- [ ] S3.1.2: Convert types/index.js → index.ts
- [ ] S3.1.3: Convert data/*.js → *.ts
- [ ] S3.1.4: Convert utils/*.js → *.ts
- [ ] S3.1.5: Convert services/*.js → *.ts
- [ ] S3.1.6: Convert components/*.jsx → *.tsx
- [ ] S3.1.7: Convert pages/*.jsx → *.tsx
- [ ] S3.1.8: Convert App.jsx → App.tsx
- [ ] S3.1.9: Verify tsc --noEmit + vite build

## M4: Phase 4 — Backend Proxy & Security | status: pending
### T4.1: Create backend
- [ ] S4.1.1: Create server/ directory with Express
- [ ] S4.1.2: Add POST /api/chat proxy route
- [ ] S4.1.3: Add POST /api/outfit proxy route
- [ ] S4.1.4: Add POST /api/dna proxy route
- [ ] S4.1.5: Update ai.js to call local backend
- [ ] S4.1.6: Remove dangerous-direct-browser-access header

## M5: Phase 5 — Polish & Production Readiness | status: pending
### T5.1: Error handling
- [ ] S5.1.1: Add React ErrorBoundary component
- [ ] S5.1.2: Add loading skeletons for all async operations

### T5.2: Performance
- [ ] S5.2.1: Add React.memo to OutfitCard, ChatMessage
- [ ] S5.2.2: Add useCallback to event handlers
- [ ] S5.2.3: Add unique IDs as key props instead of array index
