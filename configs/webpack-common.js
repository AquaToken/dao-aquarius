// shared config (dev and prod)
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const path = require('path');

const rootDir = path.resolve(__dirname, '../src');

module.exports = {
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        fallback: {
            http: false,
            https: false,
            util: false,
            url: false,
            buffer: require.resolve('buffer/'),
        },
        alias: {
            api: path.resolve(rootDir, 'api/'),
            assets: path.resolve(rootDir, 'assets/'),
            constants: path.resolve(rootDir, 'constants/'),
            hooks: path.resolve(rootDir, 'hooks/'),
            helpers: path.resolve(rootDir, 'helpers/'),
            services: path.resolve(rootDir, 'services/'),
            store: path.resolve(rootDir, 'store/'),
            types: path.resolve(rootDir, 'types/'),
            web: path.resolve(rootDir, 'web/'),
            basics: path.resolve(rootDir, 'web/basics/'),
            components: path.resolve(rootDir, 'web/components/'),
            pages: path.resolve(rootDir, 'pages/'),
        },
    },
    context: rootDir,
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
                test: /\.svg$/i,
                oneOf: [
                    {
                        resourceQuery: /url/, // ?url
                        type: 'asset/resource',
                    },
                    {
                        issuer: /\.[jt]sx?$/,
                        use: ['@svgr/webpack'],
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'index.html.ejs' }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
    performance: {
        hints: false,
    },
};
