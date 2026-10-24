/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#F8F5F0',
          lightEnd: '#F2ECE1',
          dark: '#0B100D',
          darkEnd: '#101713',
        },
        surface: {
          light: '#FFFFFF',
          cream: '#FBEBD6',
          subdued: '#F7E7D0',
          iconPad: '#F0D9B5',
          inset: '#F3ECE0',
          dark: '#121915',
          darkSubdued: '#19241E',
          darkIconPad: '#23322A',
          darkInset: '#0D1411',
        },
        panel: {
          light: '#FFFFFF',
          lightInset: '#F7E7D0',
          dark: '#121915',
          darkInset: '#19241E',
        },
        farm: {
          olive: '#4B5C1E',
          oliveLight: '#6B7A2F',
          oliveDark: '#3E5A1E',
          oliveSubtle: '#F0F4E8',
          amber: '#D97B2E',
          amberWarm: '#C17A3D',
          amberSubtle: '#FEF4E8',
          obsidian: '#1A1A1A',
          charcoal: '#2A2A2A',
          stone: '#8A8A8A',
          earthGray: '#5C5C5C',
          creamBg: '#F7E7D0',
        },
        accent: {
          lime: '#B8F234',
          limeHover: '#A4DE23',
          emerald: '#4B5C1E',
          emeraldHover: '#3E5A1E',
          emeraldLight: '#F0F4E8',
          forest: '#0B100D',
          charcoal: '#1A1A1A',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', 'Sora', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"Geist Mono"', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'panel': '22px',
        'card': '16px',
        'pill': '9999px',
        'circle': '50%',
      },
      boxShadow: {
        'panel': '0 1px 3px rgba(26, 26, 26, 0.02), 0 8px 24px -4px rgba(26, 26, 26, 0.06)',
        'panel-hover': '0 4px 12px rgba(26, 26, 26, 0.04), 0 16px 32px -6px rgba(26, 26, 26, 0.08)',
        'floating': '0 20px 48px -8px rgba(26, 26, 26, 0.14), 0 4px 12px 0 rgba(26, 26, 26, 0.04)',
        'obsidian-glow': '0 4px 16px rgba(26, 26, 26, 0.25)',
        'amber-glow': '0 4px 16px rgba(217, 123, 46, 0.35)',
        'olive-glow': '0 4px 16px rgba(75, 92, 30, 0.35)',
        'lime-glow': '0 4px 16px rgba(184, 242, 52, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
      }
    },
  },
  plugins: [],
};