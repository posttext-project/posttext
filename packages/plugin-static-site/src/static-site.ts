/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import fs from 'fs-extra'
import url from 'url'
import path from 'path'
import { findUpMultiple } from 'find-up'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import Handlebars from 'handlebars'
import {
  Command,
  Plugin,
  CommandResolver,
} from '@posttext/posttext'

export interface StaticSiteOptions {
  js: string[]
  css: string[]
  mode: 'development' | 'production' | 'none' | undefined
  resolve: Partial<{
    modules: string[]
  }>
}

export class StaticSitePlugin implements Plugin {
  static create(
    {
      js = [],
      css = [],
      mode = 'development',
      resolve = {},
    }: StaticSiteOptions = {
      js: [],
      css: [],
      mode: 'development',
      resolve: {},
    }
  ): StaticSitePlugin {
    return new StaticSitePlugin({
      js,
      css,
      mode,
      resolve,
    })
  }

  constructor(private options: StaticSiteOptions) {}

  getCommandResolvers(): Record<string, CommandResolver> {
    const options = this.options

    return {
      async *bundle(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const input = command.input as string
        const output = command.output as string

        const htmlResult = yield {
          name: 'compile',
          input,
        }

        const metadata = {
          ...htmlResult.metadata,
          title:
            htmlResult.metadata.title ?? 'Document - PostText',
        }

        const template = Handlebars.compile(htmlResult.html)

        const renderedHtml = template({
          metadata,
        })

        yield {
          name: 'writeFile',
          file: 'index.html',
          base: output,
          content: renderedHtml,
        }

        const nodeModulesPath = await findUpMultiple(
          'node_modules',
          {
            cwd: url.fileURLToPath(import.meta.url),
            type: 'directory',
          }
        )

        const js = [...htmlResult.js, ...options.js]
        const css = [...htmlResult.css, ...options.css]
        const entry = [...js, ...css]
        const mode = options.mode
        const resolve = options.resolve

        const rules = [
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
        ]

        const plugins = ([] as any[]).concat(
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
        )

        if (js.length + css.length > 0) {
          const compiler = webpack({
            entry,
            output: {
              path: output,
              filename: '[name].js',
            },
            mode,
            devtool: false,
            target: 'web',
            module: {
              rules,
            },
            resolve: {
              modules: [
                ...(nodeModulesPath ?? []),
                ...new Set(resolve?.modules ?? []),
              ],
              extensions: ['.ts', '.tsx', '.js', '.css'],
            },
            resolveLoader: {
              modules: [...(nodeModulesPath ?? [])],
            },
            plugins,
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

      async *writeFile(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const base = (command.base ?? '') as string
        const file = command.file as string

        const content = (command.content ?? '') as string

        await fs.writeFile(
          path.resolve(base, file),
          content,
          'utf-8'
        )
      },
    }
  }
}
