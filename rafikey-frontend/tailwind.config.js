import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        'azure-radiance': {
          '50': '#eff8ff',
          '100': '#daeeff',
          '200': '#bee3ff',
          '300': '#91d2ff',
          '400': '#5eb8fc',
          '500': '#3898f9',
          '600': '#2f82ef',
          '700': '#1a64db',
          '800': '#1c51b1',
          '900': '#1c468c',
          '950': '#162d55',
        },
        'link-water': {
          '50': '#f5f7f9',
          '100': '#e8ecf1',
          '200': '#cbd5e1',
          '300': '#b9c7d7',
          '400': '#98abc2',
          '500': '#7f93b2',
          '600': '#6d7fa3',
          '700': '#616f94',
          '800': '#525c7b',
          '900': '#454d63',
          '950': '#2d313e',
        },

        'coral-red': {
          '50': '#fff1f1',
          '100': '#ffdfdf',
          '200': '#ffc5c5',
          '300': '#ff9d9d',
          '400': '#ff6464',
          '500': '#ff3b3b',
          '600': '#ed1515',
          '700': '#c80d0d',
          '800': '#a50f0f',
          '900': '#881414',
          '950': '#4b0404',
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
        'button': {
          'light': '#F2B04D',
          'dark': '#876532',
          'inactive': '#6E6E6E'
        },
        darkgray: '#222222',
        lightgray: '#252525',
        lightgrayTwo: '#605E5E',
        lightBackground: '#F6F6F6',
        bubbleDark: '#191919',
        veryLight: '#D9D9D9',
        veryLightOne: '#DADADA',
        veryLightTwo: '#4D4D4D',
        veryLightThree: '#9B9596',
        veryLightFour: '#D2D2D2',
        veryLightFive: '#484848',
        veryLightSix: '#323232',
      },
      fontSize:{
        'extra-extra-small-2': '10px',
        'extra-extra-small': '13px',
          'extra-small': '14px',
          'small': '16px',
          'large': '18px',
          'extra-large': '24px',
          'extra-extra-large-1': '32px',
          'extra-extra-large': '40px',
          'extra-extra-large-2': '48px',
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

