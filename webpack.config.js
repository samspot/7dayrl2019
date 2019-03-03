const path = require("path")

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: './dist'
    },
    resolve: {
        alias: {
            assets: path.resolve(__dirname, 'assets'),
            src: path.resolve(__dirname, 'src')
        }
    }
}