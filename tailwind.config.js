/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS variable-based theme colors
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: 'var(--color-secondary-light)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
        },
        neutral: {
          DEFAULT: 'var(--color-neutral)',
          light: 'var(--color-neutral-light)',
        },
        highlight: {
          DEFAULT: 'var(--color-highlight)',
          light: 'var(--color-highlight-light)',
          muted: 'var(--color-highlight-muted)',
          pale: 'var(--color-highlight-pale)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: 'var(--color-warning-light)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          light: 'var(--color-info-light)',
        },
        // Legacy colors (for backwards compatibility during migration)
        irish: {
          green: 'var(--color-secondary)',
          gold: 'var(--color-highlight)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
