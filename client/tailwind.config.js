module.exports = {
  purge: ['./src/**/*.tsx', './src/**/*.ts'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      minHeight: {
        5: '1.25rem',
        84: '21rem',
      },
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          1: 'var(--primary-1)',
          2: 'var(--primary-2)',
          dark: 'var(--primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
        },
        tertiary: {
          DEFAULT: 'var(--tertiary)',
        },
        gray: {
          DEFAULT: 'var(--gray)',
          1: 'var(--gray-1)',
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
        modal: '0px 20px 30px 0px rgba(0, 0, 0, 0.8)',
        'input-primary': '0px 0px 0px 2px var(--primary)',
        'input-gray': '0px 0px 0px 2px #777d8c',
        message: '0rem 5px 10px 0px #c0c0c0',
        'message-darker': '0rem 5px 10px 0px #909090',
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
