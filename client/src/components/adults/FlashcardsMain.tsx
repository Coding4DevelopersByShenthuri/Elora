import { useState, useEffect } from 'react';
import { FileText, Plus, BookOpen, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import flashcardsConfig from '@/data/flashcards/flashcard-config.json';
import { AdultsAPI } from '@/services/ApiService';
import FlashcardsSystem from './FlashcardsSystem';

interface FlashcardDeck {
  id: number;
  title: string;
  description?: string;
  card_count: number;
  is_default?: boolean;
}

interface FlashcardMainProps {
  onClose?: () => void;
}

export default function FlashcardsMain({ onClose }: FlashcardMainProps) {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<number | null>(null);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const result = await AdultsAPI.getFlashcardDecks();
      if (result.success && 'data' in result) {
        setDecks(result.data?.data || []);
        // Auto-select default deck if available
        const defaultDeck = result.data?.data?.find((d: FlashcardDeck) => d.is_default);
        if (defaultDeck) {
          setSelectedDeck(defaultDeck.id);
        }
      }
    } catch (error) {
      console.error('Failed to load decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = async () => {
    try {
      const result = await AdultsAPI.createFlashcardDeck({
        title: newDeckTitle,
        description: newDeckDescription,
        is_default: false,
      });

      if (result.success) {
        setNewDeckTitle('');
        setNewDeckDescription('');
        setShowCreateDeck(false);
        loadDecks();
      }
    } catch (error) {
      console.error('Failed to create deck:', error);
    }
  };

  if (selectedDeck) {
    return (
      <FlashcardsSystem 
        onClose={onClose ? onClose : () => setSelectedDeck(null)} 
        defaultDeckId={selectedDeck}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Manage Your Decks</h2>
        <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6">Create and organize your flashcard decks</p>
      </div>

      <Card className="bg-card/80 backdrop-blur-xl border-primary/30 shadow-2xl w-full flex flex-col dark:bg-slate-900/60 dark:border-emerald-500/30">
        {onClose && (
          <CardHeader className="border-b border-primary/30 dark:border-emerald-500/30">
            <div className="flex items-center justify-end">
              <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground dark:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
        )}
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-end">
              <Button
                onClick={() => setShowCreateDeck(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Deck
              </Button>
            </div>

            {showCreateDeck && (
              <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
                <CardHeader>
                  <CardTitle className="text-foreground dark:text-white">Create New Deck</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-foreground dark:text-cyan-200">Deck Title</Label>
                    <Input
                      value={newDeckTitle}
                      onChange={(e) => setNewDeckTitle(e.target.value)}
                      className="bg-card/60 border-primary/30 text-foreground dark:bg-slate-800 dark:border-emerald-500/30 dark:text-white"
                      placeholder="e.g., Business Vocabulary"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground dark:text-cyan-200">Description (Optional)</Label>
                    <Input
                      value={newDeckDescription}
                      onChange={(e) => setNewDeckDescription(e.target.value)}
                      className="bg-card/60 border-primary/30 text-foreground dark:bg-slate-800 dark:border-emerald-500/30 dark:text-white"
                      placeholder="Brief description of this deck"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateDeck}
                      disabled={!newDeckTitle.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                    >
                      Create
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateDeck(false);
                        setNewDeckTitle('');
                        setNewDeckDescription('');
                      }}
                      className="border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="text-center py-12 text-muted-foreground dark:text-cyan-100/70">Loading decks...</div>
            ) : decks.length === 0 ? (
              <Card className="bg-card/80 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-primary dark:text-emerald-300" />
                  <p className="text-muted-foreground dark:text-cyan-100/70 mb-4">No flashcard decks yet</p>
                  <Button
                    onClick={() => setShowCreateDeck(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Deck
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map((deck) => (
                  <Card
                    key={deck.id}
                    className="bg-card/60 backdrop-blur-xl border-primary/30 hover:border-primary/50 cursor-pointer transition-all dark:bg-slate-800/30 dark:border-emerald-500/30 dark:hover:border-emerald-400/50"
                    onClick={() => setSelectedDeck(deck.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <BookOpen className="h-8 w-8 text-primary dark:text-emerald-300" />
                        {deck.is_default && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                            Default
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground dark:text-white mb-2">{deck.title}</h3>
                      {deck.description && (
                        <p className="text-sm text-muted-foreground dark:text-cyan-100/70 mb-4">{deck.description}</p>
                      )}
                      <div className="text-sm text-muted-foreground dark:text-cyan-100/60">
                        {deck.card_count} {deck.card_count === 1 ? 'card' : 'cards'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

