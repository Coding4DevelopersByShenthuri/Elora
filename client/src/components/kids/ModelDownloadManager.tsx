import { useState, useEffect } from 'react';
import { Download, CheckCircle, Loader2, HardDrive, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ModelManager } from '@/services/ModelManager';

interface ModelInfo {
  id: string;
  name: string;
  description: string;
  size: string;
  sizeBytes: number;
  category: 'essential' | 'recommended' | 'optional';
  cached: boolean;
}

interface ModelDownloadManagerProps {
  onComplete?: () => void;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  hideHeader?: boolean;
}

const ModelDownloadManager = ({ onComplete, userLevel = 'beginner', hideHeader = false }: ModelDownloadManagerProps) => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadModels();
    loadStorageInfo();

    // Monitor connection status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadModels = async () => {
    try {
      const availableModels = await ModelManager.getAvailableModels();
      
      const modelList: ModelInfo[] = [
        {
          id: 'piper-en-us-lessac-medium',
          name: 'Kid-Friendly Voices',
          description: 'HIGH-QUALITY voices for stories - Natural & Fun! Works offline!',
          size: '28 MB',
          sizeBytes: 28 * 1024 * 1024,
          category: 'essential',
          cached: availableModels.find(m => m.id === 'piper-en-us-lessac-medium')?.cached || false
        },
        {
          id: 'whisper-tiny-en',
          name: 'Speech Recognition (Tiny)',
          description: 'Fast speech-to-text for kids',
          size: '75 MB',
          sizeBytes: 75 * 1024 * 1024,
          category: 'recommended',
          cached: availableModels.find(m => m.id === 'whisper-tiny-en')?.cached || false
        },
        {
          id: 'distilgpt2',
          name: 'AI Tutor (Basic)',
          description: 'Smart feedback and conversations',
          size: '82 MB',
          sizeBytes: 82 * 1024 * 1024,
          category: 'recommended',
          cached: availableModels.find(m => m.id === 'distilgpt2')?.cached || false
        },
        {
          id: 'whisper-base-en',
          name: 'Speech Recognition (Better)',
          description: 'More accurate speech recognition',
          size: '142 MB',
          sizeBytes: 142 * 1024 * 1024,
          category: 'optional',
          cached: availableModels.find(m => m.id === 'whisper-base-en')?.cached || false
        },
        {
          id: 'gpt2',
          name: 'AI Tutor (Advanced)',
          description: 'Better conversations and feedback',
          size: '124 MB',
          sizeBytes: 124 * 1024 * 1024,
          category: 'optional',
          cached: availableModels.find(m => m.id === 'gpt2')?.cached || false
        }
      ];
      
      setModels(modelList);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await ModelManager.getStorageInfo();
      setStorageInfo({
        used: await ModelManager.getCacheSize(),
        available: info.available
      });
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const downloadModel = async (modelId: string, skipRefresh = false) => {
    if (!isOnline) {
      alert('⚠️ No internet connection. Please connect to WiFi to download models.');
      return;
    }

    setDownloadingModel(modelId);
    setDownloadProgress(prev => ({ ...prev, [modelId]: 0 }));
    
    try {
      await ModelManager.downloadModel(modelId, (progress: any) => {
        const percentage = typeof progress === 'number' 
          ? progress 
          : Math.round(progress.percentage) || 0;
        setDownloadProgress(prev => ({ ...prev, [modelId]: percentage }));
      });
      
      // Set to 100% when complete
      setDownloadProgress(prev => ({ ...prev, [modelId]: 100 }));
      
      // Refresh model list if not part of batch download
      if (!skipRefresh) {
        await loadModels();
        await loadStorageInfo();
        
        // Check if all essential models are downloaded
        const updatedModels = await ModelManager.getAvailableModels();
        const essentialDownloaded = models
          .filter(m => m.category === 'essential')
          .every(m => updatedModels.find(um => um.id === m.id)?.cached);
        
        if (essentialDownloaded && onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error('Error downloading model:', error);
      alert('Failed to download model. Please try again.');
      setDownloadProgress(prev => ({ ...prev, [modelId]: 0 }));
    } finally {
      if (!skipRefresh) {
        setDownloadingModel(null);
      }
    }
  };

  const deleteModel = async (modelId: string) => {
    if (confirm('Are you sure you want to delete this model? You can download it again later.')) {
      try {
        await ModelManager.deleteModel(modelId);
        await loadModels();
        await loadStorageInfo();
      } catch (error) {
        console.error('Error deleting model:', error);
      }
    }
  };

  const downloadAllEssential = async () => {
    if (!isOnline) {
      alert('⚠️ No internet connection. Please connect to WiFi to download models.');
      return;
    }

    const essentialModels = models.filter(m => m.category === 'essential' && !m.cached);
    
    if (essentialModels.length === 0) {
      return;
    }

    setIsDownloadingAll(true);
    setOverallProgress(0);
    
    try {
      const totalSize = essentialModels.reduce((sum, m) => sum + m.sizeBytes, 0);
      let completedSize = 0;
      
      for (let i = 0; i < essentialModels.length; i++) {
        const model = essentialModels[i];
        
        setDownloadingModel(model.id);
        setDownloadProgress(prev => ({ ...prev, [model.id]: 0 }));
        
        await ModelManager.downloadModel(model.id, (progress: any) => {
          const percentage = typeof progress === 'number' 
            ? progress 
            : Math.round(progress.percentage) || 0;
          
          // Update individual model progress
          setDownloadProgress(prev => ({ ...prev, [model.id]: percentage }));
          
          // Calculate overall progress
          const currentModelProgress = (percentage / 100) * model.sizeBytes;
          const overall = ((completedSize + currentModelProgress) / totalSize) * 100;
          setOverallProgress(Math.round(overall));
        });
        
        // Mark this model as complete
        setDownloadProgress(prev => ({ ...prev, [model.id]: 100 }));
        completedSize += model.sizeBytes;
        setOverallProgress(Math.round((completedSize / totalSize) * 100));
      }
      
      // Refresh everything at the end
      await loadModels();
      await loadStorageInfo();
      
      // Check if all essential models are downloaded
      const updatedModels = await ModelManager.getAvailableModels();
      const essentialDownloaded = models
        .filter(m => m.category === 'essential')
        .every(m => updatedModels.find(um => um.id === m.id)?.cached);
      
      if (essentialDownloaded && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error downloading models:', error);
      alert('Failed to download some models. Please try again.');
    } finally {
      setIsDownloadingAll(false);
      setDownloadingModel(null);
      setOverallProgress(0);
    }
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'essential': return 'Essential';
      case 'recommended': return 'Recommended';
      case 'optional': return 'Optional';
      default: return '';
    }
  };

  const essentialModels = models.filter(m => m.category === 'essential');
  const recommendedModels = models.filter(m => m.category === 'recommended');
  const optionalModels = models.filter(m => m.category === 'optional');
  
  const allEssentialDownloaded = essentialModels.every(m => m.cached);
  const totalEssentialSize = essentialModels.reduce((sum, m) => sum + m.sizeBytes, 0);

  return (
    <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-3">
      {/* Header */}
      <div className="text-center mb-3 sm:mb-4">
        {!hideHeader && (
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] bg-clip-text text-transparent mb-2">
            Download AI Tutor
          </h2>
        )}
        <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 px-2">
          Download these files once to practice English offline!
        </p>
      </div>

      {/* Connection Status */}
      <Card className={cn(
        "border-2 shadow-sm",
        isOnline ? "border-green-300 bg-green-50 dark:bg-green-900/30 dark:border-green-600" : "border-red-300 bg-red-50 dark:bg-red-900/30 dark:border-red-600"
      )}>
        <CardContent className="py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {isOnline ? (
                <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <WifiOff className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                  {isOnline ? 'Connected to Internet' : '⚠️ No Internet Connection'}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isOnline 
                    ? 'You can download models now' 
                    : 'Connect to WiFi to download models'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Info */}
      <Card className="border-2 border-purple-300 dark:border-purple-600 bg-white/40 dark:bg-gray-800/50 shadow-sm backdrop-blur-sm">
        <CardContent className="py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <HardDrive className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Storage Used</p>
                <p className="text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300">
                  {Math.round((storageInfo.used / storageInfo.available) * 100)}%
                </p>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {formatBytes(storageInfo.used)} used / {formatBytes(storageInfo.available)} available
              </p>
            </div>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (storageInfo.used / storageInfo.available) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Download All Essential */}
      {!allEssentialDownloaded && (
        <Card className="border-2 border-yellow-400 dark:border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/30 shadow-sm">
          <CardContent className="py-3 sm:py-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                    ⚡ Quick Start (Recommended)
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Download all essential models at once ({formatBytes(totalEssentialSize)})
                  </p>
                </div>
                <Button
                  onClick={downloadAllEssential}
                  disabled={!isOnline || isDownloadingAll}
                  className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] w-full sm:w-auto text-sm font-bold shadow-md"
                  size="sm"
                >
                  {isDownloadingAll ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  )}
                  {isDownloadingAll ? 'Downloading...' : 'Download All'}
                </Button>
              </div>
              
              {isDownloadingAll && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400">
                      Overall Progress
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-blue-700 dark:text-blue-400">
                      {overallProgress}%
                    </span>
                  </div>
                  <Progress value={overallProgress} className="h-2 sm:h-2.5" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Essential Models */}
      {essentialModels.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {getCategoryLabel('essential')} - Required for Offline Mode
          </h3>
          <div className="grid gap-4">
            {essentialModels.map(model => (
              <ModelCard
                key={model.id}
                model={model}
                isDownloading={downloadingModel === model.id}
                downloadProgress={downloadProgress[model.id] || 0}
                onDownload={downloadModel}
                onDelete={deleteModel}
                isOnline={isOnline}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Models */}
      {recommendedModels.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {getCategoryLabel('recommended')} - Better Performance
          </h3>
          <div className="grid gap-3 sm:gap-4">
            {recommendedModels.map(model => (
              <ModelCard
                key={model.id}
                model={model}
                isDownloading={downloadingModel === model.id}
                downloadProgress={downloadProgress[model.id] || 0}
                onDownload={downloadModel}
                onDelete={deleteModel}
                isOnline={isOnline}
              />
            ))}
          </div>
        </div>
      )}

      {/* Optional Models */}
      {optionalModels.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {getCategoryLabel('optional')} - Advanced Features
          </h3>
          <div className="grid gap-3 sm:gap-4">
            {optionalModels.map(model => (
              <ModelCard
                key={model.id}
                model={model}
                isDownloading={downloadingModel === model.id}
                downloadProgress={downloadProgress[model.id] || 0}
                onDownload={downloadModel}
                onDelete={deleteModel}
                isOnline={isOnline}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Downloaded Success Message */}
      {allEssentialDownloaded && (
        <Card className="border-2 border-green-400 dark:border-green-500 bg-green-50/50 dark:bg-green-900/30 shadow-sm">
          <CardContent className="py-4 sm:py-6 text-center">
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 dark:text-green-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🎉 All Set! Ready to Learn Offline!
            </h3>
            <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
              You can now practice English without internet!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Model Card Component
interface ModelCardProps {
  model: ModelInfo;
  isDownloading: boolean;
  downloadProgress: number;
  onDownload: (modelId: string) => void;
  onDelete: (modelId: string) => void;
  isOnline: boolean;
}

const ModelCard = ({ model, isDownloading, downloadProgress, onDownload, onDelete, isOnline }: ModelCardProps) => {
  return (
    <Card className={cn(
      "border-2 transition-all duration-300 shadow-sm backdrop-blur-sm",
      model.cached 
        ? "border-green-400 dark:border-green-500 bg-white/30 dark:bg-green-900/30" 
        : "border-gray-300 dark:border-gray-600 bg-white/40 dark:bg-gray-800/50"
    )}>
      <CardContent className="py-3 sm:py-4">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">{model.name}</h4>
              {model.cached && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />}
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">
              {model.description}
            </p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Size: {model.size}
            </p>
            
            {isDownloading && (
              <div className="mt-2 sm:mt-3">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400">Downloading...</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-blue-700 dark:text-blue-400">{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} className="h-1.5 sm:h-2" />
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0">
            {model.cached ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(model.id)}
                className="text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-900/20 text-xs sm:text-sm h-8 sm:h-9 font-bold border-2 border-red-400 dark:border-red-600"
              >
                Delete
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onDownload(model.id)}
                disabled={!isOnline || isDownloading}
                className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] h-8 sm:h-9 px-2 sm:px-3 font-bold shadow-md"
              >
                {isDownloading ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelDownloadManager;

