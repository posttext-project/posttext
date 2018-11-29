import { spawn } from 'child_process'
import del from 'del'
import gulp from 'gulp'
import ts from 'gulp-typescript'
import path from 'path'
import { argv } from 'yargs'

const tsProject = ts.createProject('tsconfig.json')

function debug(arg) {
  console.log(arg)
  return arg
}

function outDir() {
  return path.resolve(argv.out || 'out')
}

function outFile() {
  return path
    .join(
      outDir(),
      path.relative('src', argv.exec || 'src/index.ts')
    )
    .replace(/\.ts$/, '.js')
}

export function clean(callback) {
  // del(outDir() + '/**').then(callback)
  callback()
}

export const build = gulp.series(clean, function() {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest(outDir()))
})

export const run = gulp.series(build, function(callback) {
  spawn('node.exe', [outFile()], {
    stdio: 'inherit'
  })

  callback()
})
