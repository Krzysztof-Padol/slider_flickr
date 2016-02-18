var gulp = require('gulp');
var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var rimraf = require('rimraf');
var source = require('vinyl-source-stream');
var _ = require('lodash');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var reload = browserSync.reload;

var config = {
  entryFile: './src/app.js',
  outputDir: './dist/',
  outputFile: 'app.js'
};

// clean the output directory
gulp.task('clean', function(cb){
    rimraf(config.outputDir, cb);
});

var bundler;
function getBundler() {
  if (!bundler) {
    bundler = watchify(browserify(config.entryFile, _.extend({ debug: true }, watchify.args)));
  }
  return bundler;
};

function bundle() {
  return getBundler()
    .transform(babelify)
    .bundle()
    .on('error', function(err) { console.log('Error: ' + err.message); })
    .pipe(source(config.outputFile))
    .pipe(gulp.dest(config.outputDir))
    .pipe(reload({ stream: true }));
}

gulp.task('build-persistent', ['clean'], function() {
  return bundle()
});

gulp.task('build-and-add-statics', ['build-persistent', 'sass', 'copy:images'], function(cb) {
  cb();
});

gulp.task('build', ['build-and-add-statics'], function() {
  process.exit(0);
});

gulp.task('watch', ['build-and-add-statics', 'sass:watch', 'index:watch'], function() {

  browserSync({
    server: {
      baseDir: './'
    }
  });

  getBundler().on('update', function() {
    gulp.start('build-and-add-statics')
  });
});

gulp.task('sass', ['clean'],function () {
  return gulp.src('./sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(config.outputDir + 'css'))
    .pipe(reload({ stream: true }));
});
 
gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('index:watch', function () {
  gulp.watch("./index.html").on('change', reload);
});

gulp.task('copy:images', ['clean'],function () {
  return gulp
    .src('./images/**/*.*')
    .pipe(gulp.dest(config.outputDir + 'images'));
});

// WEB SERVER
gulp.task('serve', function () {
  browserSync({
    server: {
      baseDir: './'
    }
  });
});
