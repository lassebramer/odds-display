const path = require('path');
const Dotenv = require('dotenv-webpack'); // Import dotenv-webpack
const webpack = require('webpack');
module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    // new Dotenv(), // Add the Dotenv plugin to load environment variables
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env) // Inject the environment variables
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'], // Add this rule for CSS
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),  // Replace 'contentBase' with 'static'
    },
    port: 3000,
    hot: true,  // Enables hot module replacement
  },
  mode: 'development',
};
