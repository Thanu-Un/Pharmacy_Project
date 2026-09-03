/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Khmer OS Battambang"', 'Battambang', 'sans-serif'],
      },
      colors: {
        // Bespoke Medical Ocean Blue (replacing generic indigo)
        indigo: {
          50: '#f4f6fb',
          100: '#e8edf6',
          200: '#cbd8eb',
          300: '#9ebbe0',
          400: '#6a9bd1',
          500: '#437fc4',
          600: '#3064a3',
          700: '#275083',
          800: '#23446c',
          900: '#213a5a',
          950: '#15253b',
        },
        // Premium Clinical Slate (softer and cooler)
        slate: {
          50: '#f8f9fa',
          100: '#f0f2f5',
          200: '#e1e5eb',
          300: '#c5ccd6',
          400: '#a3adbd',
          500: '#8491a3',
          600: '#6b7787',
          700: '#56606d',
          800: '#474f59',
          900: '#3d434b',
          950: '#282b31',
        },
        // Minty Success Green
        emerald: {
          50: '#f2fbf6',
          100: '#e1f7eb',
          200: '#c5ecd6',
          300: '#9cdbbd',
          400: '#6bc39f',
          500: '#44a883',
          600: '#308665',
          700: '#276a52',
          800: '#235543',
          900: '#1f4638',
          950: '#102720',
        },
        // Muted Warning Amber
        amber: {
          50: '#fffbf2',
          100: '#fff4de',
          200: '#ffe3b0',
          300: '#ffcc78',
          400: '#ffac3d',
          500: '#fa8e14',
          600: '#db6b06',
          700: '#b64c09',
          800: '#903a0f',
          900: '#753110',
          950: '#431705',
        },
        // Clinical Alert Rose
        rose: {
          50: '#fdf4f6',
          100: '#fae6eb',
          200: '#f5ccd5',
          300: '#eba3b4',
          400: '#de708b',
          500: '#cd4666',
          600: '#b12c4b',
          700: '#95223c',
          800: '#7d2035',
          900: '#6a1f31',
          950: '#3c0d19',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(40, 43, 49, 0.05)',
        'premium': '0 8px 30px rgba(40, 43, 49, 0.08), 0 4px 10px rgba(40, 43, 49, 0.03)',
      }
    },
  },
  plugins: [],
}
