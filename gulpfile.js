var gulp = require("gulp");
var gutil = require("gulp-util");
var del = require('del');
var path = require('path');
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ghPages = require('gulp-gh-pages');

var config = {
  buildDir: 'build',
  entry: './app/js/main.js',
  bundle: 'app.js',
  title: 'thompson-regex-js'
}

var webpackConfig = {
  entry: config.entry,
  output: {
    path: path.join(__dirname, config.buildDir),
    filename: config.bundle
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.js$/, loader: "jsx-loader" },
      { test: /\.json$/, loader: "json-loader" },
      { test: /\.jsx$/, loader: "jsx-loader?insertPragma=React.DOM" },
      { test: /\.woff$/, loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
      { test: /\.woff2$/, loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff2" },
      { test: /\.ttf$/, loader: "file-loader?prefix=font/" },
      { test: /\.eot$/, loader: "file-loader?prefix=font/" },
      { test: /\.svg$/, loader: "file-loader?prefix=font/" }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: config.title,
      filename: 'index.html'
    })
  ]
};

gulp.task('clean', function(callback) {
  del([config.buildDir], callback);
});

gulp.task('webpack', function(callback) {
  webpack(webpackConfig, function(err, stats) {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString());
    callback();
  });
});

gulp.task('webpack-dev-server', function(callback) {
  var myConfig = Object.create(webpackConfig);
  myConfig.devtool = "eval";
  myConfig.debug = true;
  var wp = webpack(myConfig);
  new WebpackDevServer(wp).listen(8080, "localhost", function(err) {
    if(err) throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log("[webpack-dev-server]", "http://localhost:8080");
  });
});

gulp.task('default', ['webpack-dev-server']);

gulp.task('ghPages', ['webpack'], function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});
