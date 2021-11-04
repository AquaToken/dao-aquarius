// shared config (dev and prod)
const webpack = require('webpack');
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PROJECT_PATH = {
    vote: 'AquaVote',
    governance: 'AquaGovernance',
};

const dotenv = require('dotenv');

const project = dotenv.config().parsed ? dotenv.config().parsed.PROJECT : null;

const projectPath = PROJECT_PATH[project || process.env.PROJECT];

module.exports = {
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        fallback: {
            http: false,
            https: false,
            util: false,
        },
    },
    context: resolve(__dirname, `../../${projectPath}`),
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
        new webpack.DefinePlugin({ 'process.env': JSON.stringify({ PROJECT_PATH: projectPath }) }),
    ],
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
    performance: {
        hints: false,
    },
};
