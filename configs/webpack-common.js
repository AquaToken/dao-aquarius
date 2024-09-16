// shared config (dev and prod)
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
            common: path.resolve(rootDir, 'common/'),
            assets: path.resolve(rootDir, 'common/assets/'),
            constants: path.resolve(rootDir, 'constants/'),
            helpers: path.resolve(rootDir, 'common/helpers/'),
            hooks: path.resolve(rootDir, 'common/hooks/'),
            services: path.resolve(rootDir, 'common/services/'),
            store: path.resolve(rootDir, 'store/'),
            types: path.resolve(rootDir, 'types/'),
            basics: path.resolve(rootDir, 'common/basics/'),
            components: path.resolve(rootDir, 'common/components/'),
            modals: path.resolve(rootDir, 'common/modals/'),
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
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'index.html.ejs' }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
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
