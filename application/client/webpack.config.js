const webpack = require('webpack')
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env)=> {
    return {
        entry: "./src/index.ts",
        mode: env !== 'production' ? 'development' : 'production',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'main.js'
        },
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
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: ["babel-loader"],
                },
                {
                    test: /\.(css|scss|sass)$/,
                    use: ["style-loader", "css-loader", "sass-loader"],
                },
                { 
                    test: /\.(png|jpg|gif|mp3|mp4)$/, 
                    loader: 'file-loader', 
                    options: { name: '[name].[ext]?[hash]' } 
                }
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                Client: {
                    honkConfig: {
                        ENV: JSON.stringify(env.build || 'development')
                    }
                }
            }),
            new HtmlWebpackPlugin({
                template: path.join(__dirname, "public", "index.html"),
                inject: 'body',
            }),
        ],
    }
};