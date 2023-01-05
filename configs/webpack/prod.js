// production config
const { merge } = require('webpack-merge');
const { resolve } = require('path');

const commonConfig = require('./common');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(commonConfig, {
    mode: 'production',
    entry: ['@babel/polyfill', `./index.tsx`],
    output: {
        filename: 'js/bundle.[contenthash].min.js',
        path: resolve(__dirname, '../../dist'),
        publicPath: '/',
    },
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: '../src/common/static/img', to: 'assets/img' },
                {
                    from: '../src/common/static',
                    to: '',
                },
            ],
        }),
    ],
});
