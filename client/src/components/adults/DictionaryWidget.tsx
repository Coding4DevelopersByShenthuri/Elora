import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, Plus, Volume2, X, Star, Clock, Book, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';
import { getListeningModuleData } from '@/data/listening-modules/listening-modules-config';
import { DictionaryBook } from '@/components/FlipBook/DictionaryBook';
import { useToast } from '@/hooks/use-toast';
import UserNotificationsService from '@/services/UserNotificationsService';
import { playNotificationSound } from '@/utils/playNotificationSound';

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
  difficulty_level: number;
  usage_frequency: number;
}

interface UserDictionaryWord {
  id: number;
  dictionary_entry: DictionaryEntry;
  mastery_level: number;
  added_at: string;
  last_practiced_at?: string;
  times_practiced: number;
}

interface LocalDictionaryWord {
  id: string;
  word: string;
  definition: string;
  example?: string;
  moduleId: string;
  moduleTitle: string;
  addedAt: string;
}

type DisplayDictionaryWord = UserDictionaryWord & {
  isLocal?: boolean;
  localId?: string;
};

interface DictionaryWidgetProps {
  onClose: () => void;
}

export default function DictionaryWidget({ onClose }: DictionaryWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DictionaryEntry[]>([]);
  const [selectedWord, setSelectedWord] = useState<DictionaryEntry | null>(null);
  const [myDictionary, setMyDictionary] = useState<UserDictionaryWord[]>([]);
  const [localDictionary, setLocalDictionary] = useState<LocalDictionaryWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSyncingVocab, setIsSyncingVocab] = useState(false);
  const [viewMode, setViewMode] = useState<'book' | 'search'>('book'); // Default to book view

  useEffect(() => {
    if (user) {
      loadMyDictionary();
      loadLocalDictionary();
      syncListeningVocabulary();
    }
  }, [user]);

  // Periodic sync check when widget is open (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const syncInterval = setInterval(() => {
      syncListeningVocabulary();
    }, 30000); // Check every 30 seconds for new enrolled modules

    return () => clearInterval(syncInterval);
  }, [user]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setSelectedWord(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const displayDictionary: DisplayDictionaryWord[] = useMemo(() => {
    const localEntries: DisplayDictionaryWord[] = localDictionary.map((entry) => ({
      id: -1,
      dictionary_entry: {
        id: -1,
        word: entry.word,
        definition: entry.definition,
        example_sentence: entry.example,
        category: entry.moduleTitle,
        difficulty_level: 0,
        usage_frequency: 0,
      },
      mastery_level: 0,
      added_at: entry.addedAt,
      times_practiced: 0,
      isLocal: true,
      localId: entry.id,
    }));

    const serverEntries: DisplayDictionaryWord[] = myDictionary.map((entry) => ({
      ...entry,
      isLocal: false,
    }));

    return [...localEntries, ...serverEntries];
  }, [localDictionary, myDictionary]);

  // Convert displayDictionary to DictionaryEntry format for DictionaryBook
  const bookEntries: DictionaryEntry[] = useMemo(() => {
    return displayDictionary.map(item => ({
      id: item.isLocal ? -1 : item.dictionary_entry.id,
      word: item.dictionary_entry.word,
      phonetic: item.dictionary_entry.phonetic,
      definition: item.dictionary_entry.definition,
      example_sentence: item.dictionary_entry.example_sentence,
      audio_url: item.dictionary_entry.audio_url,
      image_url: item.dictionary_entry.image_url,
      synonyms: item.dictionary_entry.synonyms,
      antonyms: item.dictionary_entry.antonyms,
      category: item.dictionary_entry.category,
      difficulty_level: item.dictionary_entry.difficulty_level || 0,
      usage_frequency: item.dictionary_entry.usage_frequency || 0,
    }));
  }, [displayDictionary]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const result = await AdultsAPI.searchDictionary(searchQuery);
      if (result.success && 'data' in result) {
        setSearchResults(result.data?.data || []);
        if (result.data?.data?.length === 1) {
          setSelectedWord(result.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Dictionary search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncListeningVocabulary = async () => {
    if (!user || isSyncingVocab) return;

    const syncedKey = `synced_listening_vocab_${user.id}`;
    try {
      setIsSyncingVocab(true);
      const stored = localStorage.getItem(syncedKey);
      let syncedModules = new Set<string>(stored ? JSON.parse(stored) : []);

      const dictionaryWords = new Set<string>();
      try {
        const dictionaryResult = await AdultsAPI.getMyDictionary();
        if (dictionaryResult.success && 'data' in dictionaryResult) {
          const entries = dictionaryResult.data?.data || [];
          entries.forEach((entry: UserDictionaryWord) => {
            if (entry.dictionary_entry?.word) {
              dictionaryWords.add(entry.dictionary_entry.word.toLowerCase());
            }
          });
          setMyDictionary(entries);
        }
      } catch (err) {
        console.error('Failed to fetch dictionary before syncing vocab:', err);
      }

      let currentLocalEntries: LocalDictionaryWord[] = [];
      if (localKey) {
        try {
          const storedLocal = localStorage.getItem(localKey);
          currentLocalEntries = storedLocal ? JSON.parse(storedLocal) : [];
          setLocalDictionary(currentLocalEntries);
          currentLocalEntries.forEach((entry: LocalDictionaryWord) => {
            dictionaryWords.add(entry.word.toLowerCase());
          });
        } catch (err) {
          console.error('Failed to parse local dictionary entries', err);
        }
      }

      const revalidatedSynced = new Set<string>();
      for (const moduleId of syncedModules) {
        try {
          const moduleData = await getListeningModuleData(moduleId);
          if (!moduleData?.vocabulary?.length) continue;
          const hasWord = moduleData.vocabulary.some((vocab) =>
            dictionaryWords.has(vocab.word.toLowerCase())
          );
          if (hasWord) {
            revalidatedSynced.add(moduleId);
          }
        } catch (err) {
          console.error(`Failed to validate module ${moduleId}:`, err);
        }
      }
      syncedModules = revalidatedSynced;

      const history = await AdultsAPI.getMultiModePracticeHistory('listening', 365);
      if (!history.success || !('data' in history) || !history.data?.data) return;

      const sessions = history.data.data as Array<any>;
      const eligibleModules = new Set<string>();

      sessions.forEach((session) => {
        const moduleId = session?.details?.module_id || session?.content_id;
        if (
          session?.mode === 'listening' &&
          typeof session?.score === 'number' &&
          session.score >= 75 &&
          typeof moduleId === 'string' &&
          !syncedModules.has(moduleId)
        ) {
          eligibleModules.add(moduleId);
        }
      });

      if (!eligibleModules.size) return;

      let didAddAnyWord = false;
      const addedModules: Array<{ title: string; wordCount: number }> = [];

      for (const moduleId of Array.from(eligibleModules)) {
        try {
          const moduleData = await getListeningModuleData(moduleId);
          if (!moduleData?.vocabulary?.length) continue;

          let moduleSynced = false;
          let wordsAdded = 0;

          for (const vocab of moduleData.vocabulary) {
            try {
              const addResult = await AdultsAPI.addToDictionary({ word: vocab.word });
              if (addResult.success) {
                moduleSynced = true;
                didAddAnyWord = true;
                wordsAdded++;
                dictionaryWords.add(vocab.word.toLowerCase());
              } else {
                addLocalDictionaryWord(moduleId, moduleData.module.title, vocab);
                dictionaryWords.add(vocab.word.toLowerCase());
                moduleSynced = true;
                wordsAdded++;
              }
            } catch (err) {
              console.error(`Failed to add vocab "${vocab.word}" to dictionary:`, err);
              addLocalDictionaryWord(moduleId, moduleData.module.title, vocab);
              dictionaryWords.add(vocab.word.toLowerCase());
              moduleSynced = true;
              wordsAdded++;
            }
          }

          if (moduleSynced && wordsAdded > 0) {
            syncedModules.add(moduleId);
            addedModules.push({
              title: moduleData.module.title,
              wordCount: wordsAdded
            });
          }
        } catch (err) {
          console.error(`Failed to sync vocabulary for module ${moduleId}:`, err);
        }
      }

      if (syncedModules.size > 0) {
        localStorage.setItem(syncedKey, JSON.stringify(Array.from(syncedModules)));
      }

      if (didAddAnyWord) {
        await loadMyDictionary();
        
        // Create notification message
        const totalWords = addedModules.reduce((sum, mod) => sum + mod.wordCount, 0);
        let notificationTitle = "New Vocabulary Added! 📚";
        let notificationMessage = '';
        
        if (addedModules.length === 1) {
          notificationMessage = `${addedModules[0].wordCount} word${addedModules[0].wordCount > 1 ? 's' : ''} from "${addedModules[0].title}" added to your dictionary. Score 75% or higher to unlock vocabulary!`;
        } else {
          notificationMessage = `${totalWords} words from ${addedModules.length} module${addedModules.length > 1 ? 's' : ''} added to your dictionary. Check your dictionary to see them! Score 75% or higher to unlock vocabulary.`;
        }
        
        // Show toast notification (immediate feedback)
        toast({
          title: notificationTitle,
          description: notificationMessage,
          duration: 5000,
        });
        playNotificationSound();
        
        // Save notification to profile notifications (persistent)
        if (user) {
          try {
            await UserNotificationsService.create(user.id, {
              type: 'achievement',
              title: notificationTitle,
              message: notificationMessage,
              icon: '📚',
              actionUrl: '/profile#notifications',
              eventKey: `vocab-added-${Date.now()}-${addedModules.map(m => m.title).join('-')}`,
              metadata: {
                wordCount: totalWords,
                moduleCount: addedModules.length,
                modules: addedModules.map(m => ({ title: m.title, wordCount: m.wordCount })),
                timestamp: Date.now(),
              },
            });
          } catch (err) {
            console.error('Failed to create notification:', err);
            // Don't fail the whole sync if notification creation fails
          }
        }
      }
    } catch (error) {
      console.error('Error syncing listening vocabulary:', error);
    } finally {
      setIsSyncingVocab(false);
    }
  };

  const localKey = user ? `local_dictionary_entries_${user.id}` : null;

  const loadLocalDictionary = () => {
    if (!localKey) return;
    try {
      const stored = localStorage.getItem(localKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalDictionary(parsed);
      } else {
        setLocalDictionary([]);
      }
    } catch (error) {
      console.error('Failed to load local dictionary', error);
    }
  };

  const persistLocalDictionary = (entries: LocalDictionaryWord[]) => {
    if (!localKey) return;
    try {
      localStorage.setItem(localKey, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to persist local dictionary', error);
    }
  };

  const loadMyDictionary = async () => {
    try {
      const result = await AdultsAPI.getMyDictionary();
      if (result.success && 'data' in result) {
        setMyDictionary(result.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load my dictionary:', error);
    }
  };

  const addLocalDictionaryWord = (moduleId: string, moduleTitle: string, vocab: { word: string; definition: string; example?: string }) => {
    if (!localKey) return;
    setLocalDictionary((prev) => {
      const exists = prev.some(
        (entry) =>
          entry.word.toLowerCase() === vocab.word.toLowerCase() && entry.moduleId === moduleId
      );
      if (exists) {
        return prev;
      }
      const newEntry: LocalDictionaryWord = {
        id: `${moduleId}:${vocab.word.toLowerCase()}`,
        word: vocab.word,
        definition: vocab.definition,
        example: vocab.example,
        moduleId,
        moduleTitle,
        addedAt: new Date().toISOString(),
      };
      const updated = [...prev, newEntry];
      persistLocalDictionary(updated);
      return updated;
    });
  };

  const handleWordClick = async (word: string) => {
    try {
      const result = await AdultsAPI.lookupWord(word);
      if (result.success && 'data' in result) {
        setSelectedWord(result.data?.data);
      }
    } catch (error) {
      console.error('Word lookup failed:', error);
    }
  };

  const handleAddToDictionary = async (wordId?: number, word?: string) => {
    if (!user) return;
    
    try {
      const result = await AdultsAPI.addToDictionary({
        dictionary_entry_id: wordId,
        word: word,
      });
      
      if (result.success) {
        loadMyDictionary();
      }
    } catch (error) {
      console.error('Failed to add to dictionary:', error);
    }
  };

  const playAudio = (url?: string) => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(err => console.error('Audio play failed:', err));
    }
  };

  const isWordInMyDictionary = (wordId: number) => {
    return myDictionary.some(item => item.dictionary_entry.id === wordId);
  };

  // Book View with backdrop
  if (viewMode === 'book') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Book Container */}
        <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">
          {/* Close button - top right */}
          <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 bg-black/30 backdrop-blur-sm rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Dictionary Book - with proper top spacing to avoid navbar (navbar is ~64-80px) */}
          <div className="flex-1 flex flex-col items-center justify-center pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20 px-2 sm:px-4 md:px-6 lg:px-8 overflow-hidden min-h-0 pointer-events-auto">
            <div className="w-full max-w-[900px] flex flex-col items-center justify-center relative z-[105] h-full pointer-events-auto">
              <DictionaryBook 
                entries={bookEntries} 
              />
            </div>
          </div>

          {/* Floating Search Button - Bottom Right */}
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-auto">
            <Button
              onClick={() => setViewMode('search')}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg rounded-full px-4 py-4 sm:px-6 sm:py-6 h-auto text-sm sm:text-base"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
              <span className="hidden sm:inline">Search New Words</span>
              <span className="sm:hidden">Search</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Search View
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <Card className="relative z-10 bg-card/95 backdrop-blur-xl border-border shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-auto m-2 sm:m-4">
        <CardHeader className="border-b border-border sticky top-0 bg-card/95 z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Search New Words
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
          {/* Search Input */}
          <div className="p-4 border-b border-border bg-teal-50/50 dark:bg-teal-900/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-teal-400" />
              <Input
                placeholder="Search for a word..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-teal-200 dark:border-teal-800 focus:border-teal-400 dark:focus:border-teal-600 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {/* Results */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {loading && (
                <div className="text-center text-muted-foreground py-8">Searching...</div>
              )}

              {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No results found</div>
              )}

              {!loading && searchQuery.length < 2 && (
                <div className="text-center text-muted-foreground py-8">
                  Type at least 2 characters to search
                </div>
              )}

              {searchResults.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all',
                    selectedWord?.id === entry.id
                      ? 'bg-teal-100 dark:bg-teal-900/30 border-teal-400 dark:border-teal-600'
                      : 'bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                  )}
                  onClick={() => setSelectedWord(entry)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{entry.word}</h4>
                        {entry.phonetic && (
                          <span className="text-teal-600 dark:text-teal-400 text-sm">{entry.phonetic}</span>
                        )}
                        {entry.audio_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-teal-100 dark:hover:bg-teal-900/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(entry.audio_url || undefined);
                            }}
                          >
                            <Volume2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {entry.definition}
                      </p>
                    </div>
                    {!isWordInMyDictionary(entry.id) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-teal-100 dark:hover:bg-teal-900/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToDictionary(entry.id);
                        }}
                      >
                        <Plus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Selected Word Detail */}
          {selectedWord && (
            <div className="border-t border-teal-200 dark:border-teal-800 p-4 bg-teal-50/50 dark:bg-teal-900/10 max-h-64 overflow-y-auto">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    {selectedWord.word}
                    {selectedWord.phonetic && (
                      <span className="text-teal-600 dark:text-teal-400 text-base font-normal">
                        {selectedWord.phonetic}
                      </span>
                    )}
                  </h3>
                  {selectedWord.category && (
                    <Badge variant="outline" className="mt-1 bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700">
                      {selectedWord.category}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedWord.audio_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => playAudio(selectedWord.audio_url || undefined)}
                      className="hover:bg-teal-100 dark:hover:bg-teal-900/30"
                    >
                      <Volume2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </Button>
                  )}
                  {!isWordInMyDictionary(selectedWord.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddToDictionary(selectedWord.id)}
                      className="hover:bg-teal-100 dark:hover:bg-teal-900/30"
                    >
                      <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="leading-relaxed text-gray-800 dark:text-gray-200">{selectedWord.definition}</p>
                </div>

                {selectedWord.example_sentence && (
                  <div>
                    <p className="text-sm text-teal-600 dark:text-teal-400 mb-1">Example:</p>
                    <p className="italic text-gray-700 dark:text-gray-300">"{selectedWord.example_sentence}"</p>
                  </div>
                )}

                {selectedWord.synonyms && selectedWord.synonyms.length > 0 && (
                  <div>
                    <p className="text-sm text-teal-600 dark:text-teal-400 mb-1">Synonyms:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedWord.synonyms.map((syn, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/30 bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700"
                          onClick={() => handleWordClick(syn)}
                        >
                          {syn}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Floating Return to Dictionary Button - Bottom Right */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Button
            onClick={() => setViewMode('book')}
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg rounded-full px-4 py-4 sm:px-6 sm:py-6 h-auto text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline">Return to Dictionary</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
