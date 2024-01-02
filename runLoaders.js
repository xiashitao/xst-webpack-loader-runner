const path = require("path");
const fs = require("fs");

const { runLoaders } = require("./loader-runner");

// 我们将要转换的模块
const entryFile = path.resolve(__dirname, "src/index.js");
// 给请求的模块配置2个行内的loader
const request = `inline1-loader!inline2-loader!${entryFile}`;

const rules = [
  {
    test: /\.js$/,
    use: ["normal1-loader", "normal2-loader"],
  },
  {
    test: /\.js$/,
    enforce: "pre",
    use: ["pre1-loader", "pre2-loader"],
  },
  {
    test: /\.js$/,
    enforce: "post",
    use: ["post1-loader", "post2-loader"],
  },
];

// 拼出loader的执行链条
const parts = request.replace(/^-?!+/, "").split("!");
// 获取数组中的最后一个元素，作为我们要处理的模块
const resource = parts.pop();
// 剩下的就是内联loader了
const inlineLoaders = parts;
const preLoaders = [],
  normalLoaders = [],
  postLoaders = [];

for (let i = 0; i < rules.length; i++) {
  let rule = rules[i];
  if (rule.test.test(resource)) {
    if (rule.enforce === "pre") {
      preLoaders.push(...rule.use);
    } else if (rule.enforce === "post") {
      postLoaders.push(...rule.use);
    } else {
      normalLoaders.push(...rule.use);
    }
  }
}

// !! noPrePostAutoLoaders 不要前后置和普通 loader 只要内联loader
let loaders = [];

if (request.startsWith("!!")) {
  loaders = [...inlineLoaders];
} else if (request.startsWith("-!")) {
  // -! noPreAutoLoaders 不要前置和普通loader
  loaders = [...postLoaders, ...inlineLoaders];
} else if (request.startsWith("!")) {
  // ! 不要普通 loader
  loaders = [...postLoaders, ...inlineLoaders, ...preLoaders];
} else {
  loaders = [...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders];
}

// const loaders =

function resolveLoader(loader) {
  return path.resolve(__dirname, "loaders-chain", loader);
}

let resolvedLoaders = loaders.map(resolveLoader);
runLoaders(
  {
    resource, // 要转换的资源路径
    loaders: resolvedLoaders,
    context: { age: 18 }, // 在loader中会有this指针，可以通过context给this复值
    readResource: fs.readFile.bind(fs),
  },
  (err, res) => {
    console.log(err);
    console.log(res);
    console.log(res.resourceBuffer ? res.resourceBuffer.toString() : null);
  }
);
