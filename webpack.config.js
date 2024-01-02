const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve("dist"),
    filename: "[name].js",
    clean: true,
  },
  // 都是用来指定如何查找模块路径
  // 找模块的
  resolve: {},
  // 专门用来找loader 的
  resolveLoader: {
    alias: {
      // 配置别名
      "babel-loader": path.resolve("loaders", "babel-loader.js"),
    },
    modules: [path.resolve("loader"), "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          //   loader: "babel-loader",
          loader: path.resolve("loaders", "babel-loader.js"),
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};
