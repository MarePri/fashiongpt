# Project Context

## Environment
- Language: JavaScript (React 18 + JSX)
- Runtime: Node.js (via Vite v5.4.21)
- Build: `npm run build` (Vite)
- Test: No test runner configured
- Package Manager: npm

## Project Type
- [x] Application (Web — React SPA)
- Name: FashionGPT — AI Personal Stylist
- Port: localhost:5174 (5173 in use)

## Infrastructure
- Container: Docker (Dockerfile present but not used in dev)
- CI/CD: None detected
- Cloud: None

## Structure
- Source: `src/`
- Components: `src/components/` (29+ files)
- Hooks: `src/hooks/` (12 files, including 2 context providers)
- Services: `src/services/` (6 files: weather, recommendations, offlineEngine)
- Rules: `src/rules/` (6 rule engines: color, style, brand, category, occasion, outfit)
- Data: `src/data/` (8 seed datasets: occasions, trends, archetypes, prompts, brands, garments, etc.)
- Entry: `src/App.jsx` → `src/main.jsx`

## Navigation Architecture (post-refactor)
- **5 core tabs**: Home, Create, Wardrobe, Discover, Profile
- **HomeScreen**: Streamlined — greeting, weather, hero CTA, quick generate, recent faves, style tip
- **OutfitGenerator** (tab: "create"): The hero feature — 3 outfits per generation
- **Wardrobe.jsx** (new): Merges SavedLooks + CapsuleWardrobe + StyleMemoryPanel with sub-nav
- **Profile.jsx** (new): Merges FashionDNA + StyleEvolution with sub-nav
- **Discover tab**: Discovery (archetypes) + TrendsRadar in one scroll view

## Key State
- `useMemory()`: Core user memory (lastVisit, lastTab, lastInputs, lastSeenAgo())
- `useFashionDNA()`: Style DNA analysis (archetype, color/brand/category signals)
- `useCapsuleWardrobe()`: Capsule wardrobe builder
- `StyleMemoryContext`: Shared context for style learning signals
- `SavedOutfitsContext`: Shared context for saved outfits

## Data Flow
- Static data-driven (seed datasets in src/data/)
- Rule engines produce deterministic outfit recommendations
- WeatherWidget uses navigator.geolocation + free API
- OfflineEngine fallback for demo mode

## CSS
- Single `src/index.css` (~3747 lines pre-refactor, now ~3970)
- CSS custom properties for theming (--accent: #C9826B, --card, --surface, etc.)
- No CSS-in-JS or CSS modules

## Recent Changes (commit e91e925)
- Rewrote App.jsx: 9 tabs → 5, removed unused lazy imports (ChatPanel, StyleEvolution, CapsuleWardrobe, FashionDNA as standalone)
- Created Wardrobe.jsx (merged SavedLooks + CapsuleWardrobe + StyleMemoryPanel with sub-nav)
- Created Profile.jsx (merged FashionDNA + StyleEvolution with sub-nav)
- Rewrote HomeScreen.jsx: reduced from 13 sections to 5
- Added CSS: hero card, quick gen, wardrobe/profile sub-nav, discover divider
- Removed: ChatPanel from tabs (integrated into Create flow presets), StyleEvolution as standalone, CapsuleWardrobe as standalone

## Notes
- ChatPanel quick-action presets (wedding, date, city break) intended to be integrated into OutfitGenerator as preset options in future iteration
- Discover tab now combines Discovery + TrendsRadar in one scroll view with a styled divider
- First-time visitors land on Home; returning users land on Create
