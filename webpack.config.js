const path = require("path");

module.exports = {
  mode: "production",
  optimization: {
    minimize: false,
  },
  entry: {
    background: path.join(__dirname, "src", "background.ts"),
    content: path.join(__dirname, "src", "content.ts"),
    features: path.join(__dirname, "src", "features.ts"),
    mediator: path.join(__dirname, "src", "mediator.ts"),
    options: path.join(__dirname, "src", "options.ts"),
    // Add an entry for each feature
    downloadVoiceTweets: path.join(
      __dirname,
      "src",
      "features",
      "downloadVoiceTweets.ts"
    ),
    formatCodeBlocks: path.join(
      __dirname,
      "src",
      "features",
      "formatCodeBlocks.ts"
    ),
    hideWhatsHappening: path.join(
      __dirname,
      "src",
      "features",
      "hideWhatsHappening.ts"
    ),
    hideWhoToFollow: path.join(
      __dirname,
      "src",
      "features",
      "hideWhoToFollow.ts"
    ),
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
