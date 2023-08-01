// production config
const { merge } = require('webpack-merge');
const { resolve } = require('path');
const childProcess = require('child_process');
const webpack = require('webpack');

const commonConfig = require('./common');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const branchName =
    process.env.BRANCH ||
    childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

const isMaster = branchName === 'master';

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
        new webpack.DefinePlugin({
            'process.horizon': JSON.stringify({
                HORIZON_SERVER: isMaster
                    ? 'https://aqua.network/horizon'
                    : 'https://horizon.stellar.org',
            }),
        }),
    ],
});
