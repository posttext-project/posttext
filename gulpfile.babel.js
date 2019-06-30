import 'core-js/stable'
import 'regenerator-runtime/runtime'

import del from 'del'
import gulp from 'gulp'
import ts from 'gulp-typescript'
import path from 'path'
import sourcemaps from 'gulp-sourcemaps'

const TEST_DIR = path.resolve(__dirname, '_test')
const LIB_DIR = path.resolve(__dirname, 'lib')

const tsProject = ts.createProject('tsconfig.json')

export async function clean(callback) {
  await del(LIB_DIR + '/**')
  callback()
}

export async function cleanTest(callback) {
  await del(TEST_DIR + '/**')
  callback()
}

export const build = gulp.series(clean, function() {
  return tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(LIB_DIR))
})

export const buildTest = gulp.series(cleanTest, () => {
  return tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(TEST_DIR))
})
