import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, Plus, Volume2, X, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';
import { getListeningModuleData } from '@/data/listening-modules/listening-modules-config';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DictionaryEntry[]>([]);
  const [selectedWord, setSelectedWord] = useState<DictionaryEntry | null>(null);
const [myDictionary, setMyDictionary] = useState<UserDictionaryWord[]>([]);
  const [localDictionary, setLocalDictionary] = useState<LocalDictionaryWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'my-words'>('search');
  const [isSyncingVocab, setIsSyncingVocab] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyDictionary();
      loadLocalDictionary();
      syncListeningVocabulary();
    }
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

      // Re-validate previously synced modules in case words were not added earlier
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

      for (const moduleId of Array.from(eligibleModules)) {
        try {
          const moduleData = await getListeningModuleData(moduleId);
          if (!moduleData?.vocabulary?.length) continue;

          let moduleSynced = false;

          for (const vocab of moduleData.vocabulary) {
            try {
              const addResult = await AdultsAPI.addToDictionary({ word: vocab.word });
              if (addResult.success) {
                moduleSynced = true;
                didAddAnyWord = true;
                dictionaryWords.add(vocab.word.toLowerCase());
              } else {
                addLocalDictionaryWord(moduleId, moduleData.module.title, vocab);
                dictionaryWords.add(vocab.word.toLowerCase());
                moduleSynced = true;
              }
            } catch (err) {
              console.error(`Failed to add vocab "${vocab.word}" to dictionary:`, err);
              addLocalDictionaryWord(moduleId, moduleData.module.title, vocab);
              dictionaryWords.add(vocab.word.toLowerCase());
              moduleSynced = true;
            }
          }

          if (moduleSynced) {
            syncedModules.add(moduleId);
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

  const removeLocalDictionaryWord = (localId: string) => {
    setLocalDictionary((prev) => {
      const updated = prev.filter((entry) => entry.id !== localId);
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
        if (selectedWord) {
          // Refresh selected word to show it's been added
        }
      }
    } catch (error) {
      console.error('Failed to add to dictionary:', error);
    }
  };

  const handleRemoveDictionaryEntry = async (entry: DisplayDictionaryWord) => {
    if (entry.isLocal && entry.localId) {
      removeLocalDictionaryWord(entry.localId);
      return;
    }

    try {
      const result = await AdultsAPI.removeFromDictionary(entry.id);
      if (result.success) {
        loadMyDictionary();
      }
    } catch (error) {
      console.error('Failed to remove from dictionary:', error);
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

  return (
    <Card className="bg-slate-900/95 backdrop-blur-xl border-purple-500/30 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-auto">
      <CardHeader className="border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            Dictionary
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('search')}
            className={cn(
              activeTab === 'search' && 'bg-purple-500/20 text-purple-300'
            )}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button
            variant={activeTab === 'my-words' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('my-words')}
            className={cn(
              activeTab === 'my-words' && 'bg-purple-500/20 text-purple-300'
            )}
          >
            <Star className="h-4 w-4 mr-2" />
            My Words ({myDictionary.length})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        {activeTab === 'search' ? (
          <>
            {/* Search Input */}
            <div className="p-4 border-b border-purple-500/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-300/50" />
                <Input
                  placeholder="Search for a word..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-purple-500/30 text-white"
                />
              </div>
            </div>

            {/* Results */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {loading && (
                  <div className="text-center text-cyan-300/70 py-8">Searching...</div>
                )}

                {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center text-cyan-300/70 py-8">No results found</div>
                )}

                {!loading && searchQuery.length < 2 && (
                  <div className="text-center text-cyan-300/70 py-8">
                    Type at least 2 characters to search
                  </div>
                )}

                {searchResults.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      selectedWord?.id === entry.id
                        ? 'bg-purple-500/20 border-purple-400/50'
                        : 'bg-slate-800/30 border-purple-500/20 hover:bg-slate-800/50'
                    )}
                    onClick={() => setSelectedWord(entry)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{entry.word}</h4>
                          {entry.phonetic && (
                            <span className="text-cyan-300/70 text-sm">{entry.phonetic}</span>
                          )}
                          {entry.audio_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                playAudio(entry.audio_url || undefined);
                              }}
                            >
                              <Volume2 className="h-4 w-4 text-blue-400" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-cyan-100/80 mt-1 line-clamp-2">
                          {entry.definition}
                        </p>
                      </div>
                      {!isWordInMyDictionary(entry.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToDictionary(entry.id);
                          }}
                        >
                          <Plus className="h-4 w-4 text-green-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Selected Word Detail */}
            {selectedWord && (
              <div className="border-t border-purple-500/30 p-4 bg-slate-800/30 max-h-64 overflow-y-auto">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {selectedWord.word}
                      {selectedWord.phonetic && (
                        <span className="text-cyan-300/70 text-base font-normal">
                          {selectedWord.phonetic}
                        </span>
                      )}
                    </h3>
                    {selectedWord.category && (
                      <Badge variant="outline" className="mt-1 bg-purple-500/20 text-purple-300 border-purple-400/30">
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
                      >
                        <Volume2 className="h-5 w-5 text-blue-400" />
                      </Button>
                    )}
                    {!isWordInMyDictionary(selectedWord.id) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddToDictionary(selectedWord.id)}
                      >
                        <Plus className="h-5 w-5 text-green-400" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-cyan-100/90 leading-relaxed">{selectedWord.definition}</p>
                  </div>

                  {selectedWord.example_sentence && (
                    <div>
                      <p className="text-sm text-cyan-300/70 mb-1">Example:</p>
                      <p className="text-cyan-100/80 italic">"{selectedWord.example_sentence}"</p>
                    </div>
                  )}

                  {selectedWord.synonyms && selectedWord.synonyms.length > 0 && (
                    <div>
                      <p className="text-sm text-cyan-300/70 mb-1">Synonyms:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedWord.synonyms.map((syn, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-blue-500/20 text-blue-300 border-blue-400/30 cursor-pointer hover:bg-blue-500/30"
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
          </>
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {displayDictionary.length === 0 ? (
                <div className="text-center text-cyan-300/70 py-8">
                  No words saved yet. Search and add words to your dictionary!
                </div>
              ) : (
                displayDictionary.map((item) => (
                  <div
                    key={`${item.isLocal ? 'local' : 'server'}-${item.isLocal ? item.localId : item.id}`}
                    className="p-4 rounded-lg border bg-slate-800/30 border-purple-500/20 hover:bg-slate-800/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">
                            {item.dictionary_entry.word}
                          </h4>
                          {item.isLocal && item.dictionary_entry.category && (
                            <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                              {item.dictionary_entry.category}
                            </Badge>
                          )}
                          {item.mastery_level >= 80 && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                              Mastered
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-cyan-100/80 line-clamp-2">
                          {item.dictionary_entry.definition}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-cyan-300/60">
                          <span>Mastery: {Math.round(item.mastery_level)}%</span>
                          <span>Practiced: {item.times_practiced} times</span>
                          {item.last_practiced_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(item.last_practiced_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDictionaryEntry(item)}
                      >
                        <X className="h-4 w-4 text-rose-400" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

