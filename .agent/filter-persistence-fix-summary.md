# Filter Persistence Fix - Summary

## Problem Identified
When switching back from "Online Courses" to "Location View", the filters were being reset by the auto-reset logic that runs after restoration, causing the following cascade:
1. Restore Hazra (West Bengal → Kolkata → hazra)
2. Auto-reset sees multiple districts available
3. Changes district from "Kolkata" to "All"
4. This triggers centre to reset to "all"
5. User loses their selection

## Root Causes
1. **Auto-reset interference**: The auto-reset useEffects were running immediately after filter restoration
2. **Incorrect user change detection**: Automatic cascading to `centre: 'all'` was being detected as a user action
3. **No restoration protection**: No mechanism to prevent auto-reset during filter restoration

## Solutions Implemented

### 1. Added Restoration Flag
```javascript
const isRestoringFilters = useRef(false);
```
- Set to `true` when starting filter restoration
- Cleared after 200ms delay
- Prevents both auto-reset and filter-check logic during restoration

### 2. Updated Auto-Reset Logic
```javascript
if (!isInitialized.current || showOnlineCourses || isRestoringFilters.current) return;
```
- Auto-reset now skips when `isRestoringFilters` is true
- Prevents interference with filter restoration

### 3. Improved User Change Detection
```javascript
const hasSpecificCentreSelected = selectedCentre !== "all" && selectedCentre !== "hazra";
```
- Only counts as user change when a specific centre is selected
- Ignores automatic cascading to `centre: 'all'`
- Skips detection during restoration

### 4. Enhanced Debug Logging
- `[INIT]` - Initialization tracking
- `[FILTER-CHECK]` - User change detection
- `[USER-ACTION]` - Confirmed user changes
- `[ONLINE-SWITCH]` - Switching to online mode
- `[BACK-SWITCH]` - Switching back to location
- `[AUTO-RESET]` - Automatic cascading behavior
- `[STATE]` - General state updates

## Expected Behavior

### Scenario 1: Default (No User Changes)
1. Load page → Hazra default
2. Click "Online Courses" → `previousFilters = null`
3. Click "Back to Location" → Restores Hazra ✅

### Scenario 2: User Selection
1. Load page → Hazra default
2. Select different centre → `userHasChangedFilters = true`
3. Click "Online Courses" → `previousFilters = {state, district, centre}`
4. Click "Back to Location" → Restores user's selection ✅

## Key State Variables

- `userHasChangedFilters` - Boolean tracking if user manually changed from default
- `previousFilters` - Object storing filters before online switch (null if using defaults)
- `defaultHazraSet` - Ref tracking if default Hazra was set on init
- `initialFiltersSet` - Ref tracking if initial filters were set
- `isRestoringFilters` - Ref tracking if currently restoring filters (prevents auto-reset)

## Testing Checklist

- [ ] Load page → Should default to Hazra
- [ ] Switch to online and back → Should return to Hazra
- [ ] Select different centre → Should mark as user change
- [ ] Switch to online and back → Should return to selected centre
- [ ] Console shows no auto-reset during restoration
- [ ] Console shows "Restoration complete, auto-reset re-enabled"

## Files Modified

- `frontend/src/pages/Home.jsx` - LocationFilter component
  - Added `isRestoringFilters` ref
  - Updated filter change detection logic
  - Updated auto-reset logic to respect restoration flag
  - Enhanced debug logging throughout
