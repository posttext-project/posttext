import { PluginConstructor } from './Plugin'

export class Middleware {
  static mock(
    target: any,
    method: string,
    middleware: Function
  ) {
    const origin = target[method]

    const wrapped = middleware(origin)
    target[method] = wrapped

    return origin
  }
}
