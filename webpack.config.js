/* global __dirname, module */

module.exports = {
  context: __dirname,
  devtool: "source-map",
  entry: "./src/webpack.js",
  output: {
    path: __dirname + "/dist",
    filename: "faint.js"
  }
};
