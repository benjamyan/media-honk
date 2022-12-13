const webpack = require('webpack');
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

module.exports = {
    entry: "./src/index.ts",
    mode: process.env.NODE_ENV || "development",
    resolve: { 
        extensions: ['.js', '.ts', '.tsx'],
        modules: [
            path.resolve(__dirname, "src"),
            "node_modules"
        ]
    },
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            // {
            //     test: /\.(css|scss|sass)$/,
            //     use: ExtractTextPlugin.extract({
            //         fallback: 'style-loader',
            //         use: [{
            //                 loader: 'css-loader',
            //                 options: {
            //                     modules: true,
            //                     importLoaders: 1,
            //                     sourceMap: true,
            //                 },
            //             },
            //             {
            //                 loader: 'postcss-loader',
            //                 options: {
            //                     sourceMap: true,
            //                 },
            //             },
            //             {
            //                 loader: 'sass-loader',
            //                 options: {
            //                     sourceMap: true
            //                 }
            //             }
            //         ]
            //     })
            // }
            // {
            //     test: /\.(scss|sass)$/,
            //     exclude: /node_modules/,
            //     use: [
            //         {
            //             loader: 'file-loader',
            //             options: { outputPath: 'css/', name: '[name].min.css'}
            //         },
            //         'sass-loader'
            //     ]
            // }
            {
                test: /\.(css|scss|sass)$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            }
        ],
    },
    output: {
        path: path.resolve(__dirname, './public'),
        filename: 'main.js',
    },
    devServer: {
        // contentBase: path.resolve(__dirname, './public'),
        hot: true
    },
    plugins: [
        // new HtmlWebpackPlugin({
        //     template: path.join(__dirname, "public", "index.html"),
        //     // inject: 'body',
        //     minify: {
        //         collapseWhitespace: false
        //     }
        // }),
        new MiniCssExtractPlugin({
            filename: 'style.css'
        })
        // new ExtractTextPlugin({ 
            // filename: 'style.css', 
            // disable: false, 
            // allChunks: true 
        // })
    ]
};