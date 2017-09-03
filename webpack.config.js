var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'bin');
var APP_DIR = path.resolve(__dirname, 'src');

var config = {
  entry: [
    APP_DIR + '/index.js'
  ],
  module: {
    loaders: [
      { test : /\.jsx?$/, include : APP_DIR, loader : 'babel-loader' }
    ]
  },
  output: {
    path: BUILD_DIR,
    filename: 'waver.js',
    library: 'Waver',
    libraryTarget: 'umd'
  }
};

module.exports = config;
