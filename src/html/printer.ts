import { Registry, Scope } from '../registry'

export interface PrintOptions {
  indent?: number
}

export class Printer {
  initialScope: Scope = new Scope()
  
  setScope(scope: Scope) {
    this.initialScope = scope
  }

  getScope(): Scope {
    return this.initialScope
  }

  setRegistry(registry: Registry) {
    this.initialScope.setRegistry(registry)
  }

  getRegistry(): Registry {
    return this.initialScope.getRegistry()
  }

  print(ast: Node, options: PrintOptions = {}): string {
    return ''
  }
}
