const withCSS = require('@zeit/next-css');
const withReactSvg = require('next-react-svg');

module.exports = withCSS(withReactSvg({
    include: `${__dirname}/public`,
    target: 'serverless',
    webpack(config) {
        return config;
    },
    env: { API_URL: process.env.API_URL },
}));
