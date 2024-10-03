// production config
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const childProcess = require('child_process');
const { resolve } = require('path');

const commonConfig = require('./webpack-common');

const branchName =
    process.env.BRANCH ||
    childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

const isMaster = branchName === 'master';
const isStaging = branchName === 'staging';

let context = null;
switch (true) {
    case isMaster: {
        context = 'production';
        break;
    }
    case isStaging: {
        context = 'staging';
        break;
    }
}

module.exports = merge(commonConfig, {
    mode: 'production',
    entry: ['@babel/polyfill', `./index.tsx`],
    output: {
        filename: 'js/bundle.[contenthash].min.js',
        path: resolve(__dirname, '../dist'),
        publicPath: '/',
    },
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: '../src/web/.static/img', to: 'assets/img' },
                { from: '../src/web/.static', to: '' },
            ],
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID,
                SENTRY_CONTEXT: context,
            }),
            'process.horizon': JSON.stringify({
                HORIZON_SERVER: isMaster
                    ? 'https://aqua.network/horizon'
                    : 'https://horizon.stellar.org',
            }),
        }),
    ],
});
