const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/**
 * 创建基础webpack配置
 * @param {Object} options 配置选项
 * @param {string} options.entry 入口文件路径
 * @param {string} options.outputPath 输出路径
 * @param {string} options.publicPath 公共路径
 * @param {string} options.htmlTemplate HTML模板路径
 * @param {boolean} options.isDevelopment 是否为开发环境
 * @param {Object} options.alias 路径别名
 * @returns {Object} webpack配置对象
 */
function createBaseConfig(options = {}) {
  const {
    entry = './src/index.tsx',
    outputPath = 'dist',
    publicPath = '/',
    htmlTemplate = './public/index.html',
    isDevelopment = false,
    alias = {},
  } = options;

  return {
    mode: isDevelopment ? 'development' : 'production',
    entry,
    output: {
      path: path.resolve(process.cwd(), outputPath),
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      chunkFilename: isDevelopment ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
      publicPath,
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
        ...alias,
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: isDevelopment,
                configFile: path.resolve(process.cwd(), 'tsconfig.json'),
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },
        {
          test: /\.less$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
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
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash][ext]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]',
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: htmlTemplate,
        inject: true,
        minify: !isDevelopment && {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
      !isDevelopment && new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash].css',
        chunkFilename: 'css/[name].[contenthash].chunk.css',
      }),
    ].filter(Boolean),
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
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    stats: {
      errorDetails: true,
    },
  };
}

module.exports = createBaseConfig;
