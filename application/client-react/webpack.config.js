const webpack = require('webpack')
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const ExtractTextPlugin = require("extract-text-webpack-plugin")
// const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

module.exports = {
    entry: "./src/index.ts",
    mode: process.env.NODE_ENV || "development",
    output: {
        path: path.resolve(__dirname, 'dist')
    },
    // devServer: {
    //     contentBase: path.join(__dirname, 'dist'),
    //     compress: true,
    //     port: 9000
    // },
    resolve: { 
        extensions: ['.js', '.ts', '.tsx'],
        modules: [
            path.resolve(__dirname, "src"),
            "node_modules"
        ],
        fallback: {
            'react/jsx-runtime': 'react/jsx-runtime.js',
            'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
        }
    },
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            // { 
            //     test: /\.ts$/, 
            //     use: 'ts-loader', exclude: /node_modules/ 
            // },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /\.(css|scss|sass)$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "public", "index.html"),
            // inject: 'body',
            // minify: {
            //     collapseWhitespace: false
            // }
        })
    ],
};