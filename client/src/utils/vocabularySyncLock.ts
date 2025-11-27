let currentSyncPromise: Promise<unknown> | null = null;

export function runWithVocabularySyncLock<T>(task: () => Promise<T>): Promise<T> {
  if (currentSyncPromise) {
    return currentSyncPromise as Promise<T>;
  }

  const promise = task()
    .catch((error) => {
      throw error;
    })
    .finally(() => {
      currentSyncPromise = null;
    });

  currentSyncPromise = promise;
  return promise;
}

