// shared config (dev and prod)
const webpack = require('webpack');
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dotenv = require('dotenv');

const wcProjectId = dotenv.config().parsed
    ? dotenv.config().parsed.WALLET_CONNECT_PROJECT_ID
    : null;

module.exports = {
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        fallback: {
            http: false,
            https: false,
            util: false,
        },
    },
    context: resolve(__dirname, `../../src`),
    module: {
        rules: [
            {
                test: [/\.jsx?$/, /\.tsx?$/],
                use: ['babel-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(scss|sass)$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'index.html.ejs' }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                WALLET_CONNECT_PROJECT_ID: wcProjectId || process.env.WALLET_CONNECT_PROJECT_ID,
            }),
        }),
    ],
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
    performance: {
        hints: false,
    },
};
