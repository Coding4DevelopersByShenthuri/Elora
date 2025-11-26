/**
 * Multi-Mode Practice Modules Configuration
 * Defines all modules across all 4 modes (Listening, Speaking, Reading, Writing)
 * This is used for progress calculation
 */

import { listeningModules } from './listening-modules/listening-modules-config';

export interface ModuleConfig {
  id: string;
  title: string;
  mode: 'listening' | 'speaking' | 'reading' | 'writing';
}

// Listening modules (6 modules)
export const listeningModulesConfig: ModuleConfig[] = listeningModules.map(m => ({
  id: m.id,
  title: m.title,
  mode: 'listening' as const
}));

// Speaking modules (to be added in future)
export const speakingModulesConfig: ModuleConfig[] = [
  // Future modules will be added here
];

// Reading modules (to be added in future)
export const readingModulesConfig: ModuleConfig[] = [
  // Future modules will be added here
];

// Writing modules (to be added in future)
export const writingModulesConfig: ModuleConfig[] = [
  // Future modules will be added here
];

// All modules across all modes
export const allMultiModeModules: ModuleConfig[] = [
  ...listeningModulesConfig,
  ...speakingModulesConfig,
  ...readingModulesConfig,
  ...writingModulesConfig
];

// Get total module count by mode
export const getTotalModulesByMode = () => {
  return {
    listening: listeningModulesConfig.length,
    speaking: speakingModulesConfig.length,
    reading: readingModulesConfig.length,
    writing: writingModulesConfig.length,
    total: allMultiModeModules.length
  };
};

// Get module by ID
export const getModuleById = (moduleId: string): ModuleConfig | undefined => {
  return allMultiModeModules.find(m => m.id === moduleId);
};

