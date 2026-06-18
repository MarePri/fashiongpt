# Project Context — fashiongpt

## Environment
- Lang: JavaScript (React) + TypeScript (Agents)
- Build: `npm run build` (vite, 77 modules, 0 errors)
- Test: `npm test` (vitest, jsdom, 6 tests pass)
- Package: npm, Vite 5.4

## Delivered (15 commits this session)

| Phase | Feature | Commit |
|-------|---------|--------|
| P1 | OutfitGenerator, CriticScore, SavedLooks, OutfitCard, tabs | ddc6d10 |
| P2.1 | useMemory session persistence | 9960c61 |
| P2.2 | Parallel generation (Promise.all, 3×) | 401009f |
| P2.3 | SavedOutfitsContext real-time sync | 2ba8797 |
| P2.4 | GeneratingAnimation loading screen | ac561bc |
| P2.5 | Discovery curated looks per archetype | 5291749 |
| Fix | Removed agent traces debug section | 4dba035 |
| Fix | Removed og-meta div, key-based Try This Look | 44f98c6 |
| P3 | StyleCoach feedback refinement loop | 039b785 |
| P4 | Code splitting (React.lazy, 24% smaller bundle) | 40cef75 |
| P5 | Style Memory (learns from saves/rates/regens) | bb52dad |
| Fix | Wardrobe randomization jitter (±5) for varied outfits | b75be87 |
| Fix | Grammar fix — "A your style" → "Your Style look" | b75be87 |
| WIP | styleGoal wired through to WardrobeAgent for intent-aware product selection | In progress |

## Current Work: styleGoal → WardrobeAgent

### What's Done
1. Added `styleGoal?: string` to `WardrobeAgentInput` type (types.ts)
2. Orchestrator passes `request.payload.styleGoal` to WardrobeAgent
3. Added `parseStyleGoalIntent()` function in wardobe.agent.ts — parses natural language for:
   - Color intent (colorful/neutral) → colorBoost adjustment
   - Style intent (formal/casual/edgy/romantic/sport) → styleBoost tags
   - Category intent (accessories/outerwear/shoes/dresses) → extraCategories
   - Price intent (cheap/premium) → priceSensitivity multiplier

### Pending
- Integrate `parseStyleGoalIntent()` into the product scoring/filtering flow in `curateWardrobe()`
- Use `colorBoost` to adjust scores for product colors
- Use `styleBoost` as additional style tags for `filterByStyleTags` and `pickAffordable`
- Use `extraCategories` to extend preferred categories
- Use `priceSensitivity` to multiply the price penalty
- Build verify + push

### Data Flow
```
UI feedback "more colorful"
  → styleGoal appended with "... User feedback: more colorful"
  → generate() → generateOutfit() → orchestrator payload
  → WardrobeAgent.curateWardrobe(input) where input.styleGoal exists
  → parseStyleGoalIntent("...more colorful") → { colorBoost: 'colorful' }
  → pickAffordable boosts score for non-neutral colored products
  → Different products selected → different outfit!
```

### Files Changed This Session
- `src/hooks/useStyleMemory.js` (NEW)
- `src/hooks/StyleMemoryContext.jsx` (NEW)
- `src/agents/wardrobe.agent.ts` (jitter + styleGoal parsing)
- `src/agents/types.ts` (WardrobeAgentInput.styleGoal)
- `src/agents/orchestrator.ts` (pass styleGoal to WardrobeAgent)
- `src/App.jsx` (StyleMemoryProvider)
- `src/components/OutfitGenerator.jsx` (styleMem wiring, styleGoal grammar)
- `src/components/SavedLooks.jsx` (styleMem.recordRate)
- `src/index.css` (personalized badge, skeleton)

### What's Left
- Integrate intent parsing into product selection
- Verify build
- Commit + push
