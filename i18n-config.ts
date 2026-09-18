export const locales = ['en', 'sw'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  sw: 'Kiswahili'
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}