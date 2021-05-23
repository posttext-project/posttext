/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import Handlebars from '../helpers/handlebars'
import fs from 'fs-extra'
import path from 'path'
import webpack from 'webpack'
import prettier from 'prettier'
import stripIndent from 'strip-indent'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

import { interpreters as commonInterpreters } from '../common'
import { Interpreter, Context } from '../interpreter'
import { Command } from '../command'
import { Data } from '../data'
import * as ast from '../../ast'

export interface InterpreterOptions {
  output: string
  js: string[]
  css: string[]
  mode: 'development' | 'production' | 'none' | undefined
}

export const getInterpreters = ({
  output = 'dist',
  js = [],
  css = [],
  mode = 'development',
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
          | ast.DocumentNode
          | ast.BlockNode
          | ast.TagNode
          | ast.TextNode

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

        const template = Handlebars.compile(
          stripIndent(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{{ metadata.title }}</title>
                {{#if data.production}}
                <link rel="stylesheet" href="./main.css">
                {{/if}}
              </head>
              <body>
                {{{ data.content }}}
  
                <script src="./main.js"></script>
              </body>
            </html>
          `)
        )

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
              modules: ['node_modules'],
              extensions: ['.ts', '.tsx', '.js', '.css'],
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
