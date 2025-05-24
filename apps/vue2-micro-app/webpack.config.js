const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const packageName = require('./package.json').name;

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    entry: './src/main.ts',
    mode: argv.mode || 'development',
    devtool: isDevelopment ? 'eval-source-map' : false,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? `${packageName}.js` : '[name].js',
      library: packageName,
      libraryTarget: 'umd',
      chunkLoadingGlobal: `webpackJsonp_${packageName}`,
      globalObject: 'window',
      publicPath: isDevelopment ? `http://localhost:3002/` : `/vue2-micro-app/`,
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
      port: 3002,
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
        webSocketURL: 'ws://localhost:3002/ws',
      },
    },
    externals: isProduction ? {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      vuex: 'Vuex',
    } : {},
  };
};
