/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import ts from 'gulp-typescript'
import del from 'del'
import path from 'path'
import sourcemaps from 'gulp-sourcemaps'

import { src, task, series, dest } from 'gulp'
import merge from 'merge-stream'

const reporter = ts.reporter.fullReporter(true)

const packages = [
  'parser',
  'registry',
  'printer',
  'ptlib',
  'modules',
  'compiler',
  'cli',
]

forEachPkg(({ pkgBase, pkgName }) =>
  task(`build:${pkgName}`, () => {
    const tsProject = ts.createProject(pkgBase('tsconfig.json'))

    const tsResult = src(
      pkgBase(['src/**/*.ts', '!src/**/assets/**/*']),
      {
        base: pkgBase('src'),
      }
    )
      .pipe(sourcemaps.init())
      .pipe(tsProject(reporter))

    const assetsResult = src(pkgBase(['src/**/assets/**/*']), {
      base: pkgBase('src'),
    })

    return merge(
      tsResult.dts.pipe(dest(pkgBase('types'))),
      tsResult.js.pipe(dest(pkgBase('lib'))),
      assetsResult.pipe(dest(pkgBase('lib')))
    )
  })
)

task(
  'build',
  series(forEachPkg(({ pkgName }) => `build:${pkgName}`))
)

task('clean', async () => {
  await forEachPkg(async ({ pkgBase }) => {
    await del(pkgBase('lib'))
    await del(pkgBase('types'))
  })

  await del('dist')
})

function forEachPkg(callback) {
  return packages.map((pkgName) => {
    const dir = path.resolve(__dirname, 'packages', pkgName)

    return callback({
      pkgName,
      pkgBasePath: dir,
      pkgBase: extractBasePath(dir),
    })
  })
}

function extractBasePath(dir) {
  return (relativePath) => {
    if (Array.isArray(relativePath)) {
      return relativePath.map(extractBasePath(dir))
    }

    return dir[0] === '!'
      ? '!' + path.resolve(dir, relativePath.substring(1))
      : path.resolve(dir, relativePath)
  }
}
