/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#14131a',     // deep purple-black base
          secondary: '#0f0f14',   // deepest layer
          panel: '#1c1a24',       // main surfaces (slight purple tint)
          muted: '#171621',       // list rows
          hover: '#242235',       // hover lift (purple-gray shift)
          input: '#201e2b'        // controls
        },

        accent: {
          DEFAULT: '#d4b36a',    // muted gold (primary accent)
          text: '#f6f1e6'
        },

        purple: {
          deep: '#1a1625',
          soft: '#2a2438',
          mid: '#3a3450'
        },

        toggle: {
          on: '#2b2a3a',         // purple-gray active
          off: '#161521'         // near-black purple tint
        },

        highlight: {
          bg: 'rgba(212, 179, 106, 0.16)',
          text: '#e6c97a'
        },

        text: {
          primary: '#f3f1f7',
          muted: '#a7a2b3'
        },

        border: {
          DEFAULT: '#1a1822'
        }
      }
    }
  },
  plugins: []
}