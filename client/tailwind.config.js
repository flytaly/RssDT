module.exports = {
  purge: ['./src/**/*.tsx', './src/**/*.ts'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
        },
        gray: {
          DEFAULT: 'var(--gray)',
        },
        error: {
          DEFAULT: 'var(--error)',
        },
        success: {
          DEFAULT: 'var(--success)',
        },
      },
      boxShadow: {
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'input-primary': '0px 0px 0px 2px var(--primary)',
        'input-gray': '0px 0px 0px 2px #777d8c',
        message: '0rem 5px 10px 0px rgba(0,0,0,0.25)',
        'message-darker': '0rem 5px 10px 0px rgba(0,0,0,0.40)',
        'message-err': '0rem 5px 10px 0px var(--error-shadow)',
        'message-err-darker': '0rem 5px 10px 0px var(--error-shadow-hover)',
        'message-success': '0rem 5px 10px 0px var(--success-shadow)',
        'message-success-darker': '0rem 5px 10px 0px var(--success-shadow-hover)',
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
