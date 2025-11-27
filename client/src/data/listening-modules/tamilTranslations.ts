import rawTranslations from './listening-tamil-translations.json';

type ModuleTranslationMap = Record<string, Record<string, string>>;

const normalizedModuleMap: ModuleTranslationMap = {};
const wordLookup = new Map<string, string>();

const source = rawTranslations as ModuleTranslationMap;

for (const [moduleId, entries] of Object.entries(source)) {
  const moduleMap: Record<string, string> = {};
  for (const [word, translation] of Object.entries(entries)) {
    const key = word.toLowerCase();
    moduleMap[key] = translation;
    if (!wordLookup.has(key)) {
      wordLookup.set(key, translation);
    }
  }
  normalizedModuleMap[moduleId] = moduleMap;
}

export const getModuleTamilTranslations = (moduleId: string) =>
  normalizedModuleMap[moduleId] ?? {};

export const getTamilTranslationForWord = (word: string, moduleId?: string) => {
  const lowerWord = word.toLowerCase();
  if (moduleId) {
    const moduleTranslation = normalizedModuleMap[moduleId]?.[lowerWord];
    if (moduleTranslation) return moduleTranslation;
  }
  return wordLookup.get(lowerWord);
};

export default normalizedModuleMap;

