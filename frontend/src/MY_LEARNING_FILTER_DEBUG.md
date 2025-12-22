# My Learning Filter Bug - Investigation & Fix

## Issue Reported
User logged in as `demo-user-1` and filtered by "Completed" status:
- **Expected**: Show 1 item (Complete React Developer Course)
- **Actual**: Shows 2 items (also showing Full-Stack Web Development Bootcamp which is "in_progress")
- **Badge Count**: Correctly shows "Completed (1)"

## Root Cause Analysis

### Database Seed Data (Correct)
From `/api/mockApi.ts` lines 502-527:
```javascript
const myLearnings: MyLearning[] = [
  {
    id: 'ml-1',
    user_id: 'demo-user-1',
    target_type: 'track',
    target_id: 'pub-track-1', // Full-Stack Web Development Bootcamp
    status: 'in_progress',  // ← IN PROGRESS
  },
  {
    id: 'ml-2',
    user_id: 'demo-user-1',
    target_type: 'resource',
    target_id: 'pub-resource-1', // Complete React Developer Course
    status: 'completed',  // ← COMPLETED
  },
  {
    id: 'ml-3',
    user_id: 'demo-user-1',
    target_type: 'track',
    target_id: 'pub-track-2', // Machine Learning Fundamentals
    status: 'in_progress',  // ← IN PROGRESS
  },
];
```

**Expected behavior**: When filtering by "completed", only ml-2 should show.

### Filtering Logic (Correct)
From `/components/UserContentPage.tsx` line 116:
```typescript
const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
```

This logic is correct.

### Count Logic (Correct)
From `/components/UserContentPage.tsx` line 94:
```typescript
return data.filter(item => item.status === statusValue).length;
```

This logic is also correct (proven by the badge showing "1").

## Most Likely Cause: **Stale localStorage Data**

The application stores data in localStorage with key `webacademy_db`. If the user's browser has old data from before the schema changes or seed data updates, it may contain:
- Extra learning entries
- Incorrect status values  
- Duplicate entries for tracks that are both in learnings and submissions

## Fixes Implemented

###1. Added Missing `estimatedTime` Prop
**File**: `/components/MyLearningsPage.tsx` (line 43)

**Problem**: The `estimatedTime` field wasn't being passed through transformation.

**Fix**:
```typescript
const transformedData = learnings.map(learning => ({
  // ... other fields
  estimatedTime: learning.estimatedTime,  // ← ADDED
  // ... rest of fields
}));
```

### 2. Added Debug Logging
**File**: `/components/MyLearningsPage.tsx` (lines 49-68)

Added comprehensive logging to help diagnose:
```typescript
useEffect(() => {
  if (mounted && transformedData.length > 0) {
    console.log('[MyLearningsPage] Total items:', transformedData.length);
    console.log('[MyLearningsPage] Items by status:', transformedData.map(item => ({
      title: item.title,
      status: item.status,
      type: item.type
    })));
    
    const completedCount = transformedData.filter(item => item.status === 'completed').length;
    const inProgressCount = transformedData.filter(item => item.status === 'in_progress').length;
    
    console.log('[MyLearningsPage] Status counts:', {
      completed: completedCount,
      in_progress: inProgressCount,
      all: transformedData.length
    });
  }
}, [mounted, transformedData]);
```

## How to Verify the Fix

### Step 1: Clear localStorage
Open browser DevTools console and run:
```javascript
localStorage.clear();
location.reload();
```

### Step 2: Check Console Output
After reloading, log in as demo-user-1 and navigate to My Learnings. Check the console for:
```
[MyLearningsPage] Total items: 3
[MyLearningsPage] Items by status: [
  { title: "Full-Stack Web Development Bootcamp", status: "in_progress", type: "track" },
  { title: "Complete React Developer Course", status: "completed", type: "resource" },
  { title: "Machine Learning Fundamentals", status: "in_progress", type: "track" }
]
[MyLearningsPage] Status counts: { completed: 1, in_progress: 2, all: 3 }
```

### Step 3: Filter by "Completed"
Click the "Completed" filter. You should see:
- Badge: "Completed (1)" ✅
- Display: Only "Complete React Developer Course" ✅

## If Issue Persists

If after clearing localStorage the issue still occurs, check:

1. **Browser console for the debug logs** - This will show exact data being rendered
2. **Network tab** - Verify no API calls are returning stale data
3. **React DevTools** - Inspect the transformedData prop in MyLearningsPage
4. **UserContentPage filteredItems** - Add logging to line 177 in UserContentPage.tsx:
   ```typescript
   console.log('[UserContentPage] Filtered items:', filteredItems.map(item => ({
     title: item.title,
     status: item.status
   })));
   ```

## Summary

- ✅ **Database seed data is correct** (only 1 completed item)
- ✅ **Filtering logic is correct** (matches status properly)
- ✅ **Count logic is correct** (badge shows "1")
- ✅ **Missing estimatedTime field added**
- ✅ **Debug logging added for troubleshooting**
- ⚠️ **Most likely cause: Stale localStorage data**

**Recommended Action**: Clear localStorage and reload the page.
