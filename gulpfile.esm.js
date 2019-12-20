import del from 'del'
import { src, task, series, dest } from 'gulp'
import ts from 'gulp-typescript'
import sourcemaps from 'gulp-sourcemaps'

const reporter = ts.reporter.fullReporter(true)

task('build:cjs', () => {
  const tsProject = ts.createProject('tsconfig.json')

  return src('src/**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(tsProject(reporter))
    .js.pipe(sourcemaps.write('.'))
    .pipe(dest('lib'))
})

task('build', series(['build:cjs']))

task('clean', async () => {
  await del('lib')
})
