import fs from 'fs-extra'
import del from 'del'
import path from 'path'
import gulp from 'gulp'
import ts from 'gulp-typescript'
import sourcemaps from 'gulp-sourcemaps'
import ava from 'gulp-ava'
import { rollup } from 'rollup'

import rollupConfig from './rollup.config'
import pkg from './package.json'

const projectRoot = path.resolve(__dirname)

const overridePkg = {
  main: './index.js',
  files: undefined
}

const libSrc = path.resolve(__dirname, 'src')
const libDest = path.resolve(__dirname, rollupConfig.output.dir)
const libProject = ts.createProject('tsconfig.json', {
  declaration: true
})

export async function clean() {
  await del(libDest + '/**/*')
}

export async function _buildUmd() {
  const bundle = await rollup(rollupConfig)
                
  return await bundle.write(rollupConfig.output)
}

export async function _copyConfig() {
  const newPkg = {
    ...pkg
  }

  for (const key of Object.keys(overridePkg)) {
    newPkg[key] = overridePkg[key]
  }

  await fs.ensureDir(libDest)
  await fs.writeFile(
    libDest + '/package.json',
    JSON.stringify(newPkg, null, 2)
  )

  return gulp
    .src(
      [
        projectRoot + '/*.*',
        '!' + projectRoot + '/package.json'
      ],
      {
        base: projectRoot
      }
    )
    .pipe(gulp.dest(libDest))
}

export async function _copySrc() {
  return gulp
    .src(libSrc + '/**/*.ts', {
      base: projectRoot
    })
    .pipe(gulp.dest(libDest))
}

export async function _copyTest() {
  return gulp
    .src(libSrc + '/**/*.ts', {
      base: projectRoot
    })
    .pipe(gulp.dest(libDest))
}

export function _buildCjs() {
  return gulp
    .src(libDest + '/src/**/*.ts', { base: libDest + '/src' })
    .pipe(sourcemaps.init())
    .pipe(libProject())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(libDest))
}

export const _build = gulp.series(
  _copyConfig,
  _copySrc,
  _copyTest,
  _buildUmd,
  _buildCjs
)

export const build = gulp.series(clean, _build)

const testDest = path.resolve(__dirname, 'out')
const testProject = ts.createProject('tsconfig.json')

export async function cleanTest() {
  await del(testDest + '/**/*')
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
