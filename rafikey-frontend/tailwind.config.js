import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  // darkMode: false,
  theme: {
    extend: {
      colors: {
        'peach': {
          '50': '#fff9ed',
          '100': '#fff2d5',
          '200': '#ffe5b4',
          '300': '#ffcb72',
          '400': '#fda93a',
          '500': '#fc8e13',
          '600': '#ed7209',
          '700': '#c4560a',
          '800': '#9c4310',
          '900': '#7d3911',
          '950': '#441b06',
        },
        'madang': {
          '50': '#eefff0',
          '100': '#d8ffdf',
          '200': '#b4ffc0',
          '300': '#78fd8f',
          '400': '#36f257',
          '500': '#0cdb31',
          '600': '#03b623',
          '700': '#078e1f',
          '800': '#0b701e',
          '900': '#0c5b1c',
          '950': '#00330b',
        },
        'perano': {
          '50': '#eff4ff',
          '100': '#dae6ff',
          '200': '#b4ceff',
          '300': '#91baff',
          '400': '#5e96fc',
          '500': '#386ef9',
          '600': '#224eee',
          '700': '#1a3adb',
          '800': '#1c30b1',
          '900': '#1c2e8c',
          '950': '#161e55',
        },
        'lavender-rose': {
          '50': '#fff4fe',
          '100': '#ffe7fd',
          '200': '#ffcefa',
          '300': '#ffb4f4',
          '400': '#fe74e8',
          '500': '#f540d7',
          '600': '#d920b6',
          '700': '#b41794',
          '800': '#931577',
          '900': '#781760',
          '950': '#51013e',
        },
        'casablanca': {
          '50': '#fef7ec',
          '100': '#fbe9ca',
          '200': '#f7d190',
          '300': '#f2b04d',
          '400': '#f09a2f',
          '500': '#e97817',
          '600': '#ce5711',
          '700': '#ab3b12',
          '800': '#8b2e15',
          '900': '#722815',
          '950': '#411107',
        },

      },
      fontFamily: {
        'sf-pro': ['SF Pro Regular', 'Ubuntu', 'sans-serif'],
        'sf-pro-medium': ['SF Pro Medium', 'Ubuntu', 'sans-serif'],
        'sf-pro-bold': ['SF Pro Bold', 'Ubuntu', 'sans-serif'],
        'sf-pro-italic': ['SF Pro Italic', 'Ubuntu', 'sans-serif'],
        'sf-pro-thin-italic': ['SF Pro Thin Italic', 'Ubuntu', 'sans-serif'],
        'sf-pro-light-italic': ['SF Pro Light Italic', 'Ubuntu', 'sans-serif'],
        'sf-pro-ultralight': ['SF Pro Ultralight', 'Ubuntu', 'sans-serif'],
        'sf-pro-semibold-italic': ['SF Pro Semibold Italic', 'Ubuntu', 'sans-serif'],
        'sf-pro-heavy-italic': ['SF Pro Heavy Italic', 'Ubuntu', 'sans-serif'],
      }
    },
  },
  plugins: [
    daisyui
  ],
  daisyui: {
    themes: ["light", "winter"]
  }
}

