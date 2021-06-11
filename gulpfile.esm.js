/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import ts from 'gulp-typescript'
import del from 'del'
import path from 'path'
import merge from 'merge-stream'
import sourcemaps from 'gulp-sourcemaps'

import { promises as fs } from 'fs'

import { src, task, series, dest } from 'gulp'

const reporter = ts.reporter.fullReporter(true)

task('exp', async () => {
  const packages = await fs.readdir(
    path.resolve(__dirname, 'packages')
  )

  for (const pkgName of packages) {
    console.log(path.resolve(__dirname, 'packages', pkgName))
  }
})

task('build:cjs', async () => {
  return merge(
    await forEachPkg(({ pkgBasePath }) => {
      const tsProject = ts.createProject('tsconfig.json')

      return merge(
        src(
          [
            path.resolve(pkgBasePath, 'src/**/*.ts'),
            '!' +
              path.resolve(pkgBasePath, 'src/**/assets/**/*'),
          ],
          {
            base: path.resolve(pkgBasePath, 'src'),
          }
        )
          .pipe(sourcemaps.init())
          .pipe(tsProject(reporter))
          .js.pipe(
            sourcemaps.write('.', {
              includeContent: false,
              sourceRoot: '../src',
            })
          )
          .pipe(dest('lib')),
        src([path.resolve(pkgBasePath, 'src/**/assets/**/*')], {
          base: path.resolve(pkgBasePath, 'src'),
        }).pipe(dest('lib'))
      )
    })
  )
})

task('build', series(['build:cjs']))

task('clean', async () => {
  await forEachPkg(async ({ pkgBasePath }) => {
    await del(path.resolve(pkgBasePath, 'lib'))
  })

  await del('dist')
})

async function forEachPkg(callback) {
  const packages = await fs.readdir(
    path.resolve(__dirname, 'packages')
  )

  const dirs = []

  for (const pkgName of packages) {
    dirs.push(path.resolve(__dirname, 'packages', pkgName))
  }

  return dirs.map((dir) => callback({ pkgBasePath: dir }))
}
