/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import path from 'path'
import fs from 'fs-extra'

import { Command, CommandOptions } from './command'
import { FileServer } from './servers/file'
import { PackageServer } from './servers/package'

export class ServeCommand implements Command {
  private args: string[]

  constructor({ args }: CommandOptions) {
    this.args = args
  }

  static create(options: CommandOptions): ServeCommand {
    return new ServeCommand(options)
  }

  async run(): Promise<void> {
    const inputPath = path.resolve(process.cwd(), this.args[0])

    if ((await fs.lstat(inputPath)).isDirectory()) {
      return await this.servePackage()
    }

    return await this.serveFile()
  }

  private async servePackage(): Promise<void> {
    return PackageServer.create({
      rootPath: this.args[0],
    }).serve()
  }

  private async serveFile(): Promise<void> {
    return FileServer.create({ input: this.args[0] }).serve()
  }
}
