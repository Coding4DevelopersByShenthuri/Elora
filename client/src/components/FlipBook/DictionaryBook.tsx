import { useMemo, useState } from 'react';
import { FlipBook } from './FlipBook';
import { Volume2, BookOpen, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DictionaryEntry {
  id: number;
  word: string;
  phonetic?: string;
  definition: string;
  example_sentence?: string;
  audio_url?: string;
  image_url?: string;
  synonyms?: string[];
  antonyms?: string[];
  tamil_translations?: string[];
  category?: string;
  difficulty_level?: number;
  usage_frequency?: number;
}

interface DictionaryBookProps {
  entries: DictionaryEntry[];
  onClose?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function DictionaryBook({ entries, onClose, searchQuery = '', onSearchChange }: DictionaryBookProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const playAudio = (url?: string) => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(err => console.error('Audio play failed:', err));
    }
  };

  // Filter entries based on search query with improved accuracy
  const filteredEntries = useMemo(() => {
    if (!localSearchQuery.trim()) return entries;
    const query = localSearchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/).filter(w => w.length > 0);
    
    return entries.filter(entry => {
      const wordLower = entry.word.toLowerCase();
      const definitionLower = entry.definition.toLowerCase();
      const exampleLower = entry.example_sentence?.toLowerCase() || '';
      const categoryLower = entry.category?.toLowerCase() || '';
      const phoneticLower = entry.phonetic?.toLowerCase() || '';
      
      // Exact word match (highest priority)
      if (wordLower === query) return true;
      
      // Word starts with query (high priority)
      if (wordLower.startsWith(query)) return true;
      
      // Word contains query as whole word (medium-high priority)
      const wordBoundaryRegex = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (wordBoundaryRegex.test(entry.word)) return true;
      
      // Word contains query (medium priority)
      if (wordLower.includes(query)) return true;
      
      // All query words present in definition (medium priority)
      if (queryWords.length > 1 && queryWords.every(qw => definitionLower.includes(qw))) {
        return true;
      }
      
      // Definition contains query as phrase (medium priority)
      if (definitionLower.includes(query)) return true;
      
      // Example sentence contains query (low-medium priority)
      if (exampleLower.includes(query)) return true;
      
      // Category matches (low-medium priority)
      if (categoryLower.includes(query)) return true;
      
      // Phonetic matches (low priority)
      if (phoneticLower.includes(query)) return true;
      
      // Search in synonyms
      if (entry.synonyms?.some(syn => syn.toLowerCase().includes(query))) return true;
      
      // Search in antonyms
      if (entry.antonyms?.some(ant => ant.toLowerCase().includes(query))) return true;
      
      return false;
    }).sort((a, b) => {
      // Sort by relevance: exact matches first, then starts with, then contains
      const aWord = a.word.toLowerCase();
      const bWord = b.word.toLowerCase();
      
      // Exact match gets highest priority
      if (aWord === query && bWord !== query) return -1;
      if (bWord === query && aWord !== query) return 1;
      
      // Starts with gets second priority
      const aStarts = aWord.startsWith(query);
      const bStarts = bWord.startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;
      
      // Word boundary match gets third priority
      const aWordBoundary = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(a.word);
      const bWordBoundary = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(b.word);
      if (aWordBoundary && !bWordBoundary) return -1;
      if (bWordBoundary && !aWordBoundary) return 1;
      
      // Word contains gets fourth priority
      const aContains = aWord.includes(query);
      const bContains = bWord.includes(query);
      if (aContains && !bContains) return -1;
      if (bContains && !aContains) return 1;
      
      // Alphabetical order for same priority
      return aWord.localeCompare(bWord);
    });
  }, [entries, localSearchQuery]);

  const pages = useMemo(() => {
    // If there's a search query, use filtered results (even if empty)
    // If no search query, use all entries
    const entriesToShow = localSearchQuery.trim() ? filteredEntries : entries;
    
    if (entriesToShow.length === 0) {
      if (entries.length === 0) {
        // No entries in dictionary at all
        return [
          {
            id: 0,
            content: (
              <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-white dark:bg-slate-900">
                <BookOpen className="w-16 h-16 text-teal-600 dark:text-teal-400 mb-4" />
                <h2 className="text-2xl md:text-2xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Dictionary</h2>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-sm lg:text-sm">No words yet. Start adding words to your dictionary!</p>
              </div>
            )
          }
        ];
      } else {
        // Search returned no results (but dictionary has entries)
        return [
          {
            id: 0,
            content: (
              <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-white dark:bg-slate-900">
                <Search className="w-16 h-16 text-teal-600 dark:text-teal-400 mb-4" />
                <h2 className="text-2xl md:text-2xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4">No Results Found</h2>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-sm lg:text-sm">Try a different search term</p>
                <p className="text-xs md:text-xs lg:text-xs text-teal-600 dark:text-teal-400 mt-2">Searching for: "{localSearchQuery}"</p>
              </div>
            )
          }
        ];
      }
    }

    return entriesToShow.map((entry, index) => {
      // Determine if this is a right-side page (even index in spread)
      const isRightPage = index % 2 === 1;
      
      return {
        id: entry.id || index,
        content: (
          <div className="h-full flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto bg-white dark:bg-slate-900 hide-scrollbar relative overflow-x-visible">
            {/* Logo on right-side pages - top right corner */}
            {isRightPage && (
              <div className="absolute top-0 right-0 sm:top-0 sm:right-0 md:top-0 md:right-0 z-10" style={{ transform: 'translate(0, 0)' }}>
                <img 
                  src="/logo01.png" 
                  alt="Elora Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain"
                  style={{ maxWidth: 'none' }}
                />
              </div>
            )}
            
            {/* Header */}
            <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-teal-200 dark:border-teal-700">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-xl lg:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 break-words">{entry.word}</h1>
                {entry.phonetic && (
                  <p className="text-xs sm:text-sm md:text-xs lg:text-xs text-teal-600 dark:text-teal-400 font-medium mb-1 sm:mb-2">{entry.phonetic}</p>
                )}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1 sm:mt-2">
                  {entry.category && (
                    <Badge variant="outline" className="bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700 text-[10px] sm:text-xs px-1.5 py-0.5">
                      {entry.category}
                    </Badge>
                  )}
                </div>
              </div>
              {entry.audio_url && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => playAudio(entry.audio_url)}
                  className="flex-shrink-0 border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
                </Button>
              )}
            </div>
          </div>

          {/* Definition */}
          <div className="mb-2 sm:mb-3">
            <h3 className="text-[10px] sm:text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1 sm:mb-1.5">
              Definition
            </h3>
            <p className="text-xs sm:text-sm md:text-xs lg:text-xs text-gray-800 dark:text-gray-200 leading-relaxed">{entry.definition}</p>
          </div>

          {/* Tamil Translation */}
          {entry.tamil_translations?.length ? (
            <div className="mb-2 sm:mb-3 rounded-lg border border-teal-200 bg-teal-50/80 p-2 sm:p-2.5 dark:border-teal-900 dark:bg-teal-900/30">
              <h3 className="text-[10px] sm:text-xs font-semibold text-teal-700 dark:text-teal-200 uppercase tracking-wide mb-1 sm:mb-1.5">
                Tamil Meaning
              </h3>
              <ul className="space-y-0.5 sm:space-y-1">
                {entry.tamil_translations.map((translation, idx) => (
                  <li key={`${entry.id}-tamil-${idx}`} className="text-xs sm:text-sm md:text-xs lg:text-xs text-gray-900 dark:text-gray-100 leading-relaxed">
                    {translation}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Example Sentence */}
          {entry.example_sentence && (
            <div className="mb-2 sm:mb-3">
              <h3 className="text-[10px] sm:text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1 sm:mb-1.5">
                Example
              </h3>
              <p className="text-xs sm:text-sm md:text-xs lg:text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed">
                "{entry.example_sentence}"
              </p>
            </div>
          )}

          {/* Synonyms */}
          {entry.synonyms && entry.synonyms.length > 0 && (
            <div className="mb-2 sm:mb-3">
              <h3 className="text-[10px] sm:text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1 sm:mb-1.5">
                Synonyms
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {entry.synonyms.map((synonym, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700 text-[10px] sm:text-xs px-1.5 py-0.5"
                  >
                    {synonym}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Antonyms */}
          {entry.antonyms && entry.antonyms.length > 0 && (
            <div className="mb-2 sm:mb-3">
              <h3 className="text-[10px] sm:text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1 sm:mb-1.5">
                Antonyms
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {entry.antonyms.map((antonym, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 text-[10px] sm:text-xs px-1.5 py-0.5"
                  >
                    {antonym}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Image */}
          {entry.image_url && (
            <div className="mt-auto pt-2 sm:pt-4">
              <img
                src={entry.image_url}
                alt={entry.word}
                className="w-full max-h-32 sm:max-h-48 object-contain rounded-lg border border-border"
              />
            </div>
          )}

          {/* Page number indicator */}
          <div className="mt-auto pt-2 sm:pt-4 text-center text-xs sm:text-sm text-teal-600 dark:text-teal-400">
            Word {index + 1} of {entriesToShow.length}
          </div>
        </div>
        )
      };
    });
  }, [filteredEntries, entries, localSearchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <div className="relative w-full max-w-[900px] mx-auto flex flex-col gap-6 sm:gap-7 md:gap-8 h-full justify-center">
      {/* Search Bar - Above Book - Always visible with proper spacing and high z-index */}
      <div className="flex-shrink-0 w-full bg-transparent relative z-[110] pointer-events-auto">
        <div className="relative pointer-events-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-teal-400 z-10 pointer-events-none" />
          <Input
            placeholder="Search in dictionary..."
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="pl-10 pr-10 border-teal-200 dark:border-teal-800 focus:border-teal-400 dark:focus:border-teal-600 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm pointer-events-auto touch-manipulation text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            style={{ WebkitAppearance: 'none' }}
          />
          {localSearchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSearchChange('');
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSearchChange('');
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-teal-50 dark:hover:bg-teal-900/30 z-10 pointer-events-auto touch-manipulation"
            >
              <X className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            </Button>
          )}
        </div>
        {localSearchQuery && (
          <p className="text-xs sm:text-sm text-teal-600 dark:text-teal-400 mt-1 sm:mt-2 ml-1 pointer-events-none">
            Found {filteredEntries.length} {filteredEntries.length === 1 ? 'word' : 'words'}
          </p>
        )}
      </div>

      {/* Book Container - with proper spacing from search */}
      <div className="flex-1 flex items-center justify-center min-h-0 w-full">
        <FlipBook pages={pages} />
      </div>
    </div>
  );
}

