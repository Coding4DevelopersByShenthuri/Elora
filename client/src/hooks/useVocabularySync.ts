import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdultsAPI } from '@/services/ApiService';
import { getListeningModuleData } from '@/data/listening-modules/listening-modules-config';
import { useToast } from '@/hooks/use-toast';
import UserNotificationsService from '@/services/UserNotificationsService';
import { playNotificationSound } from '@/utils/playNotificationSound';
import { runWithVocabularySyncLock } from '@/utils/vocabularySyncLock';
import { getTamilTranslationForWord } from '@/data/listening-modules/tamilTranslations';
import { logger } from '@/utils/logger';

export function useVocabularySync() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    // Check for valid token before making any API calls
    const token = localStorage.getItem('speakbee_auth_token');
    if (!token || token === 'local-token') {
      return; // Don't make API calls without a valid token
    }

    const syncListeningVocabulary = () => runWithVocabularySyncLock(async () => {
      // Double-check token is still valid before each sync
      const currentToken = localStorage.getItem('speakbee_auth_token');
      if (!currentToken || currentToken === 'local-token') {
        return; // Token was removed, stop syncing
      }
      const syncedKey = `synced_listening_vocab_${user.id}`;
      try {
        const stored = localStorage.getItem(syncedKey);
        let syncedModules = new Set<string>(stored ? JSON.parse(stored) : []);

        const dictionaryWords = new Set<string>();
        try {
          const dictionaryResult = await AdultsAPI.getMyDictionary();
          if (dictionaryResult.success && 'data' in dictionaryResult) {
            const entries = dictionaryResult.data?.data || [];
            entries.forEach((entry: any) => {
              if (entry.dictionary_entry?.word) {
                dictionaryWords.add(entry.dictionary_entry.word.toLowerCase());
              }
            });
          }
        } catch (err) {
          logger.error('Failed to fetch dictionary before syncing vocab:', err);
        }

        const localKey = `local_dictionary_entries_${user.id}`;
        if (localKey) {
          try {
            const storedLocal = localStorage.getItem(localKey);
            const currentLocalEntries = storedLocal ? JSON.parse(storedLocal) : [];
            currentLocalEntries.forEach((entry: any) => {
              dictionaryWords.add(entry.word.toLowerCase());
            });
          } catch (err) {
            logger.error('Failed to parse local dictionary entries', err);
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
            logger.error(`Failed to validate module ${moduleId}:`, err);
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

        const addedModules: Array<{ moduleId: string; title: string; wordCount: number }> = [];

        for (const moduleId of Array.from(eligibleModules)) {
          try {
            const moduleData = await getListeningModuleData(moduleId);
            if (!moduleData?.vocabulary?.length) continue;

            let wordsAdded = 0;

            for (const vocab of moduleData.vocabulary) {
              try {
                const addResult = await AdultsAPI.addToDictionary({ word: vocab.word });
                if (addResult.success) {
                  wordsAdded++;
                  dictionaryWords.add(vocab.word.toLowerCase());
                } else {
                  // Add to local dictionary
                  const localKey = `local_dictionary_entries_${user.id}`;
                  if (localKey) {
                    try {
                      const storedLocal = localStorage.getItem(localKey);
                      const currentLocalEntries = storedLocal ? JSON.parse(storedLocal) : [];
                      const tamilTranslation = getTamilTranslationForWord(vocab.word, moduleId);
                      const newEntry = {
                        id: `local_${Date.now()}_${Math.random()}`,
                        word: vocab.word,
                        definition: vocab.definition || '',
                        example: vocab.example,
                        moduleId,
                        moduleTitle: moduleData.module.title,
                        addedAt: new Date().toISOString(),
                        tamilTranslation,
                      };
                      const updated = [...currentLocalEntries, newEntry];
                      localStorage.setItem(localKey, JSON.stringify(updated));
                    } catch (err) {
                      logger.error('Failed to add local dictionary word', err);
                    }
                  }
                  dictionaryWords.add(vocab.word.toLowerCase());
                  wordsAdded++;
                }
              } catch (err) {
                logger.error(`Failed to add vocab "${vocab.word}" to dictionary:`, err);
                wordsAdded++;
              }
            }

            if (wordsAdded > 0 && moduleData?.module) {
              syncedModules.add(moduleId);
              addedModules.push({
                moduleId,
                title: moduleData.module.title,
                wordCount: wordsAdded
              });
            }
          } catch (err) {
            logger.error(`Failed to sync vocabulary for module ${moduleId}:`, err);
          }
        }

        if (syncedModules.size > 0) {
          localStorage.setItem(syncedKey, JSON.stringify(Array.from(syncedModules)));
        }

        if (addedModules.length > 0) {
          const totalWords = addedModules.reduce((sum, mod) => sum + mod.wordCount, 0);
          
          // Create notification message
          const notificationTitle = "New Vocabulary Added! 📚";
          const notificationMessage =
            addedModules.length === 1
              ? `${addedModules[0].wordCount} word${addedModules[0].wordCount > 1 ? 's' : ''} from "${addedModules[0].title}" added to your dictionary. Score 75% or higher to unlock vocabulary!`
              : `${totalWords} words from ${addedModules.length} module${addedModules.length > 1 ? 's' : ''} added to your dictionary. Check your dictionary to see them! Score 75% or higher to unlock vocabulary.`;
          const moduleIdsSignature = addedModules.map((m) => m.moduleId).sort().join('-') || `batch-${Date.now()}`;
          
          toast({
            title: notificationTitle,
            description: notificationMessage,
            duration: 5000,
          });
          playNotificationSound();
          
          try {
            await UserNotificationsService.create(user.id, {
              type: 'achievement',
              title: notificationTitle,
              message: notificationMessage,
              icon: '📚',
              actionUrl: '/profile#notifications',
              eventKey: `vocab-sync-${moduleIdsSignature}`,
              metadata: {
                wordCount: totalWords,
                moduleCount: addedModules.length,
                modules: addedModules.map(m => ({
                  moduleId: m.moduleId,
                  title: m.title,
                  wordCount: m.wordCount
                })),
                timestamp: Date.now(),
              },
            });
          } catch (err) {
            logger.error('Failed to create notification:', err);
          }
        }
      } catch (error) {
        logger.error('Error syncing listening vocabulary:', error);
      }
    });

    // Run sync on mount
    syncListeningVocabulary();

    // Run sync every 30 seconds
    const syncInterval = setInterval(() => {
      syncListeningVocabulary();
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [user, toast]);
}

