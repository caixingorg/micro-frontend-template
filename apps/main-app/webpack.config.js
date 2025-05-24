const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      publicPath: '/',
      clean: true,
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
        title: 'Enterprise Micro Frontend',
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8080/api'),
        'process.env.REACT_APP_REACT_MICRO_APP_ENTRY': JSON.stringify(process.env.REACT_APP_REACT_MICRO_APP_ENTRY || '//localhost:3001'),
        'process.env.REACT_APP_VUE3_MICRO_APP_ENTRY': JSON.stringify(process.env.REACT_APP_VUE3_MICRO_APP_ENTRY || '//localhost:3002'),
      }),
    ],
    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      compress: true, // 启用gzip压缩
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      client: {
        overlay: {
          errors: true,
          warnings: false, // 关闭警告覆盖层提升性能
        },
      },
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          shared: {
            test: /[\\/]packages[\\/]/,
            name: 'shared',
            chunks: 'all',
          },
        },
      },
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};
