const path = require("path");

module.exports = {
  mode: 'production',
  entry: ['@babel/polyfill', "./js/script.js"],
  output: {
    path: path.resolve(__dirname),
    filename: "index.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ['@babel/proposal-class-properties']
          }
        }
      }
    ]
  }
};