import fs from 'fs-extra'
import glob from 'glob'
import meow from 'meow'
import path from 'path'
import util from 'util'

const asyncGlob = util.promisify(glob)

class AddLicenseCommand {
  private cli: meow.Result<any>

  static create(): AddLicenseCommand {
    const cli = meow(
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
        description: false,
        hardRejection: false,
        autoHelp: true,
      }
    )

    return new AddLicenseCommand({ cli })
  }

  constructor({ cli }: { cli: meow.Result<any> }) {
    this.cli = cli
  }

  async run(): Promise<void> {
    const licenseFile = (this.cli.flags.f ??
      this.cli.flags.file) as string
    const patterns = this.cli.input as string[]

    const check = this.cli.flags.check as boolean

    if (licenseFile) {
      const license = await fs.readFile(
        path.resolve(__dirname, '..', licenseFile),
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

  private async addLicense(
    pattern: string,
    license: string,
    check: boolean
  ): Promise<boolean> {
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
