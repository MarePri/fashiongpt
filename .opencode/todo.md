# Mission: V1 Foundation & Polish — Connect Weather, Fix Critical Issues, Polish UX

## M1: P0 Critical Fixes | status: completed

### T1.1: Extract color harmony to shared module | agent:Worker | size:M
- [x] S1.1.1: Create `src/utils/colorHarmony.ts` with COLOR_GROUPS + computeColorHarmony + getColorGroup
- [x] S1.1.2: Update `src/agents/outfit.agent.ts` to import from shared module
- [x] S1.1.3: Update `src/agents/critic.agent.ts` to import from shared module
- [x] S1.1.4: Update `src/utils/outfit.js` to import from shared module
- [x] S1.1.5: Verify build passes (tsc + vite build)

### T1.2: Add AbortController to async hooks | agent:Worker | size:M
- [x] S1.2.1: Update `callAI()` in `src/services/ai.js` to accept AbortSignal
- [x] S1.2.2: Update `useOutfitGenerator.js` — create AbortController, pass signal, abort on cleanup
- [x] S1.2.3: Update `useChat.js` — create AbortController, pass signal, abort on cleanup
- [x] S1.2.4: Update `useFashionDNA.js` — create AbortController, pass signal, abort on cleanup
- [x] S1.2.5: Update `useCapsuleWardrobe.js` — abort on cleanup (sync, no API calls needed)
- [x] S1.2.6: Verify build passes

### T1.3: Fix useCapsuleWardrobe race condition | agent:Worker | size:S
- [x] S1.3.1: Add `isBuilding` ref guard to prevent concurrent `buildCapsule` calls
- [x] S1.3.2: Verify build passes

## M2: P1 Weather + UX Polish | status: completed

### T2.1: Connect weather to UI | agent:Worker | size:M
- [x] S2.1.1: Create WeatherWidget component showing current weather in OutfitGenerator
- [x] S2.1.2: Integrate fetchWeather + display into OutfitGenerator input step
- [x] S2.1.3: Verify build passes

### T2.2: Add keyboard shortcuts | agent:Worker | size:S | status:completed
- [x] S2.2.1: Add Cmd/Ctrl+Enter shortcut to ChatPanel (existing Enter, add modifier)
- [x] S2.2.2: Add Esc to cancel refinement in OutfitGenerator
- [x] S2.2.3: Verify build passes

### T2.3: Add error recovery suggestions | agent:Worker | size:S | status:completed
- [x] S2.3.1: Improve error messages in hooks with actionable suggestions
- [x] S2.3.2: Verify build passes

## M3: Full System Verification | agent:Reviewer | size:M | status:completed
- [x] S3.1: Verify build passes (vite build) — ✅ 79 modules, 2.53s, 0 errors
- [x] S3.2: Verify all tests pass (vitest run) — ✅ 4 files, 34 tests, all pass
- [x] S3.3: Verify LSP diagnostics clean — ✅ tsc --noEmit passes with 0 errors
- [x] S3.4: Final sign-off — all todos marked [x]
