const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Output Management',
            // template: require('../assets/index.html')
            template: 'assets/index.html'
        })
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: './dist'
    },
    resolve: {
        alias: {
            assets: path.resolve(__dirname, 'assets'),
            img: path.resolve(__dirname, 'img'),
            src: path.resolve(__dirname, 'src')
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            /*
            {
                test: /\.(html)$/,
                use: [
                    'html-loader'
                ]
            }
            */
        ]
    }
}