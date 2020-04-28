const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DotenvWebpack = require('dotenv-webpack');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const DIST_PATH = path.join(__dirname, '/dist');

const env = process.env.BABEL_ENV || process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const isDevelopment = env === 'development';

/* #################
#### Loaders #######
################# */

const jsLoaderRule = () => ({
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: [
    { loader: 'babel-loader' },
    { loader: 'eslint-loader' },
  ],
});

const scssLoaderRule = () => {
  const localIdentName = isDevelopment
    ? '[name]__[local]___[hash:base64:5]'
    : '[hash:base64:5]';

  return {
    test: /\.scss$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 1,
          sourceMap: false,
          localIdentName,
        },
      },
      {
        loader: 'sass-loader',
      },
    ],
  };
};

/* #################
#### Plugins #######
################# */

// Environment variables loader plugin
const createDotenvPlugin = () => new DotenvWebpack({
  path: path.resolve(__dirname, '.env'),
});

// Environment vars plugin
const createEnvironmentPlugin = () => new webpack.EnvironmentPlugin({
  ASSETS_PATH: '/assets',
  DEBUG: false,
});

// Clean
const createCleanPlugin = () => new CleanWebpackPlugin();

// HTML plugin
const createHtmlPlugin = () => new HtmlPlugin({
  template: './public/index.html',
  filename: 'index.html',
});

// Copy plugin
const createCopyPlugin = () => new CopyPlugin([
  { from: './public' },
]);

// Moment locals plugin
const createMomentLocalesPlugin = () => new MomentLocalesPlugin({
  localesToKeep: ['en-au', 'en-ca', 'en-gb', 'es-us', 'es'],
});

// Minimizer plugin
const createTerserPlugin = () => new TerserPlugin({
  terserOptions: {
    parse: {
      ecma: 8,
    },
    compress: {
      ecma: 5,
      warnings: false,
      inline: 2,
    },
    mangle: {
      safari10: true,
    },
    output: {
      ecma: 5,
      comments: false,
    },
  },
  parallel: true,
  cache: true,
  sourceMap: true,
});

// Compression plugin
const createCompressionPlugin = () => new CompressionPlugin({
  filename: '[path].br[query]',
  algorithm: 'brotliCompress',
  test: /\.(js|css|html|svg)$/,
  compressionOptions: { level: 11 },
  threshold: 10240,
  minRatio: 0.8,
  deleteOriginalAssets: false,
});

/* #################
#### Aliases #######
################# */

const aliasRelativePaths = {
  '@src': './src',
  '@core': './src/core',
  '@scenes': './src/scenes',
  '@store': './src/store',
  '@config': './src/shared/config',
  '@constants': './src/shared/constants',
  '@types': './src/shared/types',
  '@contexts': './src/shared/contexts',
  '@hooks': './src/shared/hooks',
  '@helpers': './src/shared/helpers',
  '@services': './src/shared/services',
  '@components': './src/shared/components',
  '@styles': './src/shared/styles',
  'style-utils': './src/shared/helpers/scss',
};

/* #################
#### Config ########
################# */

const config = {
  mode: env,
  entry: './src/main.jsx',
  output: {
    path: DIST_PATH,
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
    alias: Object.entries(aliasRelativePaths).reduce((obj, [key, val]) => {
      return { ...obj, [key]: path.resolve(__dirname, val) };
    }, {}),
  },
  module: {
    rules: [
      jsLoaderRule(),
      scssLoaderRule(),
    ],
  },
  plugins: [
    createDotenvPlugin(),
    createEnvironmentPlugin(),
    createCleanPlugin(),
    createHtmlPlugin(),
    createCopyPlugin(),
    createMomentLocalesPlugin(),
    ...(!isProduction ? [] : [
      createCompressionPlugin(),
    ]),
  ],
  devServer: {
    port: 4200,
    historyApiFallback: true,
    contentBase: ['./src', './public'],
    inline: true,
    hot: true,
  },
  devtool: isProduction ? false : 'eval-cheap-source-map',
  performance: isDevelopment && {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};

/* #################
#### Optimization ##
################# */

// Optimize only if production build
if (isProduction) {
  config.optimization = {
    minimize: true,
    minimizer: [createTerserPlugin()],
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all',
    },
  };
}

module.exports = config;
