const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const React = require('react');
const ReactDOM = require('react-dom');

const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './public/index.html',
  filename: './public/index.html',
  inject: 'body'
});

const env = process.env.WEBPACK_ENV;

const libraryName = 'react-infinite-carusel';
let plugins = [], output, entry;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  entry = __dirname + '/src/index.js';
  output = {
    path: __dirname + '/lib',
    filename: libraryName + '.min.js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  };
} else {
  plugins.push(HtmlWebpackPluginConfig);
  entry = './public/app.js';
  output = {
    path: path.resolve('dist'),
    filename: 'index_bundle.js'
  };
}

const config = {
  entry: entry,
  devtool: 'source-map',
  output: output,
  plugins: plugins,
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: [ 'style-loader', 'css-loader?modules' ]
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/,
        query: {
          cacheDirectory: true,
          presets: ['react', 'es2015', 'stage-0']
        }
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: "eslint-loader",
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['react', 'es2015', 'stage-0']
        }
      }
    ]
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js']
  }
};

module.exports = config;