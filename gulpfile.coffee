plugins         = require('gulp-load-plugins')()

gulp            = require 'gulp'

# karma           = require('karma').server

fs              = require 'fs'
merge           = require 'merge-stream'
del             = require 'del'
vinylPaths      = require 'vinyl-paths'
path            = require 'path'
notification    = require 'node-notifier'
exec            = require('child_process').exec

# Defaults

dest        = 'dist'
src         = 'src'
test        = 'tmp/'
moduleName  = 'imago'

# END Defaults

getFolders = (dir) ->
  fs.readdirSync(dir).filter (file) ->
    fs.statSync(path.join(dir, file)).isDirectory()

compileFolder = (folder) ->
  gulp.src(path.join(src, folder, "/*"))
    .pipe plugins.plumber(
      errorHandler: reportError
    )
    .pipe plugins.order([
        "index.coffee"
      ])
    .pipe plugins.if /[.]jade$/, plugins.jade({locals: {}}).on('error', reportError)
    .pipe plugins.if /[.]html$/, plugins.angularTemplatecache(
      module: moduleName
      root: '/imago/'
    )
    .pipe plugins.if /[.]coffee$/, plugins.ngClassify(
      appName: moduleName
      animation:
        format: 'camelCase'
        prefix: ''
      constant:
        format: 'camelCase'
        prefix: ''
      controller:
        format: 'camelCase'
        suffix: ''
      factory:
        format: 'camelCase'
      filter:
        format: 'camelCase'
      provider:
        format: 'camelCase'
        suffix: ''
      service:
        format: 'camelCase'
        suffix: ''
      value:
        format: 'camelCase'
      )
    .pipe plugins.if /[.]coffee$/, plugins.coffee(
        bare: true
      ).on('error', reportError)
    .pipe plugins.if /[.]coffee$/, plugins.coffeelint()
    .pipe(plugins.concat(folder + ".js"))
    .pipe(gulp.dest(dest))
    .pipe(plugins.uglify())
    .pipe(plugins.rename(folder + ".min.js"))
    .pipe gulp.dest(dest)

gulp.task 'sketch', ->
  gulp.src paths.sketch
    .pipe plugins.sketch(
      export: 'artboards'
      saveForWeb: true
      trimmed: false)
    .pipe gulp.dest "#{dest}/i"

gulp.task "join", ->
  folders = getFolders(src)
  tasks = folders.map (folder) ->
    compileFolder(folder)

  return merge(tasks)

gulp.task "karma", ->
  gulp.src paths.coffee
    .pipe plugins.plumber(
      errorHandler: reportError
    )
    .pipe plugins.ngClassify(
      appName: moduleName
      animation:
        format: 'camelCase'
        prefix: ''
      constant:
        format: 'camelCase'
        prefix: ''
      controller:
        format: 'camelCase'
        suffix: ''
      factory:
        format: 'camelCase'
      filter:
        format: 'camelCase'
      provider:
        format: 'camelCase'
        suffix: ''
      service:
        format: 'camelCase'
        suffix: ''
      value:
        format: 'camelCase'
      )
    .pipe plugins.coffee(
      bare: true
    ).on('error', reportError)
    .pipe gulp.dest test
  gulp.src paths.jade
    .pipe plugins.plumber(
      errorHandler: reportError
    )
    .pipe plugins.jade({locals: {}}).on('error', reportError)
    .pipe plugins.angularTemplatecache(
      standalone: true
      root: "/imagoWidgets/"
      module: "ImagoWidgetsTemplates"
    )
    .pipe plugins.concat targets.jade
    .pipe gulp.dest test
  karma.start(
    configFile: 'tests/karma.conf.coffee'
    singleRun: true
    )

gulp.task "clean", ->
  gulp.src("#{dest}/**/*.*", { read: false })
    .pipe(vinylPaths(del))

gulp.task "build", ["clean"], ->
  gulp.start 'join'


## Essentials Task

gulp.task "watch", ->
  plugins.watch({glob: "#{src}/**/*.*", emitOnGlob: false})
    .pipe plugins.tap (file, t) ->
      compileFolder(path.dirname(file.relative))

reportError = (err) ->
  plugins.gutil.beep()
  notification.notify
    title: "Error running Gulp"
    message: err.message
  plugins.gutil.log err.message
  @emit 'end'


## End essentials tasks

gulp.task "default", ["watch"]

module.exports = gulp
