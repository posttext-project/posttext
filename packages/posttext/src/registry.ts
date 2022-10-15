/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Module } from './module.js'
import { Package, PackageLoader } from './package.js'

export interface RegistryOptions {
  packageLoader?: PackageLoader
}

export interface RegistryStruct {
  packageLoader?: PackageLoader
}

export class Registry {
  static create(options?: RegistryOptions): Registry {
    return new Registry(options)
  }

  constructor({ packageLoader }: RegistryStruct = {}) {
    this.packageLoader = packageLoader
  }

  private packages?: Map<string, Package>
  private packageLoader?: PackageLoader

  loadPackages(): void {
    this.packages = new Map(
      Object.entries(this.packageLoader?.getPackages() ?? {})
    )
  }

  addPackage(pkgName: string, pkg: Package): void {
    if (!this.packages) {
      this.packages = new Map()
    }
    this.packages.set(pkgName, pkg)
  }

  hasModule(moduleName: string): boolean {
    if (!this.packages) {
      this.packages = new Map()
    }
    return this.packages.get(moduleName) ? true : false
  }

  getModule(moduleName: string): Module | undefined {
    if (!this.packages) {
      this.packages = new Map()
    }
    return this.packages.get(moduleName)?.getRootModule()
  }
}
