const isTest = String(process.env.NODE_ENV) === 'test';

const presets = [[
    "next/babel",
    isTest ? { "preset-env": { "modules": "commonjs" } } : {},
]]

const plugins = [[
    "styled-components",
    {
        "ssr": true,
        "displayName": true,
        "preprocess": false
    }
]]
module.exports = { presets, plugins }
