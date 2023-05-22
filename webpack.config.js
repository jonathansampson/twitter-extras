const path = require("path");

module.exports = {
  mode: "production",
  optimization: {
    minimize: true,
  },
  entry: {
    background: path.join(__dirname, "src", "background.ts"),
    content: path.join(__dirname, "src", "content.ts"),
    features: path.join(__dirname, "src", "features.ts"),
    mediator: path.join(__dirname, "src", "mediator.ts"),
    options: path.join(__dirname, "src", "options.ts")
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
