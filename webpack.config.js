const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin')

module.exports = {
    mode: 'development',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Output Management',
            template: 'assets/index.html'
        }),
        new HtmlWebpackExternalsPlugin({
            // See API section
            externals: [{
                module: 'react/umd',
                entry: 'react.development.js'
            }, {
                module: 'react-dom/umd',
                entry: 'react-dom.development.js'
            }]
        }),
    ],
    entry: './src/index.ts',
    devtool: 'inline-source-map',
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
        },
        extensions: ['.tsx', '.ts', '.js']
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
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
            // { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            // { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
}