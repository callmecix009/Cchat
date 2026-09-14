export const brand = {
  green: '#149A5B',
  greenDark: '#0E7A47',
  greenBg: '#E3F4E9',
  greenBorder: '#BCE5CB',
  lime: '#8FF0B4',
  lime2: '#53E89B',
  dark: '#111111',
  surface: '#FCFCF9',
  muted: '#6B6B6B',
  border: '#E9E9E7',
  white: '#FFFFFF',
  text: '#111111',
  textMuted: '#6B6B6B',
  blue: '#0369A1',
  amber: '#B97708',
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
    card: 'shadow-none border border-[#E9E9E7] rounded-[12px]',
    formButtonPrimary:
      'bg-[#111] hover:bg-black text-white font-semibold rounded-[10px] border border-[#111]',
    socialButtonsBlockButton:
      'border border-[#E9E9E7] rounded-[10px] text-[#111] font-medium bg-white hover:bg-[#F7F7F5]',
    footerActionLink: 'text-[#111] hover:text-black',
    headerTitle: 'text-[#111] font-semibold',
    headerSubtitle: 'text-[#6B6B6B]',
    footer: 'hidden',
    footerAction: 'hidden',
    badge: 'hidden',
  },
} as const;
