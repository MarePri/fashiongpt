# Sync Issues (Unresolved Only)

## SYNC-1: Error messages lost in OutfitGenerator.jsx — error recovery suggestions non-functional
- Severity: HIGH
- Files: src/components/OutfitGenerator.jsx (lines 106-114)
- Problem: `.filter(Boolean)` on line 106 removes null values from the results array BEFORE the null-count check on line 111. This means `errorRef.current` is ALWAYS set to the generic message "Could not generate outfits. Try again with different choices." and the error classification logic (network vs API vs generic) on lines 350-356 never triggers. Users always see the generic suggestion regardless of the actual error type.
- Fix: Capture raw promise results before filtering. Either (a) store raw results before `.filter(Boolean)` and check those, or (b) collect error messages in a shared array in the `.catch()` handler and pass the first error message to `errorRef.current`.
- Status: pending
