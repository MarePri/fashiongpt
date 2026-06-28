# Project Context

## Environment
- React 18 + TypeScript 6, Vite v5.4.21
- Port: 5173 (dev server running in background: `job_0cda4d4d`)
- Build: `npm run build` passes with 0 errors
- Git: `origin/main` (2 commits ahead: e91e925, 356d73e)

## Navigation (post-refactor, commit e91e925)
- **5 tabs**: Home, Create, Wardrobe, Discover, Profile
- HomeScreen: greeting → weather → hero CTA → quick gen → faves → tip
- Wardrobe.jsx: SavedLooks + CapsuleWardrobe + StyleMemoryPanel (sub-nav)
- Profile.jsx: FashionDNA + StyleEvolution (sub-nav)
- Discover: Discovery(archetypes) + TrendsRadar in one scroll

## Visible Reasoning System (post-refactor, commit 356d73e)

### GeneratingAnimation.jsx
- 6 reasoning stages replace 4 generic ones:
  1. 🎯 Analyzing Occasion — formality, vibe, context
  2. 🧬 Matching Style DNA — archetype profile + saved count
  3. 🌤️ Checking Weather — temp, condition, recommendation
  4. 🎨 Comparing Color Harmony — palette pairings
  5. 👔 Selecting Outfit Formula — silhouette × budget × versatility
  6. ⭐ Scoring Confidence — 5-dimension matrix
- Detail text rotates every 1.8s per stage (living "thinking" feel)
- Progress bar + stage counter (e.g. "Step 3 of 6 · 42%")
- Receives `context` prop (occasion, archetype, weather, budget, savedCount)

### OutfitGenerator.jsx
- `buildOutfitReasoning()` function (~200 lines) generates client-side reasoning:
  - `chosenFor`: why this look was selected
  - `solves`: what problem it addresses
  - `rejectedAlternatives`: 2 counterfactuals with rejection reasons
  - `confidenceBreakdown`: 5 dimensions each with score + text reason
- Reasoning injected into each look object after generation completes
- `genContext` passed to GeneratingAnimation for live detail text
- All data-derived — zero API calls

### OutfitCard.jsx
- SVG confidence ring at top (overall score + High/Moderate/Low label)
- Reasoning banners: "Why this was chosen" + "What this solves"
- Auto-expanded confidence breakdown with per-dimension reasoning text
- Rejected alternatives section (collapsible with Why This Works)
- Falls back to legacy score display when no reasoning data present

### index.css additions (~120 lines)
- `.outfit-confidence-meter` + ring SVG styles
- `.outfit-reasoning-banner` (chosen/solves)
- `.outfit-confidence-row` + `.outfit-confidence-row-reason`
- `.outfit-rejected-section` (alternatives)
- `.og-gen-detail` (live thinking text)
- `.og-gen-status` (stage counter)

## Current Status
- Server is running on port 5173 (background task `job_0cda4d4d`)
- Build verified clean at last commit
- All tasks complete

## Pending Tasks
- None. Mission complete.

## Key Files Changed (last commit 356d73e)
- `src/components/GeneratingAnimation.jsx` — fully rewritten
- `src/components/OutfitGenerator.jsx` — +buildOutfitReasoning, reasoning injection, context prop
- `src/components/OutfitCard.jsx` — fully rewritten with reasoning UI
- `src/index.css` — +120 lines of reasoning/confidence/rejection styles
