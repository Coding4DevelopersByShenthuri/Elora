/**
 * Service to load stories from Excel/CSV datasets
 * Supports loading stories 11-20 dynamically from dataset files
 */

export interface DatasetStory {
  storyNumber: number; // 11-20
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  words: number;
  image: string; // emoji
  type: string; // story type identifier
  character?: string; // icon name
  gradient?: string;
  bgGradient?: string;
  animation?: string;
  // Story content structure (can be expanded based on needs)
  content?: any; // Full story steps/content
}

class StoryDatasetServiceClass {
  private cachedStories: {
    young?: DatasetStory[];
    teen?: DatasetStory[];
  } = {};

  /**
   * Load stories from CSV file (simpler than Excel for web)
   * CSV format expected:
   * storyNumber,title,description,difficulty,duration,words,image,type,character,gradient,bgGradient,animation
   */
  async loadStoriesFromCSV(filePath: string, ageGroup: 'young' | 'teen'): Promise<DatasetStory[]> {
    try {
      // Check cache first
      if (this.cachedStories[ageGroup]) {
        return this.cachedStories[ageGroup]!;
      }

      const response = await fetch(filePath);
      if (!response.ok) {
        console.warn(`Could not load dataset from ${filePath}, using empty array`);
        return [];
      }

      const csvText = await response.text();
      const stories = this.parseCSV(csvText);
      
      // Cache the results
      this.cachedStories[ageGroup] = stories;
      
      return stories;
    } catch (error) {
      console.error(`Error loading stories dataset for ${ageGroup}:`, error);
      return [];
    }
  }

  /**
   * Parse CSV text into DatasetStory array
   */
  private parseCSV(csvText: string): DatasetStory[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return []; // Need at least header + 1 row

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const stories: DatasetStory[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length < headers.length) continue;

      const story: Partial<DatasetStory> = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        
        switch (header) {
          case 'storynumber':
            story.storyNumber = parseInt(value, 10) || 0;
            break;
          case 'title':
            story.title = value;
            break;
          case 'description':
            story.description = value;
            break;
          case 'difficulty':
            story.difficulty = (value === 'Easy' || value === 'Medium' || value === 'Hard') 
              ? value 
              : 'Medium';
            break;
          case 'duration':
            story.duration = value;
            break;
          case 'words':
            story.words = parseInt(value, 10) || 0;
            break;
          case 'image':
            story.image = value;
            break;
          case 'type':
            story.type = value;
            break;
          case 'character':
            story.character = value;
            break;
          case 'gradient':
            story.gradient = value;
            break;
          case 'bggradient':
            story.bgGradient = value;
            break;
          case 'animation':
            story.animation = value;
            break;
        }
      });

      // Only add if story number is between 11-20
      if (story.storyNumber && story.storyNumber >= 11 && story.storyNumber <= 20 && story.title) {
        stories.push(story as DatasetStory);
      }
    }

    // Sort by story number
    return stories.sort((a, b) => a.storyNumber - b.storyNumber);
  }

  /**
   * Parse CSV line handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current); // Add last value
    return values;
  }

  /**
   * Load stories from JSON file (alternative to CSV)
   */
  async loadStoriesFromJSON(filePath: string, ageGroup: 'young' | 'teen'): Promise<DatasetStory[]> {
    try {
      // Check cache first
      if (this.cachedStories[ageGroup]) {
        return this.cachedStories[ageGroup]!;
      }

      const response = await fetch(filePath);
      if (!response.ok) {
        console.warn(`Could not load dataset from ${filePath}, using empty array`);
        return [];
      }

      const data = await response.json();
      const stories = Array.isArray(data) ? data : [];
      
      // Filter and validate stories 11-20
      const validStories = stories
        .filter((s: any) => s.storyNumber >= 11 && s.storyNumber <= 20)
        .sort((a: DatasetStory, b: DatasetStory) => a.storyNumber - b.storyNumber);
      
      // Cache the results
      this.cachedStories[ageGroup] = validStories;
      
      return validStories;
    } catch (error) {
      console.error(`Error loading stories dataset for ${ageGroup}:`, error);
      return [];
    }
  }

  /**
   * Clear cache (useful for reloading)
   */
  clearCache(ageGroup?: 'young' | 'teen') {
    if (ageGroup) {
      delete this.cachedStories[ageGroup];
    } else {
      this.cachedStories = {};
    }
  }

  /**
   * Get cached stories
   */
  getCachedStories(ageGroup: 'young' | 'teen'): DatasetStory[] | undefined {
    return this.cachedStories[ageGroup];
  }
}

export const StoryDatasetService = new StoryDatasetServiceClass();

