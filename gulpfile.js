/* global GLOBAL */
var gulp = require('gulp-param')(require('gulp'), process.argv);
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var del = require('del');
var runSequence = require('run-sequence');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var cssnext = require('postcss-cssnext');
var sourcemaps = require('gulp-sourcemaps');
var cssnano = require('cssnano');

var nunjucksRender = require('gulp-nunjucks-render');
var htmlmin = require('gulp-htmlmin');
var data = require('gulp-data');
var imagemin = require('gulp-imagemin');
var projectPackage = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var gutil = require('gulp-util');

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.config.js');
var stream = require('webpack-stream');

var POSTCSS_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

GLOBAL.config = {
  env: 'prod',
  src: 'src',
  dest: 'dist',
  version: projectPackage.version
};


/** Clean */

gulp.task('clean', function() {
  return del([ GLOBAL.config.dest ]);
});

gulp.task('webpack', [], function() {
  return gulp.src([GLOBAL.config.src + '/js/**/*.jsx', GLOBAL.config.src + '/js/**/*.js']) // gulp looks for all source files under specified path
    .pipe(gulpif(GLOBAL.config.env !== 'prod', sourcemaps.init()))
    .pipe(stream(webpackConfig)) // blend in the webpack config into the source files
    .pipe(gulpif(GLOBAL.config.env === 'prod', uglify())) // minifies the code for better compression
    .pipe(gulpif(GLOBAL.config.env !== 'prod', sourcemaps.write()))
    .pipe(gulp.dest(GLOBAL.config.dest))
    .pipe(browserSync.stream());
});


/** HTML */
gulp.task('html', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src([
    GLOBAL.config.src + '/*.html'
  ])

  // Renders template with nunjucks
  .pipe(nunjucksRender({
    path: [ GLOBAL.config.src + '/templates' ]
  }))
    .pipe(gulpif(GLOBAL.config.env === 'prod', htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest(GLOBAL.config.dest))
    .pipe(browserSync.stream());
});

/** Styles */
gulp.task('styles', function() {
  var processors = [ cssnext({
    browsers: POSTCSS_BROWSERS,
    features: {
      customProperties: false
    }
  }) ];
  return gulp.src(GLOBAL.config.src + '/**/*.scss')

  // Only create sourcemaps for dev
  .pipe(gulpif(GLOBAL.config.env !== 'prod', sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulpif(GLOBAL.config.env === 'prod', postcss([ cssnano() ])))
    .pipe(gulpif(GLOBAL.config.env !== 'prod', sourcemaps.write()))
    .pipe(gulp.dest(GLOBAL.config.dest))
    .pipe(browserSync.stream());
});

/** Images */
gulp.task('images', function() {
  return gulp.src(GLOBAL.config.src + '/**/*.{png,jpg,jpeg,gif,svg}')
    .pipe(gulpif(GLOBAL.config.env === 'prod', imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [ {removeViewBox: false} ]
    })))
    .pipe(gulp.dest(GLOBAL.config.dest))
    .pipe(browserSync.stream());
});

gulp.task('static', function() {
  return gulp.src(GLOBAL.config.src + '/static/**/*.*')
    .pipe(gulp.dest(GLOBAL.config.dest + '/static'))
    .pipe(browserSync.stream());
});


// Watch files for changes & reload
gulp.task('serve', function() {
  browserSync({
    port: 7000,
    notify: false,
    server: {
      baseDir: GLOBAL.config.dest
    }
  });

  if (GLOBAL.config.env !== 'prod') {
    gulp.watch('src/**/*.scss', ['styles', reload]);
    gulp.watch('src/**/*.js', ['webpack', reload]);
    gulp.watch('src/**/*.html', ['html', reload]);
    gulp.watch('src/images/**/*.*', ['images', reload]);
    gulp.watch('src/static/**/*.*', ['static', reload]);

    //gulp.watch('src/scripts/sw.js', ['serviceworker']);
  }
});

/** Watches */

var allTasks = ['html', 'webpack', 'styles', 'images', 'static'];


gulp.task('dev', function() {
  GLOBAL.config.env = 'dev';
  return runSequence('clean', allTasks, 'serve');

});

gulp.task('prod', function() {
  return runSequence('clean', allTasks);
});
