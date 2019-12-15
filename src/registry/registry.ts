import { Package } from './package'

export class Registry {
  packages: Map<string, Package> = new Map()

  static create() {
    return new Registry()
  }

  addPackage(key: string, pkg: Package) {
    this.packages.set(key, pkg)
  }

  findPackage(key: string): Package | false {
    const pkgs = this.packages

    if (pkgs.has(key)) {
      return pkgs.get(key)
    }

    return false
  }
}
