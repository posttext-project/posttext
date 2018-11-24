import { PluginConstructor } from './Plugin'

export class Middleware {
  static mock(
    target: any,
    method: string,
    middleware: ((fn: Function) => Function)
  ): Function {
    const origin: Function = target[method]

    const wrapped = middleware(origin)
    target[method] = wrapped

    return origin
  }
}
