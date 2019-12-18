const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const React = require('react');
const ReactDOM = require('react-dom');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './public/index.html',
  filename: './public/index.html',
  inject: 'body',
});

const env = process.env.WEBPACK_ENV;

const libraryName = 'react-infinite-carusel';
let envConfig = {};

if (env === 'build') {
  envConfig = {
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, 'lib'),
      filename: 'react-infinite-carusel.min.js',
      library: 'InfiniteCarousel',
      libraryTarget: 'umd',
    },
    optimization: {
      minimizer: [new UglifyJsPlugin()],
    },
    externals: [
      {
        react: {
          root: 'React',
          commonjs2: 'react',
          commonjs: 'react',
          amd: 'react',
        },
        'react-dom': {
          root: 'ReactDOM',
          commonjs2: 'react-dom',
          commonjs: 'react-dom',
          amd: 'react-dom',
        },
      },
    ],
  };
} else {
  envConfig = {
    plugins: [HtmlWebpackPluginConfig],
    entry: './public/app.js',
    output: {
      path: path.resolve('dist'),
      filename: 'index_bundle.js',
    },
    externals: [],
  };
}

const config = {
  ...envConfig,
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-object-rest-spread'],
            },
          },
          'eslint-loader',
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    // main: path.resolve('./src'),
    modules: [path.resolve('./src'), path.resolve('./public'), 'node_modules'],
    extensions: ['.js'],
  },
};

module.exports = config;
