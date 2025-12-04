// development config
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const dotenv = require('dotenv');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const commonConfig = require('./webpack-common');

const wcProjectId = dotenv.config().parsed
    ? dotenv.config().parsed.WALLET_CONNECT_PROJECT_ID
    : null;

module.exports = merge(commonConfig, {
    mode: 'development',
    entry: [
        'webpack-dev-server/client?http://localhost:8080', // bundle the client for webpack-dev-server and connect to the provided endpoint
        `./index.tsx`, // the entry point of our app
    ],
    devServer: {
        hot: true,
        liveReload: false,
        historyApiFallback: true,
        client: {
            overlay: true,
        },
    },
    devtool: 'cheap-module-source-map',
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            plugins: [require.resolve('react-refresh/babel')],
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new ReactRefreshWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.variable': JSON.stringify({
                WALLET_CONNECT_PROJECT_ID: wcProjectId,
                SENTRY_CONTEXT: null,
            }),
            'process.horizon': JSON.stringify({
                HORIZON_SERVER: 'https://horizon.stellar.org',
            }),
        }),
    ],
});
