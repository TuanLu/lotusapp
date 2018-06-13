var webpack = require('webpack');
var path = require('path');
module.exports = {
  resolve: {
    extensions: [".js", ".jsx"],
    modules: [
      path.resolve(__dirname, "client"), 
      "node_modules"
    ],
    alias: {
      //"react": "preact-compat",
      //"react-dom": "preact-compat",
      ACTION_TYPES: path.resolve(__dirname, 'client/actions/ACTION_TYPES'),
      actions: path.resolve(__dirname, 'client/actions/index'),
      ISD_API: path.resolve(__dirname, 'client/api/api'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(jsx|js)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        },
        //include: __dirname + '/client/'
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  }
}
