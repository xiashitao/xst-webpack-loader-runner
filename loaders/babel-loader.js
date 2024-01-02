const babel = require("@babel/core");

function loader(sourceCode, inputSourceMap, inputAst) {
  const filename = this.resourcePath;
  const useOptions = this.getOptions();
  console.log(useOptions);
  const options = {
    filename,
    inputSourceMap, // 指定输入代码的sourcemap
    sourceMaps: true,
    sourceFileName: filename, // 指定编译后的文件所属的文件名
    ast: true, // 是否生成ast
    ...useOptions,
  };
  const config = babel.loadPartialConfig(options);
  console.log(config);
  if (config) {
    let res = babel.transformSync(sourceCode, config.options);
    console.log("my-babel-loaer");
    this.callback(null, res.code, res.map, res.ast);
    return;
  }
  return sourceCode;
}

module.exports = loader;
