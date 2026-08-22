export const brand = {
  green: '#149A5B',
  greenDark: '#0E7A47',
  greenBg: '#E3F4E9',
  greenBorder: '#BCE5CB',
  lime: '#8FF0B4',
  lime2: '#53E89B',
  dark: '#17291E',
  surface: '#F4F9F5',
  muted: '#8B9B8F',
  border: '#E4EDE5',
  white: '#FFFFFF',
  text: '#17291E',
  textMuted: '#8B9B8F',
  blue: '#22688A',
  amber: '#E8A222',
  red: '#C74343',
  purple: '#6A4FC0',
  gold: '#B97708',
} as const;

export const clerkTheme = {
  variables: {
    colorPrimary: brand.green,
    colorText: brand.dark,
    colorTextSecondary: brand.muted,
    colorBackground: brand.white,
    colorInputBackground: brand.white,
    colorInputText: brand.dark,
    borderRadius: '0.75rem',
    fontFamily: "'Instrument Sans', sans-serif",
  },
  elements: {
    card: 'shadow-lg border border-[#E4EDE5]',
    formButtonPrimary:
      'bg-[#149A5B] hover:bg-[#0E7A47] text-white font-semibold rounded-xl',
    socialButtonsBlockButton:
      'border border-[#E4EDE5] rounded-xl text-[#17291E] font-medium',
    footerActionLink: 'text-[#149A5B] hover:text-[#0E7A47]',
    headerTitle: 'text-[#17291E] font-bold',
    headerSubtitle: 'text-[#8B9B8F]',
    footer: 'hidden',
    footerAction: 'hidden',
    badge: 'hidden',
  },
} as const;
