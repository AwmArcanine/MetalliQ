
import { translations, Locale } from '../locales';

export const useTranslation = (locale: Locale) => {
  const t = (key: string, replacements?: Record<string, string>): string => {
    let translation = key.split('.').reduce((obj, k) => obj && obj[k], translations[locale]);

    if (translation && replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, replacements[rKey]);
        });
    }

    return translation || key; // Fallback to key if translation not found
  };

  return { t };
};
