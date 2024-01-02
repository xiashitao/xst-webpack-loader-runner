function loader(sourceCode) {
  console.log("inline1");
  console.log(this.data.age);
  // 如果你调用了async函数，必须手工调用它返回callback 方法才可以继续向后执行loader
  // const callback = this.async();
  // callback(null,sourceCode + '//inline1')
  return sourceCode + "//inline1";
}

loader.pitch = function () {
  console.log("inline1-pitch");
  this.data.age = 18;
  debugger;
  // return "let a = 1";
};

loader.raw = true;

module.exports = loader;
