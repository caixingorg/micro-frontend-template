const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const packageName = require('./package.json').name;

// 简单的 .env 解析函数
const parseEnv = (mode) => {
  const envPath = path.resolve(__dirname, `.env.${mode}`);
  const env = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        env[match[1]] = match[2];
      }
    });
  }
  return env;
};

module.exports = (envObj, argv) => {
  const mode = argv.mode || 'development';
  const isProduction = mode === 'production';
  const env = parseEnv(mode);

  const publicPath = env.PUBLIC_PATH || (isProduction ? '/react-micro-app/' : 'http://localhost:3004/');
  const port = env.PORT || 3004;

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      publicPath: publicPath,
      clean: true,
      library: `${packageName}-[name]`,
      libraryTarget: 'umd',
      chunkLoadingGlobal: `webpackJsonp_${packageName}`,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, '../../packages'),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'React Micro App',
      }),
    ],
    devServer: {
      port: port,
      hot: true,
      historyApiFallback: true,
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Access-Control-Allow-Credentials': 'false',
      },
      client: {
        webSocketURL: 'ws://localhost:3004/ws',
      },
    },
    optimization: {
      splitChunks: false,
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};
