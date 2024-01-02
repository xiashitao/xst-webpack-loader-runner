function loader(sourceCode) {
  console.log("post2");
  const callback = this.async();
  setTimeout(() => {
    callback(null, sourceCode + "//post2");
  }, 3000);

  return sourceCode + "//post2";
}

loader.pitch = function () {
  console.log("post2-pitch");
  // return "post2-pitch";
};

module.exports = loader;
