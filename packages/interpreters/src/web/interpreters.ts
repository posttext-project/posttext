/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import fs from 'fs-extra'
import url from 'url'
import path from 'path'
import findUp from 'find-up'
import webpack from 'webpack'
import prettier from 'prettier'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import {
  Command,
  Data,
  Interpreter,
  Context,
} from '@posttext/registry'
import {
  DocumentNode,
  BlockNode,
  TagNode,
  TextNode,
} from '@posttext/parser'

import Handlebars from '../helpers/handlebars.js'
import { interpreters as commonInterpreters } from '../common/index.js'

export interface InterpreterOptions {
  output: string
  js: string[]
  css: string[]
  mode: 'development' | 'production' | 'none' | undefined
  resolve: Partial<{
    modules: string[]
  }>
}

export const getInterpreters = ({
  output = path.resolve(process.cwd(), 'dist'),
  js = [],
  css = [],
  mode = 'development',
  resolve = {},
}: Partial<InterpreterOptions> = {}): Record<
  string,
  Interpreter
> => {
  const externalJsDeps = js
  const externalCssDeps = css

  return {
    ...commonInterpreters,

    print: {
      modifier: 'private',

      interpret: async function* (
        command: Command,
        context: Context
      ): AsyncGenerator<Data, any, any> {
        const documentAst = command.ast as
          | DocumentNode
          | BlockNode
          | TagNode
          | TextNode

        const preloadIter = context.dispatch({
          name: 'preload',
          node: documentAst,
        })

        const preloadCollection: Data[] = []
        for await (const data of preloadIter) {
          preloadCollection.push(data)
        }

        const renderIter = context.dispatch({
          name: 'render',
          node: documentAst,
        })

        const collection: Data[] = []
        for await (const data of renderIter) {
          collection.push(data)
        }

        const metadata = collection
          .filter((data) => data.name === 'metadata')
          .map((data) => data.metadata)
          .reduce(
            (prevMetadata, metadata) => ({
              ...prevMetadata,
              ...metadata,
            }),
            {}
          )

        const deps = [
          ...preloadCollection,
          ...collection,
        ].filter((data) => data.name === 'dependency')

        const content = collection
          .filter((data) => data.name === 'html')
          .map((data) => data.content)
          .join('')

        const htmlTemplate = await fs.readFile(
          path.resolve(
            path.dirname(url.fileURLToPath(import.meta.url)),
            './assets/template.html'
          ),
          'utf-8'
        )
        const template = Handlebars.compile(htmlTemplate)

        const rendered = template({
          metadata: {
            ...metadata,
            title: metadata.title || 'PostText',
          },
          data: {
            content,
            production: mode !== 'development',
          },
        })

        // TODO: Add hooks.

        yield* context.dispatch({
          name: 'writeFile',
          file: 'index.html',
          content: prettier.format(rendered, {
            parser: 'html',
          }),
        })

        yield* context.dispatch({
          name: 'compileDeps',
          deps,
        })
      },
    },

    copyFile: {
      interpret: async function* (
        command: Command,
        _context: Context
      ): AsyncGenerator<Data, any, any> {
        const src = command.src as string
        const dest = command.dest as string

        // TODO: Secure file path.

        const outputPath = path.resolve(output, dest)

        await fs.copy(src, outputPath)

        return path.relative(output, outputPath)
      },
    },

    writeFile: {
      modifier: 'private',

      interpret: async function* (
        command: Command,
        _context: Context
      ): AsyncGenerator<Data, any, any> {
        const file = command.file as string
        const content = command.content as string

        // TODO: Secure file path.

        const filePath = path.resolve('dist', file)

        await fs.ensureFile(filePath)
        await fs.writeFile(filePath, content)
      },
    },

    compileDeps: {
      modifier: 'private',

      interpret: async function* (
        command: Command,
        _context: Context
      ): AsyncGenerator<Data, any, any> {
        const deps = command.deps as any[]

        const jsDeps = deps
          .filter((dep) => dep.type === 'js')
          .map((dep) => dep.src)
          .concat(externalJsDeps) as string[]

        const cssDeps = deps
          .filter((dep) => dep.type === 'css')
          .map((dep) => dep.src)
          .concat(externalCssDeps) as string[]

        const pathToNodeModules = await findUp('node_modules', {
          cwd: url.fileURLToPath(import.meta.url),
          type: 'directory',
        })

        if (jsDeps.length + cssDeps.length > 0) {
          const compiler = webpack({
            entry: [...jsDeps, ...cssDeps],
            output: {
              path: output,
              filename: '[name].js',
            },
            mode,
            devtool: false,
            target: 'web',
            module: {
              rules: [
                {
                  test: /\.ts$/i,
                  use: [
                    {
                      loader: 'ts-loader',
                      options: {
                        transpileOnly: true,
                      },
                    },
                  ],
                },
                {
                  test: /\.css$/i,
                  use: [
                    mode === 'development'
                      ? 'style-loader'
                      : MiniCssExtractPlugin.loader,
                    {
                      loader: 'css-loader',
                    },
                  ],
                },
                {
                  test: /\.(png|svg|jpg|jpeg|gif)$/i,
                  type: 'asset/resource',
                },
                {
                  test: /\.(woff|woff2|eot|ttf|otf)$/i,
                  type: 'asset/resource',
                },
              ],
            },
            resolve: {
              modules: [
                ...(pathToNodeModules
                  ? [pathToNodeModules]
                  : []),
                ...new Set(resolve?.modules),
              ],
              extensions: ['.ts', '.tsx', '.js', '.css'],
            },
            resolveLoader: {
              modules: [
                ...(pathToNodeModules
                  ? [pathToNodeModules]
                  : []),
              ],
            },
            plugins: ([] as any[]).concat(
              mode === 'development'
                ? [
                    new webpack.SourceMapDevToolPlugin({
                      filename: '[name].js.map',
                    }),
                  ]
                : [
                    new MiniCssExtractPlugin({
                      filename: '[name].css',
                    }),
                  ]
            ),
          })

          await new Promise((resolve, reject) => {
            compiler.run((err, stats) => {
              if (err) {
                reject(err)
              }

              console.log(
                stats?.toString({
                  chunks: false,
                  colors: true,
                })
              )

              resolve(true)
            })
          })
        }
      },
    },
  }
}

export const interpreters = getInterpreters()
