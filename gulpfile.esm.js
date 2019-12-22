import del from 'del'
import merge from 'merge-stream'
import ts from 'gulp-typescript'
import sourcemaps from 'gulp-sourcemaps'

import { src, task, series, dest } from 'gulp'

const reporter = ts.reporter.fullReporter(true)

task('build:cjs', () => {
  const tsProject = ts.createProject('tsconfig.json')

  return merge(
    src('src/**/*.{html,js}').pipe(dest('lib')),
    src('src/**/*.ts')
      .pipe(sourcemaps.init())
      .pipe(tsProject(reporter))
      .js.pipe(sourcemaps.write('.'))
      .pipe(dest('lib'))
  )
})

task('build', series(['build:cjs']))

task('clean', async () => {
  await del('lib')
})
