import ts from 'gulp-typescript'
import del from 'del'
import path from 'path'
import merge from 'merge-stream'
import webpack from 'webpack'
import sourcemaps from 'gulp-sourcemaps'
import webpackConfig from './webpack.config'

import { src, task, series, dest } from 'gulp'

export function buildWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        return reject(err)
      }

      console.log(
        stats.toString({
          colors: true,
        })
      )

      const info = stats.toJson()

      if (stats.hasWarnings()) {
        console.log(info.warnings)
      }

      if (stats.hasErrors()) {
        return reject(info.errors)
      }

      resolve(true)
    })
  })
}

const reporter = ts.reporter.fullReporter(true)

task('build:cjs', () => {
  const tsProject = ts.createProject('tsconfig.json')

  return merge(
    src(['src/**/*.ts', '!src/cli/assets/**/*.ts'], {
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
      .pipe(dest('lib'))
  )
})

task('build:assets', async () => {
  await buildWebpack(webpackConfig)
})

task('build', series(['build:cjs', 'build:assets']))

task('clean', async () => {
  return await del('lib')
})
