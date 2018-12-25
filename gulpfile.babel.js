import { spawn } from 'child_process'
import del from 'del'
import gulp from 'gulp'
import ts from 'gulp-typescript'
import path from 'path'
import { argv } from 'yargs'
import sourcemaps from 'gulp-sourcemaps'

const tsProject = ts.createProject('tsconfig.json')

function outDir() {
  return path.resolve(argv.out || 'out')
}

function outFile() {
  return path
    .join(
      outDir(),
      path.relative('src', argv.target || 'src/index.ts')
    )
    .replace(/\.ts$/, '.js')
}

export function clean(callback) {
  del(outDir() + '/**').then(() => callback())
}

export const build = gulp.series(clean, function() {
  return tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(outDir()))
})

export const run = gulp.series(build, function(callback) {
  spawn('node.exe', [outFile()], {
    stdio: 'inherit'
  })

  callback()
})
