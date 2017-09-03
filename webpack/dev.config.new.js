const path = require('path');
const webpackMerge = require('webpack-merge');
const autoprefixer = require('autoprefixer');
const webpackCommon = require('./dev.common.config');

const env = require('../env');
const proxyRules = require('../src/app/js/shared/proxy/config');

// webpack plugins
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const MINIFY_OPTS =  {
  removeComments: true,
  collapseWhitespace: true,
  removeRedundantAttributes: true,
  useShortDoctype: true,
  removeEmptyAttributes: true,
  removeStyleLinkTypeAttributes: true,
  keepClosingSlash: true,
  minifyJS: true,
  minifyCSS: true,
  minifyURLs: true
}

module.exports = webpackMerge(webpackCommon, {

  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, '../dev'),
    filename: 'js/[name].js',
    sourceMapFilename: 'js/[name].map'
  },

  module: {

    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                minimize: false,
                sourceMap: true,
                importLoaders: 2,
                localIdentName: '[name]__[local]'
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                config: {
                  path: path.resolve(__dirname, 'postcss.config.js')
                },
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                outputStyle: 'expanded',
                sourceMap: true,
                sourceMapContents: true
              }
            }
          ]
        })
      }
    ]

  },

  plugins: [
    // ####### add chunks as script tags within respective HTML file ########
    // some-page-1.html
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../src/app/pages/some-page-1.html'),
      chunks: ['vendor', 'common', 'some-page-1'],
      // minify: MINIFY_OPTS,
      filename: "pages/some-page-1.html"
    }),
    // some-page-2.html
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../src/app/pages/some-page-2.html'),
      chunks: ['vendor', 'common', 'some-page-2'],
      // minify: MINIFY_OPTS,
      filename: "pages/some-page-2.html"
    }),
    // index.html
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../src/app/index.html'),
      chunks: ['vendor', 'common', 'index'],
      // minify: MINIFY_OPTS,
      filename: "index.html"
    }),
    // ###############################

    new CleanWebpackPlugin(['dev'], {
      root: path.resolve(__dirname, '..'),
      exclude: '.gitignore'
    }),
    new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, '../src/app/assets')
        }
      ], {
        ignore: [
          'js/',
          'sass/'
        ]
      }
    ),
    new DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new ExtractTextPlugin('css/[name].css'),
    new UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      },
      mangle: {
        screw_ie8: false
      },
      output: {
        comments: false,
        screw_ie8: true
      },
      sourceMap: true
    }),
    // new UglifyJsPlugin({
    //   compressor: {
    //     screw_ie8: true,
    //     warnings: false
    //   },
    //   mangle: {
    //     screw_ie8: true
    //   },
    //   output: {
    //     comments: false,
    //     screw_ie8: true
    //   },
    //   test: /common-/,
    //   sourceMap: true
    // }),
    new StyleLintPlugin({
      configFile: '.stylelintrc',
      context: 'src/sass',
      files: '**/*.scss',
      failOnError: true,
      quiet: false,
      syntax: 'scss'
    }),
    new LoaderOptionsPlugin({
      options: {
        context: '/',
        sassLoader: {
          includePaths: [path.resolve(__dirname, '../src/app')]
        }
      }
    }),
    new DashboardPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerHost: '0.0.0.0',
      analyzerPort: 3001,
      reportFilename: 'bundle-report.html',
      defaultSizes: 'parsed',
      openAnalyzer: false,
      generateStatsFile: false,
      statsFilename: 'bundle-stats.json',
      statsOptions: null,
      logLevel: 'info'
    })
  ],

  devServer: {
    host: env.devServer.host || 'localhost',
    port: env.devServer.port || 3000,
    contentBase: [ path.resolve(__dirname, '../dev') ], //, path.resolve(__dirname, '../src/app/pages') ],
    watchContentBase: true,
    compress: true,
    hot: true,
    historyApiFallback: {
      disableDotRule: true
    },
    watchOptions: {
      ignored: /node_modules/
    },
    overlay: {
      warnings: true,
      errors: true
    },
    proxy: proxyRules
  }

});