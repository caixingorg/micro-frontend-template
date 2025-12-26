const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const packageName = require('./package.json').name;

// 1. 引入文件系统模块
const fs = require('fs');

// 2. 自定义解析 .env 文件的函数
const parseEnv = (mode) => {
  const envFiles = [
    path.resolve(__dirname, `.env.${mode}`),
    path.resolve(__dirname, '.env')
  ];

  const envVars = {};

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          envVars[match[1].trim()] = match[2].trim();
        }
      });
    }
  });

  return envVars;
};

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;
  const mode = argv.mode || 'development';

  // 3. 加载环境变量
  const envVars = parseEnv(mode);
  const PUBLIC_PATH = envVars.PUBLIC_PATH || (isDevelopment ? 'http://localhost:3002/' : '/vue2-micro-app/');
  const PORT = parseInt(envVars.PORT || '3002', 10);

  return {
    entry: './src/main.ts',
    mode: mode,
    devtool: isDevelopment ? 'eval-source-map' : false,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? `${packageName}.js` : '[name].js',
      library: packageName,
      libraryTarget: 'umd',
      chunkLoadingGlobal: `webpackJsonp_${packageName}`,
      globalObject: 'window',
      // 4. 使用动态的 PublicPath
      publicPath: PUBLIC_PATH,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.vue'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, '../../packages'),
        'vue$': 'vue/dist/vue.esm.js'
      },
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
          },
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.less$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        inject: true,
      }),
    ],
    devServer: {
      port: PORT, // 5. 使用配置的端口
      host: '0.0.0.0',
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Access-Control-Allow-Credentials': 'false',
      },
      historyApiFallback: true,
      hot: true,
      liveReload: false,
      client: {
        webSocketURL: `ws://localhost:${PORT}/ws`,
      },
    },
    externals: isProduction ? {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      vuex: 'Vuex',
    } : {},
  };
};
