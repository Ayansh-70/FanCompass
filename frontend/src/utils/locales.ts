export type Bcp47Locale = 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'ar-SA' | 'zh-CN';

// Helper map to convert bare ISO codes to BCP-47 for Speech API
export const LOCALE_MAP: Record<string, Bcp47Locale> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ar: 'ar-SA',
  zh: 'zh-CN',
};
