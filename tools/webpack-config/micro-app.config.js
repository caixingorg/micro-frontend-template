const createBaseConfig = require('./base.config');

/**
 * 创建微应用webpack配置
 * @param {Object} options 配置选项
 * @param {string} options.packageName 包名
 * @param {number} options.port 开发服务器端口
 * @param {string} options.entry 入口文件
 * @param {boolean} options.isDevelopment 是否为开发环境
 * @returns {Object} webpack配置对象
 */
function createMicroAppConfig(options = {}) {
  const {
    packageName,
    port = 3001,
    entry = './src/index.tsx',
    isDevelopment = false,
    ...baseOptions
  } = options;

  if (!packageName) {
    throw new Error('packageName is required for micro app config');
  }

  const baseConfig = createBaseConfig({
    entry,
    isDevelopment,
    ...baseOptions,
  });

  // 微应用特定配置
  const microAppConfig = {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      library: `${packageName}-[name]`,
      libraryTarget: 'umd',
      chunkLoadingGlobal: `webpackJsonp_${packageName}`,
      publicPath: isDevelopment ? `//localhost:${port}/` : `/${packageName}/`,
    },
    devServer: {
      port,
      hot: true,
      historyApiFallback: true,
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      client: {
        webSocketURL: `ws://localhost:${port}/ws`,
      },
    },
    optimization: {
      // 微应用不需要代码分割
      splitChunks: false,
      runtimeChunk: false,
    },
    externals: isDevelopment ? {} : {
      // 生产环境可以外部化一些依赖
      // react: 'React',
      // 'react-dom': 'ReactDOM',
    },
  };

  return microAppConfig;
}

module.exports = createMicroAppConfig;
