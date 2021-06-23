import fsPkg from 'fs'
import glob from 'glob'
import * as meow from 'meow'
import path from 'path'
import util from 'util'
import url from 'url'
import semver from 'semver'

const { promises: fs } = fsPkg
const asyncGlob = util.promisify(glob)

class BumpVersionCommand {
  static create() {
    const cli = meow.default(
      `
        Usage
          $ bump-version major
          $ bump-version minor
          $ bump-version patch
      `,
      {
        importMeta: import.meta,
        description: false,
        hardRejection: false,
        autoHelp: true,
      }
    )

    return new BumpVersionCommand({ cli })
  }

  constructor({ cli }) {
    this.cli = cli
  }

  async run() {
    const pkg = JSON.parse(
      await fs.readFile(
        path.resolve(
          path.dirname(url.fileURLToPath(import.meta.url)),
          '../package.json'
        ),
        'utf-8'
      )
    )

    const newVersion = semver.inc(
      pkg.version,
      ...this.cli.input
    )

    const pkgFiles = await asyncGlob(
      '{packages/*/,./}package.json'
    )

    for (const pkgFile of pkgFiles) {
      const pkg = JSON.parse(
        await fs.readFile(pkgFile, 'utf-8')
      )

      pkg.version = newVersion

      await fs.writeFile(
        pkgFile,
        JSON.stringify(pkg, null, 2),
        'utf-8'
      )
    }
  }
}

BumpVersionCommand.create()
  .run()
  .catch((err) => {
    console.error(err)

    process.exit(1)
  })
