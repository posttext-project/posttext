import { compile as _compile } from 'handlebars'
import { default as memoizee } from 'memoizee'

export const compile: <T = any>(
  input: any,
  options?: CompileOptions | undefined
) => HandlebarsTemplateDelegate<T> = memoizee(_compile)

export default {
  compile,
}
