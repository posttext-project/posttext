/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import ts from 'gulp-typescript'
import del from 'del'
import path from 'path'
import merge from 'merge-stream'
import sourcemaps from 'gulp-sourcemaps'

import { src, task, series, dest } from 'gulp'

const reporter = ts.reporter.fullReporter(true)

task('build:cjs', () => {
  const tsProject = ts.createProject('tsconfig.json')

  return merge(
    src(['src/**/*.ts', '!src/**/assets/**/*'], {
      base: path.resolve(__dirname, 'src'),
    })
      .pipe(sourcemaps.init())
      .pipe(tsProject(reporter))
      .js.pipe(
        sourcemaps.write('.', {
          includeContent: false,
          sourceRoot: '../src',
        })
      )
      .pipe(dest('lib')),
    src(['src/**/assets/**/*'], {
      base: path.resolve(__dirname, 'src'),
    }).pipe(dest('lib'))
  )
})

task('build', series(['build:cjs']))

task('clean', async () => {
  await del('lib')
  await del('dist')
})
