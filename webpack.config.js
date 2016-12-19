const pkg = require('./package');
const path = require('path');
const webpack = require('webpack');


const dirJs = path.resolve(__dirname, 'src/js');
const dirDist = path.resolve(__dirname, 'dist');

module.exports = {
  cache: true,
  debug: true,
  devtool: 'eval',
  entry: [

    //'babel-polyfill',
    path.resolve(dirJs, 'main.js')
  ],

  output: {
    path: dirDist,
    filename: 'js/bundle.js'
  },
  resolve: {
    extensions: ['', '.jsx', '.js', '.json'],
    modulesDirectories: [
      'node_modules',
      path.resolve(__dirname, './node_modules')
    ]
  },
  module: {
    loaders: [{
      test: /(\.js|\.jsx)$/,
      exclude: /(node_modules|bower_components)/,
      include: [
        dirJs
      ],
      loader: 'babel-loader',
      query: {
        plugins: [ 'transform-runtime' ],
        presets: ['es2015', 'react']
      }
    }, {
      test: /\.json?$/,
      loader: 'json-loader'
    }, {
      test: /vendor\/.+\.(jsx|js)$/,
      loader: 'imports?jQuery=jquery,$=jquery,this=>window'
    }]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('commons', 'js/common.js'),
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery',
      'React': 'react',
      'ReactDOM': 'react-dom',
      'Rx': 'rx'
    }),

    // Avoid publishing files when compilation fails
    new webpack.NoErrorsPlugin()
  ]

};
