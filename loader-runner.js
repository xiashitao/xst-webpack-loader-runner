const fs = require("fs");

// loader 是一个绝对路径
function createLoaderObject(loader) {
  const normal = require(loader);
  let pitch = normal.pitch;
  let raw = normal.raw || true; // 决定是字符串还是 Buffer
  // 在webpack里一切皆模块，这些文件可能是文件js，也可能是二进制的图片，字体
  // raw = true 读成Buffer 如果为false， 那就读成字符串
  return {
    path: loader, // loader的路径
    normal, // normal函数
    pitch, // pitch 函数
    normalExecuted: false, // 此loader的normal 函数是否已经执行过了
    pitchExecuted: false, // 此loader的pitch函数是否已经执行过了
    data: {}, // 每个loader对象都有自己的data
    raw,
  };
}

function processResource(processOptions, loaderContext, pitchingCallback) {
  processOptions.readResource(
    loaderContext.resourcePath,
    (err, resourceBuffer) => {
      processOptions.resourceBuffer = resourceBuffer;
      loaderContext.loaderIndex--;
      debugger;
      iterateNormalLoaders(
        processOptions,
        loaderContext,
        [resourceBuffer],
        pitchingCallback
      );
    }
  );
}

function iterateNormalLoaders(
  processOptions,
  loaderContext,
  args,
  pitchingCallback
) {
  if (loaderContext.loaderIndex < 0) {
    return pitchingCallback(null, args);
  }
  debugger;
  let currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  // console.log("currentloader", loaderContext);
  if (currentLoader.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(
      processOptions,
      loaderContext,
      args,
      pitchingCallback
    );
  }

  let fn = currentLoader.normal;
  currentLoader.normalExecuted = true;
  convertArgs(args, currentLoader.raw);
  runSyncOrAsync(fn, loaderContext, args, (err, ...returnArgs) => {
    return iterateNormalLoaders(
      processOptions,
      loaderContext,
      returnArgs,
      pitchingCallback
    );
  });
}

function convertArgs(args, raw) {
  if (raw && !Buffer.isBuffer(args[0])) {
    args[0] = Buffer.from(args[0]);
  } else if (!raw && Buffer.isBuffer(args[0])) {
    args[0] = args[0].toString("utf-8");
  }
}

function iteratePitchingLoaders(
  processOptions,
  loaderContext,
  pitchingCallback
) {
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    return processResource(processOptions, loaderContext, pitchingCallback);
  }
  // 获取当前索引对应的loader对象
  let currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoader.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(
      processOptions,
      loaderContext,
      pitchingCallback
    );
  }
  let fn = currentLoader.pitch;
  // 表示已经执行过此loader的pitch函数
  currentLoader.pitchExecuted = true;
  if (!fn) {
    return iteratePitchingLoaders(
      processOptions,
      loaderContext,
      pitchingCallback
    );
  }
  runSyncOrAsync(
    fn,
    loaderContext,
    [
      loaderContext.remainingRequest,
      loaderContext.previousRequest,
      loaderContext.data,
    ],
    (err, ...args) => {
      if (args.length && args.some((item) => item)) {
        loaderContext.loaderIndex--;
        // TODO
        return iterateNormalLoaders(
          processOptions,
          loaderContext,
          args,
          pitchingCallback
        );
      } else {
        return iteratePitchingLoaders(
          processOptions,
          loaderContext,
          pitchingCallback
        );
      }
    }
  );
}

function runSyncOrAsync(fn, loaderContext, args, runCallback) {
  let isSync = true; // 此变量标记当前的函数的执行是同步还是异步，默认是同步
  // console.log("loaderContext", loaderContext);
  loaderContext.callback = (err, ...args) => {
    runCallback(err, ...args);
  };
  loaderContext.async = () => {
    isSync = false;
    return loaderContext.callback;
  };
  let res = fn.apply(loaderContext, args);
  if (isSync) {
    runCallback(null, res);
  }
}
function runLoaders(options, finalCallback) {
  const {
    resource,
    loaders = [],
    context = {},
    readResource = fs.readFile.bind(fs),
  } = options;
  let loaderContext = context;
  let loaderObjects = loaders.map(createLoaderObject);
  loaderContext.resourcePath = resource;
  loaderContext.readResource = readResource;
  loaderContext.loaders = loaderObjects;
  loaderContext.loaderIndex = 0; // 当前正在执行的loader索引
  loaderContext.callback = null; // 调用此方法表示结束当前的loader，把结果传给下一个loader
  loaderContext.async = null; // 表示吧loader执行从同步变成异步
  // 因为下面的属性是动态的，每次取值都是需要计算
  Object.defineProperty(loaderContext, "request", {
    get() {
      return loaderContext.loaders
        .map((loader) => loader.path)
        .concat(resource)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "remainingRequest", {
    get() {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex + 1)
        .map((loader) => loader.path)
        .concat(resource)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "currentRequest", {
    get() {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex)
        .map((loader) => loader.path)
        .concat(resource)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "previousRequest", {
    get() {
      return loaderContext.loaders
        .slice(0, loaderContext.loaderIndex)
        .map((loader) => loader.path)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "data", {
    get() {
      return loaderContext.loaders[loaderContext.loaderIndex].data;
    },
  });
  // 处理的选项
  let processOptions = {
    resourceBuffer: null, // 读取到的源文件的内容,要加载的文件的原始内容，转换前的内容
    readResource,
  };
  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    finalCallback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    });
  });
}

exports.runLoaders = runLoaders;
