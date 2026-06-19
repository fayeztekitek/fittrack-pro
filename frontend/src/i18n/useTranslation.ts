import { useUIStore } from '../stores/uiStore';
import { translations } from './translations';

export function useTranslation() {
  const { language, setLanguage } = useUIStore();

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English if key is missing in French
        let fallback: any = translations['en'];
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }

    return current;
  };

  return { t, language, setLanguage };
}
