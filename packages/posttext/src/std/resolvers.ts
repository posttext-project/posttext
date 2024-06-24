/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/index.js'
import stripIndent from 'strip-indent'
import qrcode from 'qrcode'
import katex from 'katex'

import { DataResolverContext, TagDefinition } from '../tag'
import { TagResolverContext } from '../tag'
import { ModuleDefinition } from '../module'

const KATEX_STATE = Symbol('KatexState')
const CODE_BLOCK_STATE = Symbol('CodeBlockState')

export const TOC = Symbol('Toc')
export const tocDef = [
  null,
  'section',
  'subsection',
  'subsubsection',
]

function createTagDefinitions(): Record<string, TagDefinition> {
  return {
    posttext: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const writer = context.helpers.getHelper('writer')
        const title = context.attributes.title

        await writer.metadata.add({
          title,
        })

        return ''
      },
    },

    comment: {
      tag: async (): Promise<string> => {
        return ''
      },
    },

    title: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const content = await context.blocks
          .get(0)
          .renderToString()

        return `<h1>${content}</h1>`
      },
    },

    section: {
      data: {
        [TOC]: async (
          context: DataResolverContext
        ): Promise<any> => {
          const content = await context.blocks
            .get(0)
            .renderToString()

          return {
            type: 'section',
            content,
          }
        },
      },

      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const content = await context.blocks
          .get(0)
          .renderToString()

        return `<h2>${content}</h2>`
      },
    },

    subsection: {
      data: {
        [TOC]: async (
          context: DataResolverContext
        ): Promise<any> => {
          const content = await context.blocks
            .get(0)
            .renderToString()

          return {
            type: 'subsection',
            content,
          }
        },
      },

      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const content = await context.blocks
          .get(0)
          .renderToString()

        return `<h3>${content}</h3>`
      },
    },

    subsubsection: {
      data: {
        [TOC]: async (
          context: DataResolverContext
        ): Promise<any> => {
          const content = await context.blocks
            .get(0)
            .renderToString()

          return {
            type: 'subsubsection',
            content,
          }
        },
      },

      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const content = await context.blocks
          .get(0)
          .renderToString()

        return `<h4>${content}</h4>`
      },
    },

    bold: {
      data: {
        [TOC]: async (
          context: DataResolverContext
        ): Promise<any> => {
          const content = await context.blocks
            .get(0)
            .renderToString()

          return {
            type: 'bold',
            content,
          }
        },
      },

      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const content = await context.blocks
          .get(0)
          .renderToString()

        return `<b>${
          content?.replace(/\s\s\n/g, '<br>') ?? ''
        }</b>`
      },
    },

    italic: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const content = await context.blocks
          .get(0)
          .renderToString()

        return `<i>${
          content?.replace(/\s\s\n/g, '<br>') ?? ''
        }</i>`
      },
    },

    underline: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const content = await context.blocks
          .get(0)
          .renderToString()

        return `<u>${
          content?.replace(/\s\s\n/g, '<br>') ?? ''
        }</u>`
      },
    },

    list: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const content = await context.blocks
          .get(0)
          .renderToString()

        return `<ul>${content}</ul>`
      },
    },

    item: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const content: string | undefined = await context.blocks
          .get(0)
          .renderToString()

        return `<li>${
          content?.replace(/\s\s\n/g, '<br>') ?? ''
        }</li>`
      },
    },

    code: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const writer = context.helpers.getHelper('writer')
        const languageLoaded =
          context.state[CODE_BLOCK_STATE]?.languagesLoaded ??
          false
        if (!languageLoaded) {
          context.state[CODE_BLOCK_STATE] = {
            languagesLoaded: true,
          }

          loadLanguages()

          writer.addDependency({
            type: 'css',
            src: 'prismjs/themes/prism.css',
          })
        }

        const language =
          context.arguments.length > 0 &&
          Object.keys(Prism.languages).indexOf(
            context.arguments[0]
          )
            ? context.arguments[0]
            : 'text'

        const BEGIN_NEWLINE = /^\r?\n/
        const END_NEWLINE = /\r?\n[\t ]+$/

        const content = await context.blocks
          .get(0)
          .renderToString()
        const strippedContent: string = content
          ? stripIndent(content)
              .replace(BEGIN_NEWLINE, '')
              .replace(END_NEWLINE, '')
          : ''

        const code: string =
          language !== 'text'
            ? Prism.highlight(
                strippedContent,
                Prism.languages[language],
                language
              )
            : strippedContent

        return `<pre class="std_code"><code class="language-${language}">${code}</code></pre>`
      },
    },

    "code'": {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const writer = context.helpers.getHelper('writer')
        const languageLoaded =
          context.state[CODE_BLOCK_STATE]?.languagesLoaded ??
          false
        if (!languageLoaded) {
          context.state[CODE_BLOCK_STATE] = {
            languagesLoaded: true,
          }

          loadLanguages()

          writer.addDependency({
            type: 'css',
            src: 'prismjs/themes/prism.css',
          })
        }

        const language =
          context.arguments.length > 0 &&
          Object.keys(Prism.languages).indexOf(
            context.arguments[0]
          )
            ? context.arguments[0]
            : 'text'

        const BEGIN_NEWLINE = /^\r?\n/
        const END_NEWLINE = /\r?\n[\t ]+$/

        const content = await context.blocks
          .get(0)
          .renderToString()
        const strippedContent: string = content
          ? stripIndent(content)
              .replace(BEGIN_NEWLINE, '')
              .replace(END_NEWLINE, '')
          : ''

        const code: string =
          language !== 'text'
            ? Prism.highlight(
                strippedContent,
                Prism.languages[language],
                language
              )
            : strippedContent

        return `<code class="std_code language-${language}">${code}</code>`
      },
    },

    katex: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const writer = context.helpers.getHelper('writer')
        const katexLoaded =
          context.state[KATEX_STATE]?.katexLoaded ?? false
        if (!katexLoaded) {
          context.state[KATEX_STATE] = {
            katexLoaded: true,
          }

          await writer.addDependency({
            type: 'css',
            src: 'katex/dist/katex.css',
          })
        }

        const rawContent = await context.blocks
          .get(0)
          .renderToString()

        // TODO: Handle errors
        const content = katex.renderToString(rawContent, {
          throwOnError: false,
          displayMode: true,
        })

        return content
      },
    },

    "katex'": {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const writer = context.helpers.getHelper('writer')
        const katexLoaded =
          context.state[KATEX_STATE]?.katexLoaded ?? false
        if (!katexLoaded) {
          context.state[KATEX_STATE] = {
            katexLoaded: true,
          }

          await writer.addDependency({
            type: 'css',
            src: 'katex/dist/katex.css',
          })
        }

        const rawContent = await context.blocks
          .get(0)
          .renderToString()

        // TODO: Handle errors
        const content = katex.renderToString(rawContent, {
          throwOnError: false,
          displayMode: true,
        })

        return content
      },
    },

    toc: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const tocItems = await context.document.query(TOC)

        const stack: any[] = []

        stack.push({
          content: '',
          children: [],
          previous: [],
        })

        while (stack.length > 1 || tocItems.length) {
          let currentItem = stack.pop()

          const nextItem = tocItems.shift()
          const nextItemLevel = nextItem?.type
            ? tocDef.indexOf(nextItem.type)
            : -1

          if (nextItemLevel === stack.length) {
            const index = stack
              .concat([currentItem])
              .slice(1)
              .map((item) => item.previous.length + 1)
              .join('.')

            const renderedItem = `
              <li class="std_toc__item">
                <span class="std_toc__number">${index}</span>
                <span class="std_toc__text">${
                  currentItem.content
                }</span>
                ${
                  currentItem.children.length
                    ? `<ul class="std_toc__list">${currentItem.children.join(
                        '\n'
                      )}</ul>`
                    : ''
                }
                {{/if}}
              </li>
            `

            currentItem = {
              content: nextItem.content,
              children: [],
              previous: currentItem.previous.concat([
                renderedItem,
              ]),
            }

            stack.push(currentItem)
          } else if (nextItemLevel > stack.length) {
            stack.push(currentItem)

            while (nextItemLevel > stack.length) {
              stack.push({
                content: '',
                children: [],
                previous: [],
              })
            }

            stack.push({
              content: nextItem.content,
              children: [],
              previous: [],
            })
          } else {
            const index = stack
              .concat([currentItem])
              .slice(1)
              .map((item) => item.previous.length + 1)
              .join('.')

            if (nextItem) {
              tocItems.unshift(nextItem)
            }
            let parentItem = stack.pop()

            const renderedItem = `
              <li class="std_toc__item">
                <span class="std_toc__number">${index}</span>
                <span class="std_toc__text">${
                  currentItem.content
                }</span>
                {{#if data.children.length}}
                <ul class="std_toc__list">
                  ${
                    currentItem.children.length
                      ? currentItem.children.join('\n')
                      : ''
                  }
                </ul>
                {{/if}}
              </li>
            `

            parentItem = {
              content: parentItem.content,
              children: currentItem.previous.concat([
                renderedItem,
              ]),
              previous: parentItem.previous,
            }
            stack.push(parentItem)
          }
        }

        const rootItem = stack.pop()
        const content = await context.blocks
          .get(0)
          .renderToString()

        return `
            <h2 class="std_toc__title">
              ${content}
            </h2>
            <ul class="std_toc__list">
              ${rootItem.children.join('\n')}
            </ul>
          `
      },
    },

    blockquote: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const content = await context.blocks
          .get(0)
          .renderToString()

        return `
            <blockquote class="std_blockquote">
              ${content}
            </blockquote>
          `
      },
    },

    image: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const writer = context.helpers.getHelper('writer')
        const link = await context.blocks
          .get(0)
          .renderToString()
        const alt = await context.blocks.get(1).renderToString()

        if (!link) {
          return ''
        }

        const isUrl = link.match(/(^|^http:|^https:)\/\//)

        if (isUrl) {
          return `
            <div class="std_image">
              <img src="${link}"${alt ? ` alt="${alt}"` : ''}>
            </div>
          `
        } else {
          await writer.copyFile(
            link,
            `images/${link.split(/[\\/]/).slice(-1)[0]}`
          )

          return `
            <div class="std_image">
              <img src="images/${
                link.split(/[\\/]/).slice(-1)[0]
              }"${alt ? ` alt="${alt}"` : ''}>
            </div>
          `
        }
      },
    },

    qrcode: {
      tag: async (
        context: TagResolverContext
      ): Promise<string> => {
        const content = await context.blocks
          .get(0)
          .renderToString()

        const svg = await new Promise((resolve, reject) => {
          qrcode.toString(
            content,
            {
              type: 'svg',
              margin: 1,
            },
            (err, text) => {
              if (err) {
                reject(err)
              }

              resolve(text)
            }
          )
        })

        return `
          <div class="std_qrcode">
            ${svg}
          </div>
        `
      },
    },
  }
}

export default {
  name: 'std',
  tagDefinitionsFactory: createTagDefinitions,
} as ModuleDefinition
