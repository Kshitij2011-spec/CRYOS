/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // ─── Semantic theme tokens (CSS var-driven) ─────────────────────
        canvas: 'var(--bg-canvas)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
          inset: 'var(--bg-surface-inset)',
          muted: 'var(--bg-surface-muted)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
          strong: 'var(--border-strong)',
        },
        foreground: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent-cyan)',
          primary: 'var(--accent-primary)',
          violet: 'var(--accent-violet)',
        },
        status: {
          success:  'var(--status-success)',
          warning:  'var(--status-warning)',
          critical: 'var(--status-critical)',
          info:     'var(--status-info)',
        },
        // ─── Polar slate palette extensions ─────────────────────────────
        slate: {
          950: '#070b14',
          900: '#0e1626',
          850: '#111c2e',
          800: '#1e293b',
        },
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
      },
      borderRadius: {
        card: '0.625rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
