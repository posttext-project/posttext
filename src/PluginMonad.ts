import { Plugin } from './Plugin'

export interface PluginOptions {
  plugins?: Map<any, any>
  middlewares?: Map<any, any>
  options?: Map<any, any>
}

export class PluginMonad {
  private plugins: Map<any, any>
  private middlewares: Map<any, any>
  private options: Map<any, any>

  constructor(options: PluginOptions = {}) {
    this.plugins = options.plugins || new Map()
    this.middlewares = options.middlewares || new Map()
    this.options = options.middlewares || new Map()
  }

  addOptions(signature: any, newOptions: any) {
    const options = new Map(this.options)
    options.set(signature, newOptions)

    return this.clone({
      options
    })
  }

  getOptions(signature: any) {
    return this.options.get(signature)
  }

  castPlugins(newPlugins: Plugin[]): PluginMonad {
    const plugins = new Map(this.plugins)

    for (const plugin of newPlugins) {
      plugins.set(plugin.constructor, plugin)
    }

    const newMonad = this.clone({
      plugins
    })

    return newPlugins.reduce(
      (all, next) => next.setup(all),
      newMonad
    )
  }

  castPlugin(plugin: Plugin): PluginMonad {
    const plugins = new Map(this.plugins)
    plugins.set(plugin.constructor, plugin)

    return plugin.setup(
      this.clone({
        plugins
      })
    )
  }

  getPlugin(signature: typeof Plugin): Plugin {
    return this.plugins.get(signature)
  }

  createPlugin(signature: typeof Plugin) {
    const options = this.options.get(signature)
    const plugin = signature.create(options)

    return this.applyMiddlewares(plugin)
  }

  applyMiddlewares(plugin: Plugin): Plugin {
    const middlewares: any[] = this.middlewares.get(
      plugin.constructor
    )

    return middlewares.reduce((all, next) => next(all), plugin)
  }

  mockup(
    signature: typeof Plugin,
    method: string,
    middleware: (fn: Function) => Function
  ): PluginMonad {
    const monadMiddlewares = new Map(this.middlewares)
    const pluginMiddlewares =
      monadMiddlewares.get(signature) || []

    const applyMiddleware = function(plugin: any) {
      const mockedMethod = plugin[method]
      plugin[method] = middleware

      return mockedMethod
    }

    monadMiddlewares.set(signature, [
      ...pluginMiddlewares,
      applyMiddleware
    ])

    return new PluginMonad({
      middlewares: monadMiddlewares
    })
  }

  clone(options: PluginOptions): PluginMonad {
    return new PluginMonad({
      ...((this as any) as object),
      ...options
    })
  }
}
