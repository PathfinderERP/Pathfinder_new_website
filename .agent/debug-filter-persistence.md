# Filter Persistence Debug Guide

## What Was Changed

Added comprehensive debug logging to track filter state changes and persistence behavior.

## Debug Log Prefixes

- 🏢 **[INIT]** - Component initialization and default setup
- 🔍 **[FILTER-CHECK]** - Checking if user changed filters from default
- 👤 **[USER-ACTION]** - User manually changed a filter
- 🌐 **[ONLINE-SWITCH]** - Switching to online courses view
- 🏠 **[BACK-SWITCH]** - Switching back to location view
- 📊 **[STATE]** - General filter state updates

## How to Test

### Test Case 1: Default Behavior (No User Changes)
1. Load the page → Should see `[INIT]` logs setting Hazra as default
2. Click "Online Courses" → Should see `[ONLINE-SWITCH]` with "No custom filters to save"
3. Click "Back to Location" → Should see `[BACK-SWITCH]` restoring default Hazra

**Expected Result:** Returns to Hazra centre

### Test Case 2: User Changes Filters
1. Load the page → Hazra is default
2. Change to a different centre (e.g., select a different state/district/centre)
3. Should see `[USER-ACTION]` log indicating user changed filters
4. Click "Online Courses" → Should see `[ONLINE-SWITCH]` with "Saved user's custom filters"
5. Click "Back to Location" → Should see `[BACK-SWITCH]` with "Restoring user's custom filters"

**Expected Result:** Returns to the centre you selected in step 2

## What to Check in Console

Look for these specific logs:

```
✅ [INIT] Default filters set to Hazra centre: {state, district, centre}
✅ [INIT] Component initialized
👤 [USER-ACTION] User has manually changed filters!
📝 [USER-ACTION] New filter values: {state, district, centre}
💾 [ONLINE-SWITCH] Saved user's custom filters: {state, district, centre}
🔄 [BACK-SWITCH] Restoring user's custom filters: {state, district, centre}
```

## Common Issues to Look For

1. **Filter not persisting after user change:**
   - Check if `[USER-ACTION]` log appears when you change filters
   - Check if `userHasChangedFilters` is `true` in `[ONLINE-SWITCH]` log

2. **Always returning to Hazra even after user selection:**
   - Check if `[ONLINE-SWITCH]` shows "Saved user's custom filters"
   - Check if `previousFilters` is not null in `[BACK-SWITCH]` log

3. **Filters changing unexpectedly:**
   - Check `[STATE]` logs to see when filters are being updated
   - Look for `[FILTER-CHECK]` logs to see comparison logic

## Key State Variables

- `userHasChangedFilters` - Boolean indicating if user manually changed from default
- `previousFilters` - Object storing filters before switching to online (null if using defaults)
- `defaultHazraSet` - Ref tracking if default Hazra was set on init
- `initialFiltersSet` - Ref tracking if initial filters were set

## Next Steps

If issue persists:
1. Copy all console logs from a test scenario
2. Note which test case you're running (1 or 2 above)
3. Share the logs to identify where the logic is failing
