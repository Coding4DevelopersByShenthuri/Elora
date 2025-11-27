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

  // Filter entries based on search query
  const filteredEntries = useMemo(() => {
    if (!localSearchQuery.trim()) return entries;
    const query = localSearchQuery.toLowerCase();
    return entries.filter(entry => 
      entry.word.toLowerCase().includes(query) ||
      entry.definition.toLowerCase().includes(query) ||
      entry.example_sentence?.toLowerCase().includes(query) ||
      entry.category?.toLowerCase().includes(query)
    );
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
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your Dictionary</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">No words yet. Start adding words to your dictionary!</p>
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
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Results Found</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Try a different search term</p>
                <p className="text-sm text-teal-600 dark:text-teal-400 mt-2">Searching for: "{localSearchQuery}"</p>
              </div>
            )
          }
        ];
      }
    }

    return entriesToShow.map((entry, index) => ({
      id: entry.id || index,
      content: (
        <div className="h-full flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto bg-white dark:bg-slate-900 hide-scrollbar">
          {/* Header */}
          <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-teal-200 dark:border-teal-700">
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 break-words">{entry.word}</h1>
                {entry.phonetic && (
                  <p className="text-sm sm:text-base md:text-lg text-teal-600 dark:text-teal-400 font-medium mb-1 sm:mb-2">{entry.phonetic}</p>
                )}
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                  {entry.category && (
                    <Badge variant="outline" className="bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700 text-xs sm:text-sm">
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
          <div className="mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1 sm:mb-2">
              Definition
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed">{entry.definition}</p>
          </div>

          {/* Example Sentence */}
          {entry.example_sentence && (
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1 sm:mb-2">
                Example
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed">
                "{entry.example_sentence}"
              </p>
            </div>
          )}

          {/* Synonyms */}
          {entry.synonyms && entry.synonyms.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1 sm:mb-2">
                Synonyms
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {entry.synonyms.map((synonym, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700 text-xs sm:text-sm"
                  >
                    {synonym}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Antonyms */}
          {entry.antonyms && entry.antonyms.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1 sm:mb-2">
                Antonyms
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {entry.antonyms.map((antonym, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 text-xs sm:text-sm"
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
    }));
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
      <div className="flex-shrink-0 w-full bg-transparent relative z-[110]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-teal-400 z-10" />
          <Input
            placeholder="Search in dictionary..."
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10 border-teal-200 dark:border-teal-800 focus:border-teal-400 dark:focus:border-teal-600 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm"
          />
          {localSearchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSearchChange('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-teal-50 dark:hover:bg-teal-900/30 z-10"
            >
              <X className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            </Button>
          )}
        </div>
        {localSearchQuery && (
          <p className="text-xs sm:text-sm text-teal-600 dark:text-teal-400 mt-1 sm:mt-2 ml-1">
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

