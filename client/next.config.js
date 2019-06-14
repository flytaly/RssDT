const withCSS = require('@zeit/next-css');
const withReactSvg = require('next-react-svg');
const withPlugins = require('next-compose-plugins');
// const path = require('path');

module.exports = withPlugins([
    [withReactSvg,
        {
            include: `${__dirname}/static`,
            webpack(config, options) {
                return config;
            },
        },
    ],
    withCSS,
], {
    target: 'serverless',
});
