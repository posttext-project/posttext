import 'core-js/stable'
import 'regenerator-runtime/runtime'

import del from 'del'
import path from 'path'
import gulp from 'gulp'
import ts from 'gulp-typescript'
import sourcemaps from 'gulp-sourcemaps'
import ava from 'gulp-ava'
import { rollup } from 'rollup'

import rollupConfig from './rollup.config'

const libDest = path.resolve(__dirname, rollupConfig.output.dir)

export async function clean() {
  await del(libDest)
}

export async function _build() {
  const bundle = await rollup(rollupConfig)

  return bundle.write(rollupConfig.output)
}

export const build = gulp.series(clean, _build)

const testDest = path.resolve(__dirname, 'out')
const testProject = ts.createProject('tsconfig.json')

export async function cleanTest() {
  await del(testDest)
}

export function buildTest() {
  return testProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(testProject())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(testDest))
}

export function _test() {
  return gulp
    .src(testDest + '/test/*.js')
    .pipe(ava({ verbose: true }))
}

export const test = gulp.series(cleanTest, buildTest, _test)
