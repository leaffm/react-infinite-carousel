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
let plugins = [], output, entry, externals;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  entry = './src/index.js';
  output = {
    path: path.join(__dirname, 'lib'),
    filename: 'react-infinite-carusel.min.js',
    library: 'InfiniteCarousel',
    libraryTarget: 'umd'
  };
  externals = [
    {
      'react': {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom'
      }
    }
  ];
} else {
  plugins.push(HtmlWebpackPluginConfig);
  entry = './public/app.js';
  output = {
    path: path.resolve('dist'),
    filename: 'index_bundle.js'
  };
  externals = [];
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
        loader: 'babel-loader',
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
    //main: path.resolve('./src'),
    modules: [path.resolve('./src'), path.resolve('./public'), "node_modules"],
    extensions: ['.js']
  },
  externals: externals,
};

module.exports = config;