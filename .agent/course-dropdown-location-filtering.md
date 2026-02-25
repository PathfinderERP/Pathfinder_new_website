# Course Dropdown Filters - Location-Based Filtering

## Problem Fixed

The dropdown filters (Course Type, Class Level, Duration) were showing ALL available options from ALL courses in the database, instead of showing only the options available for the currently selected location (state/district/centre).

### Before Fix:
- User selects "Hazra" centre
- Course Type dropdown shows: All, All India, Foundation, Foundation1, Foundation_3, Foundation_4, Foundation_40, Foundation_6, test_2
- These include courses from ALL centres, not just Hazra

### After Fix:
- User selects "Hazra" centre
- Course Type dropdown shows only courses available at Hazra centre
- Class Level and Duration dropdowns also show only relevant options

## Solution Implemented

### 1. Location-Filtered Courses Base
Created a new `locationFilteredCourses` memo that filters courses FIRST by location:

```javascript
const locationFilteredCourses = useMemo(() => {
  return courses.filter((course) => {
    // Filter by State
    if (selectedState && selectedState !== "All") {
      if (course.state && course.state !== selectedState) return false;
    }
    
    // Filter by District
    if (selectedDistrict && selectedDistrict !== "All") {
      if (course.district && course.district !== selectedDistrict) return false;
    }
    
    // Filter by Centre
    if (selectedCentre && selectedCentre !== "all") {
      // Handle online vs physical centres
      if (selectedCentre === "online") {
        if (course.centre?.toLowerCase() !== "online") return false;
      } else {
        if (course.centre?.toLowerCase() !== selectedCentre.toLowerCase()) return false;
      }
    }
    
    return true;
  });
}, [courses, selectedState, selectedDistrict, selectedCentre]);
```

### 2. Updated Dropdown Options
All dropdown options now derive from `locationFilteredCourses` instead of all `courses`:

**Course Names:**
```javascript
const uniqueCourseNames = useMemo(() => {
  const names = [...new Set(locationFilteredCourses.map((c) => c.name))];
  return ["All", ...names.filter(Boolean).sort()];
}, [locationFilteredCourses]);
```

**Class Levels:**
```javascript
const uniqueClassLevels = useMemo(() => {
  const filteredByCourse = selectedCourseName === "All"
    ? locationFilteredCourses  // Changed from 'courses'
    : locationFilteredCourses.filter((c) => c.name === selectedCourseName);
  
  const levels = [...new Set(filteredByCourse.map((c) => c.class_level))];
  return ["All", ...levels.filter(Boolean).sort()];
}, [locationFilteredCourses, selectedCourseName]);
```

**Durations:**
```javascript
const uniqueDurations = useMemo(() => {
  let filtered = locationFilteredCourses;  // Changed from 'courses'
  if (selectedCourseName !== "All") {
    filtered = filtered.filter((c) => c.name === selectedCourseName);
  }
  if (selectedClassLevel !== "All") {
    filtered = filtered.filter((c) => c.class_level === selectedClassLevel);
  }
  
  const durations = [...new Set(filtered.map((c) => c.duration))];
  return ["All", ...durations.filter(Boolean).sort()];
}, [locationFilteredCourses, selectedCourseName, selectedClassLevel]);
```

### 3. Auto-Reset on Location Change
Added logic to reset course filters when location changes:

```javascript
useEffect(() => {
  console.log("🔄 [COURSES] Location changed, resetting course filters");
  setSelectedCourseName("All");
  setSelectedClassLevel("All");
  setSelectedDuration("All");
}, [selectedState, selectedDistrict, selectedCentre]);
```

### 4. Simplified Final Filter
The final `filteredCourses` now starts from `locationFilteredCourses` and only applies course-specific filters:

```javascript
const filteredCourses = useMemo(() => {
  return locationFilteredCourses.filter((course) => {
    // Only apply course name, class level, and duration filters
    // Location filtering already done in locationFilteredCourses
    if (selectedCourseName !== "All" && course.name !== selectedCourseName) return false;
    if (selectedClassLevel !== "All" && course.class_level !== selectedClassLevel) return false;
    if (selectedDuration !== "All" && course.duration !== selectedDuration) return false;
    return true;
  });
}, [locationFilteredCourses, selectedCourseName, selectedClassLevel, selectedDuration]);
```

## Filter Cascade Flow

```
1. User selects location (State → District → Centre)
   ↓
2. locationFilteredCourses updates (filters all courses by location)
   ↓
3. Dropdown options update (show only options from locationFilteredCourses)
   ↓
4. Course filters reset to "All"
   ↓
5. User selects course filters (Course Name → Class Level → Duration)
   ↓
6. filteredCourses updates (applies course filters to locationFilteredCourses)
   ↓
7. Display shows final filtered results
```

## Debug Logging

Added comprehensive logging to track the filtering process:

```
🗺️ [COURSES] Filtering by location first: {state, district, centre, totalCourses}
✅ [COURSES] Location-filtered courses: X courses
📋 [COURSES] Available course names for this location: X
📋 [COURSES] Available class levels for this selection: X
📋 [COURSES] Available durations for this selection: X
🔄 [COURSES] Location changed, resetting course filters
🔍 [COURSES] Applying course-specific filters to location-filtered courses
✅ [COURSES] Filtered courses: X courses
```

## Example Scenarios

### Scenario 1: Hazra Centre
```
Location: West Bengal → Kolkata → Hazra
Result: 
- Course Type dropdown shows only courses available at Hazra
- Class Level shows only class levels for Hazra courses
- Duration shows only durations for Hazra courses
```

### Scenario 2: Online Courses
```
Location: (any) → (any) → Online
Result:
- Course Type dropdown shows only online courses
- Class Level shows only class levels for online courses
- Duration shows only durations for online courses
```

### Scenario 3: All Centres in District
```
Location: West Bengal → Kolkata → All
Result:
- Course Type dropdown shows courses from ALL centres in Kolkata
- Class Level shows class levels from all Kolkata courses
- Duration shows durations from all Kolkata courses
```

## Testing Checklist

- [ ] Select Hazra centre → Dropdowns show only Hazra options
- [ ] Select Online → Dropdowns show only online course options
- [ ] Change centre → Dropdowns update to new centre's options
- [ ] Change state → Course filters reset to "All"
- [ ] Change district → Course filters reset to "All"
- [ ] Change centre → Course filters reset to "All"
- [ ] Console logs show correct filtering progression
- [ ] No duplicate courses in results
- [ ] Correct course count displayed

## Files Modified

- `frontend/src/pages/Home.jsx`
  - Added `locationFilteredCourses` memo
  - Updated `uniqueCourseNames`, `uniqueClassLevels`, `uniqueDurations` to use location-filtered base
  - Simplified `filteredCourses` logic
  - Added auto-reset on location change
  - Enhanced debug logging
