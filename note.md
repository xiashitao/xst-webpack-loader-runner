# loader 是一个转换源代码的函数，所谓的 loader 只是一个导出为函数的 javaScript 模块，它接受上一个 loader 产生的结果或者资源文件（resource file）作为入参。也可以用多个 loader 函数组成一个 loader chain

# compiler 需要得到最后一个 loader 产生的处理结果，这个处理结果应该是 String 或者 Buffer （被转换为一个 String）

# loader 运行的总体流程

- 从入口文件出发，调用所有配置的 loader 对模块进行编译，再找出该模块依赖的模块，再递归处理本步骤只至所有入口依赖的文件都经过了本步骤的处理

# loader 的类型

- loader 的叠加顺序 = post(后置) + inline(内联) + normal(正常) + pre(前置)

# loader 执行顺序

- 先从左向右执行 picth，到达源代码后再从右向左执行 loader

## 如何使用自己写的 loader

- 使用绝对路径 `loader:path.resolve('loaders','babel-loader.js')`
- 配置 resolveLoader.modules
- resolveLoader.alias
