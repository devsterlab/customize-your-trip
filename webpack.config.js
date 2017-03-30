var path = require('path');
var webpack = require('webpack');
var CleanPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var plugins = [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
        HISTORY_TYPE: process.env.OPENED || process.env.BUILD ? "'createHistory'" : "'createHashHistory'",
        SERVER_URL: `'${process.env.SERVER_URL || 'localhost:8082'}'`,
        BASE_NAME: `'${process.env.BASE_NAME || '/'}'`
    }),
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
        Perf: "react-addons-perf",
        "window.Perf": "react-addons-perf"
    }),
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './index.html',
        inject: false
    })
];

if (process.env.BUILD) plugins.unshift(new CleanPlugin(['./dist']));

module.exports = {
    devtool: 'eval',
    entry: process.env.BUILD && ['./src/index'] || [
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        './src/index'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/dist/'
    },
    plugins,
    module: {
        loaders: [
            {
                test: /\.js?$/,
                include: path.join(__dirname, 'src'),
                exclude: /node_modules/,
                loaders: ['react-hot-loader', 'babel-loader']
            },
            {
                test: /(\.css|\.scss)$/,
                loaders: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap']
            },
            {
                test: /.(png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
                loader: 'url-loader?limit=100000'
            }
        ]
    }
};