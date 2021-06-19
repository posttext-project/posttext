import fsPkg from 'fs'
import glob from 'glob'
import * as meow from 'meow'
import path from 'path'
import util from 'util'
import url from 'url'

const { promises: fs } = fsPkg
const asyncGlob = util.promisify(glob)

class AddLicenseCommand {
  static create() {
    const cli = meow.default(
      `
        Usage
          $ add-license -f <license-file> pattern
          $ add-license -f <license-file> --check pattern
        
        Options
          --help, -h    Show this help message.

          --check       Enable check only mode.
          --file, -f    Specify license header file.
      `,
      {
        importMeta: import.meta,
        description: false,
        hardRejection: false,
        autoHelp: true,
      }
    )

    return new AddLicenseCommand({ cli })
  }

  constructor({ cli }) {
    this.cli = cli
  }

  async run() {
    const licenseFile = this.cli.flags.f ?? this.cli.flags.file
    const patterns = this.cli.input

    const check = this.cli.flags.check

    if (licenseFile) {
      const license = await fs.readFile(
        path.resolve(
          path.dirname(url.fileURLToPath(import.meta.url)),
          '..',
          licenseFile
        ),
        'utf8'
      )

      let success = true
      for (const pattern of patterns) {
        success =
          (await this.addLicense(pattern, license, check)) &&
          success
      }

      if (check) {
        const failed = !success

        if (failed) {
          process.exit(1)
        }
      }
    }
  }

  async addLicense(pattern, license, check) {
    const matches = await asyncGlob(pattern)

    let success = true
    for (const file of matches) {
      const content = await fs.readFile(file, 'utf8')
      const crlf = content.indexOf('\r\n') !== -1

      if (crlf !== (license.indexOf('\r\n') !== -1)) {
        if (crlf) {
          license = license.replace(/\n/g, '\r\n')
        } else {
          license = license.replace(/\r\n/g, '\n')
        }
      }

      if (!content.includes(license)) {
        success = false
        console.log(file)

        if (!check) {
          if (content.startsWith('#!')) {
            const hashBang =
              content.match(/^(#![^\n]*)/)?.[1] ?? ''

            await fs.writeFile(
              file,
              `${hashBang}\n\n${license}${content.substring(
                hashBang.length
              )}`
            )
          } else {
            await fs.writeFile(file, `${license}\n${content}`)
          }
        }
      }
    }

    return success
  }
}

AddLicenseCommand.create()
  .run()
  .catch((err) => {
    console.error(err)

    process.exit(1)
  })
