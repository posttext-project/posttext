const { spawn } = require('child_process')
const gulp = require('gulp')
const ts = require('gulp-typescript')
const path = require('path')
const { argv } = require('yargs')

const tsProject = ts.createProject('tsconfig.json')

function outDir() {
  return path.resolve(argv.out || 'out')
}

function outFile() {
  return path
    .join(outDir(), path.relative('src', argv.exec))
    .replace(/\.ts$/, '.js')
}

gulp.task('default', function() {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest(outDir()))
})

gulp.task('run', ['default'], function() {
  spawn('node.exe', [outFile()], {
    stdio: 'inherit'
  })
})
