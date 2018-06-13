const merge = require('webpack-merge');
const common = require('./webpack.common.js');
var path = require('path');
var webpack = require('webpack');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = merge(common, {
  entry: {
    lotus: ['./client/app.production.jsx']
  },
  mode: 'production',
  plugins: [
    // new UglifyJsPlugin({
    //   uglifyOptions: {
    //     compress: {
    //       drop_console: false,
    //     },
    //     dead_code: true,
    //   },
    // }),
    // new MinifyPlugin({

    // }, {

    // }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new BundleAnalyzerPlugin()
  ],
  optimization: {
    splitChunks: {
        cacheGroups: {
          commons: { 
            test: /[\\/]node_modules[\\/]/, 
            name: "vendors", 
            chunks: "all" 
          },
          // commons: { 
          //   test: /react|redux|lodash/, 
          //   name: "vendors", 
          //   chunks: "all" 
          // },
          // polyfill: {
          //   test: /babel-polyfill/,
          //   name: "babel_polyfill",
          //   chunks: "initial",
          //   enforce: true
          // },
          // reactslick: {
          //   test: /react-slick/,
          //   name: "reactslick",
          //   chunks: "initial",
          //   enforce: true
          // },
        }
    }
  },
  output: {
    path: __dirname,
    //filename: "[name].bundle.js"
    filename: './public/js/[name].min.js',
  },

});