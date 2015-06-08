gulp       = require 'gulp'
gutil = require 'gulp-util'

concat     = require 'gulp-concat'
sass       = require 'gulp-sass'
sourcemaps = require 'gulp-sourcemaps'
coffee = require 'gulp-coffee'
uglify = require 'gulp-uglify'
plumber = require('gulp-plumber')
gulpFilter = require('gulp-filter')

# CONFIG ---------------------------------------------------------

isProd = gutil.env.type is 'prod'

sources =
  sass: ['assets/sass/**/*.sass', 'assets/sass/**/*.scss']
  sassPublic: ['assets/sass/style.sass']
  coffee: [
    'assets/coffee/jquery.gphoto.coffee'
    'assets/coffee/jquery.ggrid.coffee'
    'assets/coffee/site.coffee'
  ]
  js: [
    'assets/vendor/jquery/dist/jquery.js'
    'assets/vendor/bootstrap-sass/assets/javascripts/bootstrap.js'
    'assets/vendor/velocity/velocity.js'
    'assets/vendor/velocity/velocity.ui.js'
    'assets/vendor/ramjet/dist/ramjet.js'
    'assets/vendor/hypher/dist/jquery.hypher.js'
    'assets/vendor/hyphenation-patterns/dist/browser/ru.js'
    'assets/vendor/swiper/dist/js/swiper.jquery.js'
    'assets/vendor/magnific-popup/dist/jquery.magnific-popup.js'
    'assets/vendor/URIjs/src/URI.js'
    'assets/vendor/bootstrap-validator/dist/validator.js'
    'assets/vendor/bootstrap-datepicker/dist/js/bootstrap-datepicker.js'
    'assets/vendor/bootstrap-datepicker/dist/locales/bootstrap-datepicker.ru.min.js'
  ]

# dev and prod will both go to dist for simplicity sake
destinations =
  css: 'static/css/'
  js: 'static/js/'

swallowError = (error) ->
  #If you want details of the error in the console
  gutil.log(gutil.colors.red(error.plugin) + ' '+ error.messageFormatted);
  @emit 'end'
  return

# TASKS -------------------------------------------------------------
gulp.task 'coffee', ->
  gulp.src(sources.coffee)
  .pipe(plumber(errorHandler: swallowError))
  .pipe(sourcemaps.init())
  .pipe(coffee({bare: true}))
  .pipe(concat('site.js'))
  .pipe(if isProd then uglify() else gutil.noop())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(destinations.js))

gulp.task "scripts", ->
  gulp.src(sources.js)
    .pipe(sourcemaps.init())
    .pipe(concat("all.js"))
    .pipe(if isProd then uglify() else gutil.noop())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(destinations.js))

gulp.task 'style', ->
  gulp.src(sources.sassPublic)
  .pipe(plumber(errorHandler: swallowError))
  .pipe(sourcemaps.init())
  .pipe(sass({errLogToConsole: true}))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(destinations.css))

gulp.task 'watch', ->
  gulp.watch sources.sass, ['style']
  gulp.watch sources.coffee, ['coffee']

gulp.task 'build', ['style', 'scripts']

# default task
gulp.task "default", [
  'build'
  'watch'
  ]
