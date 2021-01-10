module.exports = {
  purge: ['./src/**/*.tsx', './src/**/*.ts'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#ac247d',
      },
      boxShadow: {
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        input: '0px 0px 0px 2px #ac247d',
      },
      gradientColorStops: (theme) => ({
        ...theme('colors'),
        gradFrom: 'hsl(321, 65%, 40%)',
        gradTo: 'hsl(321, 65%, 10%)',
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
