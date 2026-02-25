# Courses Section Filter Integration

## Changes Made

Updated the `CoursesSection` component to properly filter courses based on the `LocationFilter` component's state (state, district, and centre selections).

## What Was Updated

### 1. Props Passed to CoursesSection
```javascript
<CoursesSection
  selectedState={selectedState}          // NEW
  selectedDistrict={selectedDistrict}    // NEW
  selectedLocation={selectedLocation}
  selectedCentre={selectedCentre}
/>
```

### 2. Function Signature Updated
```javascript
function CoursesSection({ 
  selectedState,      // NEW
  selectedDistrict,   // NEW
  selectedLocation, 
  selectedCentre 
})
```

### 3. Enhanced Filter Logic

The filter now applies in this order:

1. **State Filter** - Filters courses by selected state
   - If "All" is selected, shows courses from all states
   - Online courses (without state) are always included

2. **District Filter** - Filters courses by selected district
   - If "All" is selected, shows courses from all districts
   - Online courses (without district) are always included

3. **Centre Filter** - Filters courses by selected centre
   - If "all" is selected, shows courses from all centres
   - If "online" is selected, shows only online courses
   - If specific centre is selected, shows only that centre's courses

4. **Location Filter** - Legacy filter (might be redundant)

5. **Course Name Filter** - Internal filter within courses section

6. **Class Level Filter** - Internal filter within courses section

7. **Duration Filter** - Internal filter within courses section

### 4. Special Handling for Online Courses

```javascript
if (selectedCentre === "online") {
  // Show only online courses
  if (course.centre?.toLowerCase() !== "online" && course.location !== "Online") {
    return false;
  }
}
```

Online courses are identified by:
- `course.centre === "online"` OR
- `course.location === "Online"`

### 5. Debug Logging Added

```javascript
console.log("📚 [COURSES] Fetched courses from backend:", coursesData.length, "courses");
console.log("🔍 [COURSES] Filtering courses with:", {
  selectedState,
  selectedDistrict,
  selectedCentre,
  selectedLocation,
  totalCourses: courses.length
});
console.log("✅ [COURSES] Filtered courses:", filteredCourses.length, "courses");
```

## How It Works

### Scenario 1: Default (Hazra Centre)
- State: West Bengal
- District: Kolkata
- Centre: hazra
- **Result**: Shows only courses from Hazra centre in Kolkata, West Bengal

### Scenario 2: Online Courses
- State: (any)
- District: (any)
- Centre: online
- **Result**: Shows only online courses (virtual classroom)

### Scenario 3: All Centres in a District
- State: West Bengal
- District: Kolkata
- Centre: all
- **Result**: Shows all courses from all centres in Kolkata, West Bengal

### Scenario 4: All Courses
- State: All
- District: All
- Centre: all
- **Result**: Shows all courses from all locations

## Testing Checklist

- [ ] Default load shows Hazra centre courses
- [ ] Changing state filters courses by state
- [ ] Changing district filters courses by district
- [ ] Changing centre filters courses by centre
- [ ] Selecting "Online Courses" shows only online courses
- [ ] Switching back from online restores previous filter
- [ ] Console logs show correct filter values
- [ ] Console logs show correct filtered course count

## Console Logs to Watch

When filtering courses, you should see:
```
🔍 [COURSES] Filtering courses with: {
  selectedState: "West Bengal",
  selectedDistrict: "Kolkata",
  selectedCentre: "hazra",
  selectedLocation: "All",
  totalCourses: 50
}
✅ [COURSES] Filtered courses: 5 courses
```

## Files Modified

- `frontend/src/pages/Home.jsx`
  - Updated `PathVerseOverview` component to pass state and district props
  - Updated `CoursesSection` component to receive and use state/district filters
  - Enhanced filter logic with state and district filtering
  - Added special handling for online courses
  - Added comprehensive debug logging
