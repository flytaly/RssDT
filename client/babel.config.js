
module.exports = (api) => {
    api.cache(true);

    const isTest = String(process.env.NODE_ENV) === 'test';

    const presets = [[
        'next/babel',
        isTest ? { 'preset-env': { modules: 'commonjs' } } : {},
    ]];

    const plugins = [[
        'styled-components',
        {
            ssr: true,
            displayName: true,
            preprocess: false,
        },
    ],
    [
        'file-loader',
        {
            name: '[name].[ext]',
            extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
            publicPath: '/static',
            outputPath: null,
            context: '',
            limit: 0,
        },
    ],
    ];

    return {
        presets,
        plugins,
    };
};
