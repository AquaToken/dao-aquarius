// development config
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const commonConfig = require('./common');

const dotenv = require('dotenv');

const wcProjectId = dotenv.config().parsed
    ? dotenv.config().parsed.WALLET_CONNECT_PROJECT_ID
    : null;

module.exports = merge(commonConfig, {
    mode: 'development',
    entry: [
        '@babel/polyfill',
        'react-hot-loader/patch', // activate HMR for React
        'webpack-dev-server/client?http://localhost:8080', // bundle the client for webpack-dev-server and connect to the provided endpoint
        `./index.tsx`, // the entry point of our app
    ],
    devServer: {
        hot: 'only', // enable HMR on the server
        historyApiFallback: true, // fixes error 404-ish errors when using react router :see this SO question: https://stackoverflow.com/questions/43209666/react-router-v4-cannot-get-url
    },
    devtool: 'cheap-module-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                WALLET_CONNECT_PROJECT_ID: wcProjectId,
                SENTRY_CONTEXT: null,
            }),
            'process.horizon': JSON.stringify({
                HORIZON_SERVER: 'https://horizon.stellar.org',
            }),
        }),
    ],
});
