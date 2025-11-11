# Story Datasets for Kids Learning

This directory contains dataset files for stories 11-20 in both YoungKids and TeenKids sections.

## File Structure

- `young-kids-stories.json` - Stories 11-20 for YoungKids (ages 4-10)
- `teen-kids-stories.json` - Stories 11-20 for TeenKids (ages 11-17)
- `young-kids-stories.csv` - CSV format (optional, fallback)
- `teen-kids-stories.csv` - CSV format (optional, fallback)

## Story Unlocking System

Stories 11-20 are progressively unlocked:
- **Story 11** unlocks after completing **Story 10**
- **Story 12** unlocks after completing **Story 11**
- And so on...

Stories 1-10 are always available (hardcoded in the application).

## JSON Format

Each story in the JSON file should follow this structure:

```json
{
  "storyNumber": 11,
  "title": "Story Title",
  "description": "Story description for display",
  "difficulty": "Easy" | "Medium" | "Hard",
  "duration": "6 min",
  "words": 380,
  "image": "🌸",
  "type": "story-type-identifier",
  "character": "CharacterName",
  "gradient": "from-pink-400 to-rose-400",
  "bgGradient": "from-pink-200 to-rose-300 dark:from-pink-900 dark:to-rose-900",
  "animation": "animate-float-slow"
}
```

### Field Descriptions

- **storyNumber**: Must be between 11-20
- **title**: Display title of the story
- **description**: Short description shown on story card
- **difficulty**: One of "Easy", "Medium", or "Hard"
- **duration**: Estimated reading time (e.g., "6 min")
- **words**: Approximate word count
- **image**: Emoji or icon to display
- **type**: Unique identifier for the story type (used for internal mapping)
- **character**: Character icon name (must match available icons)
- **gradient**: Tailwind gradient classes for card header
- **bgGradient**: Tailwind gradient classes for card background
- **animation**: Tailwind animation class

### Available Character Icons (YoungKids)
- Rabbit
- Rocket
- Fish
- Footprints
- Sparkles
- Anchor
- Shield
- Crown
- Compass

### Available Character Icons (TeenKids)
- Target
- Globe
- Brain
- Cpu
- Crown
- MessageSquare
- Lock

## CSV Format (Alternative)

If using CSV format, the file should have these columns:
- storyNumber
- title
- description
- difficulty
- duration
- words
- image
- type
- character
- gradient
- bgGradient
- animation

## Adding New Stories

1. Edit the appropriate JSON file (`young-kids-stories.json` or `teen-kids-stories.json`)
2. Add your story object with `storyNumber` between 11-20
3. Ensure all required fields are present
4. The story will automatically appear in the UI after the previous story is completed

## Notes

- Stories are loaded automatically when the page loads
- The system caches loaded stories for performance
- If a dataset file is missing or invalid, the system gracefully falls back to showing only stories 1-10
- Story unlocking is checked in real-time based on user progress

