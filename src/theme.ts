import { createTheme } from '@mui/material/styles'

/** The techo palette: warm paper, ink, and a vermilion accent. */
export const tokens = {
  paper: '#faf8f2',
  paperRaised: '#fffefb',
  ink: '#20201d',
  inkSoft: '#6c685f',
  inkFaint: '#a8a298',
  line: '#e9e3d6',
  lineStrong: '#ddd5c4',
  vermilion: '#c0492f',
  vermilionSoft: '#f3ddd6',
  indigo: '#3a4a63',
} as const

export const sans =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
/** Elegant serif used for numerals (dates, hours, counts). */
export const serif =
  "'Newsreader', ui-serif, Georgia, 'Times New Roman', serif"

declare module '@mui/material/styles' {
  interface Palette {
    techo: typeof tokens
  }
  interface PaletteOptions {
    techo?: typeof tokens
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.vermilion, contrastText: '#ffffff' },
    background: { default: tokens.paper, paper: tokens.paperRaised },
    text: {
      primary: tokens.ink,
      secondary: tokens.inkSoft,
      disabled: tokens.inkFaint,
    },
    divider: tokens.line,
    techo: tokens,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: sans,
    button: { textTransform: 'none', fontWeight: 500 },
    h1: { fontWeight: 600 },
  },
  components: {
    // Minimalism over Material: no ripples, but gentle state fades.
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          transition:
            'background-color 160ms ease, color 160ms ease, border-color 160ms ease, opacity 160ms ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          transition:
            'background-color 180ms ease, color 180ms ease, border-color 180ms ease',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          transition: 'background-color 200ms ease, color 200ms ease',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { transition: 'background-color 160ms ease, color 160ms ease' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiTooltip: {
      defaultProps: { arrow: false, enterTouchDelay: 0 },
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.paperRaised,
          color: tokens.inkSoft,
          border: `1px solid ${tokens.line}`,
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: 12,
          lineHeight: 1.6,
          fontWeight: 400,
          maxWidth: 232,
          boxShadow: '0 6px 24px -8px rgba(32,32,29,0.25)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': { height: '100%' },
        body: {
          WebkitFontSmoothing: 'antialiased',
          textRendering: 'optimizeLegibility',
        },
        // Shared entrance keyframes (used via lib/motion helpers).
        // A soft rise + fade — a section settling onto the page.
        '@keyframes techo-rise': {
          from: { opacity: 0, transform: 'translate3d(0, 14px, 0)' },
          to: { opacity: 1, transform: 'none' },
        },
        // Ink soaking in — opacity only.
        '@keyframes techo-fade': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        // Turning to a later page: drifts in from the right.
        '@keyframes techo-page-next': {
          '0%': { opacity: 0, transform: 'translate3d(34px, 0, 0)' },
          '100%': { opacity: 1, transform: 'none' },
        },
        // Turning back: drifts in from the left.
        '@keyframes techo-page-prev': {
          '0%': { opacity: 0, transform: 'translate3d(-34px, 0, 0)' },
          '100%': { opacity: 1, transform: 'none' },
        },
        // Changing scale (day/week/month): rises and settles into focus.
        '@keyframes techo-zoom': {
          '0%': { opacity: 0, transform: 'translate3d(0, 16px, 0) scale(0.982)' },
          '100%': { opacity: 1, transform: 'none' },
        },
        '::selection': { background: tokens.vermilionSoft },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': {
          background: tokens.lineStrong,
          borderRadius: 99,
          border: `3px solid ${tokens.paper}`,
        },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
      },
    },
  },
})
