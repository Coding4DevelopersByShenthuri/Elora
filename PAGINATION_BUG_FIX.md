# Kids Page Story Pagination Bug Fix

## Issue Description
Users could open the first 4 stories (page 1) in the Kids Story Time section but couldn't open stories 5-8 (page 2). Clicking on stories in page 2 would fail to open them.

## Root Cause
The bug was in the `handleStartLesson` function in `client/src/pages/Kids.tsx`.

### The Problem:
1. **Line 930**: When rendering paginated stories, `actualIndex` was correctly calculated:
   ```typescript
   const actualIndex = allStories.findIndex(s => s.title === story.title);
   ```

2. **Line 998**: This `actualIndex` was correctly passed to the handler:
   ```typescript
   onClick={() => handleStartLesson(actualIndex)}
   ```

3. **Line 424 (OLD CODE)**: Inside `handleStartLesson`, the index was incorrectly recalculated:
   ```typescript
   const actualIndex = startIndex + storyIndex;
   ```

### Why This Failed:
- **Page 1 (stories 0-3)**: `startIndex = 0`, so `actualIndex = 0 + storyIndex` worked correctly
- **Page 2 (stories 4-7)**: `startIndex = 4`, so clicking story 5 (actualIndex=4) would recalculate as `4 + 4 = 8`, which is out of bounds!

## Solution
Removed the incorrect recalculation line since `storyIndex` parameter already contains the correct index in the `allStories` array.

### Changes Made:
1. Removed: `const actualIndex = startIndex + storyIndex;`
2. Updated all references from `actualIndex` to `storyIndex` within the function:
   - Line 425: `setCurrentStory(storyIndex)`
   - Line 430: `const storyType = allStories[storyIndex].type`
   - Line 460: `const key = 'story-${storyIndex}'`
   - Line 511: `const story = allStories[storyIndex]`

## Testing
After this fix:
- ✅ Stories 1-4 (page 1) continue to work correctly
- ✅ Stories 5-8 (page 2) now open correctly
- ✅ All 8 stories can be accessed through pagination

## Files Modified
- `client/src/pages/Kids.tsx`

## Related Components
All 8 story components work correctly:
1. Magic Forest Adventure
2. Space Adventure
3. Underwater World
4. Dinosaur Discovery Adventure
5. Unicorn Magic Adventure
6. Pirate Treasure Adventure
7. Superhero School Adventure
8. Fairy Garden Adventure

