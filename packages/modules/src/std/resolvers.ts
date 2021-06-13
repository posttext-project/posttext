/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/'
import stripIndent from 'strip-indent'
import qrcode from 'qrcode'
import path from 'path'
import katex from 'katex'

import {
  Resolver,
  RegistryOptions,
  Command,
} from '@posttext/registry'
import { extractParagraphs } from '@posttext/ptlib'

const KATEX_STATE = Symbol('KatexState')
const CODE_BLOCK_STATE = Symbol('CodeBlockState')

export const TOC = Symbol('Toc')
export const tocDef = [
  null,
  'section',
  'subsection',
  'subsubsection',
]

export const tagResolvers = (
  _options: RegistryOptions
): Record<string, Resolver> => {
  return {
    __root__: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content = yield {
          name: 'getBlockInlines',
          transform: {
            ...extractParagraphs,
          },
        }

        yield {
          name: 'html',
          template: `{{{ data.content }}}`,
          data: {
            content,
          },
        }
      },
    },

    posttext: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const attrs: Record<string, string> = yield {
          name: 'getAttrs',
        }

        const title: string | undefined = attrs.title

        yield {
          name: 'metadata',
          metadata: {
            title,
          },
        }
      },
    },

    comment: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        /* pass */
      },
    },

    title: {
      resolve: async function* (): AsyncGenerator<
        Command,
        any,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<h1>{{{ data.content }}}</h1>',
          data: {
            content: content ?? '',
          },
        }
      },
    },

    section: {
      preload: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'send',
          topic: TOC,
          data: {
            tagName: 'section',
            content,
          },
        }
      },

      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<h2>{{{ data.content }}}</h2>',
          data: {
            content: content ?? '',
          },
        }
      },
    },

    subsection: {
      preload: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'send',
          topic: TOC,
          data: {
            tagName: 'subsection',
            content,
          },
        }
      },

      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<h3>{{{ data.content }}}</h3>',
          data: {
            content: content ?? '',
          },
        }
      },
    },

    subsubsection: {
      preload: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'send',
          topic: TOC,
          data: {
            tagName: 'subsubsection',
            content,
          },
        }
      },

      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<h4>{{{ data.content }}}</h4>',
          data: {
            content: content ?? '',
          },
        }
      },
    },

    bold: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<b>{{{ data.content }}}</b>',
          type: 'inline',
          data: {
            content: content?.replace(/\s\s\n/g, '<br>') ?? '',
          },
        }
      },
    },

    italic: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<i>{{{ data.content }}}</i>',
          type: 'inline',
          data: {
            content: content?.replace(/\s\s\n/g, '<br>') ?? '',
          },
        }
      },
    },

    underline: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<u>{{{ data.content }}}<u>',
          type: 'inline',
          data: {
            content: content?.replace(/\s\s\n/g, '<br>') ?? '',
          },
        }
      },
    },

    list: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<ul>{{{ data.content }}}</ul>',
          data: {
            content: content ?? '',
          },
        }
      },
    },

    item: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }
        yield {
          name: 'html',
          template: '<li>{{{ data.content }}}</li>',
          data: {
            content: content?.replace(/\s\s\n/g, '<br>') ?? '',
          },
        }
      },
    },

    code: {
      preload: async function* (): AsyncGenerator<
        Command,
        any,
        any
      > {
        const state: Record<string, any> = yield {
          name: 'getState',
          symbol: CODE_BLOCK_STATE,
        }
        if (!state.languagesLoaded) {
          state.languagesLoaded = true

          loadLanguages()

          yield {
            name: 'addDeps',
            deps: [
              {
                type: 'css',
                src: 'prismjs/themes/prism.css',
              },
            ],
          }
        }
      },

      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const params: string[] = yield {
          name: 'getParams',
        }
        const language: string =
          params[0] &&
          Object.keys(Prism.languages).indexOf(params[0])
            ? params[0]
            : 'text'

        const BEGIN_NEWLINE = /^\r?\n/
        const END_NEWLINE = /\r?\n[\t ]+$/

        const rawTextContent: string | undefined = yield {
          name: 'textContent',
          index: 0,
        }
        const textContent: string = rawTextContent
          ? stripIndent(rawTextContent)
              .replace(BEGIN_NEWLINE, '')
              .replace(END_NEWLINE, '')
          : ''

        const code: string =
          language !== 'text'
            ? Prism.highlight(
                textContent,
                Prism.languages[language],
                language
              )
            : textContent
        yield {
          name: 'html',
          template:
            '<pre><code class="language-{{ data.language }}">{{{ data.code }}}</code></pre>',
          data: {
            language,
            code,
          },
        }
      },
    },

    "code'": {
      preload: async function* (): AsyncGenerator<
        Command,
        any,
        any
      > {
        const state: Record<string, any> = yield {
          name: 'getState',
          symbol: CODE_BLOCK_STATE,
        }
        if (!state.languagesLoaded) {
          state.languagesLoaded = true

          loadLanguages()

          yield {
            name: 'addDeps',
            deps: [
              {
                type: 'css',
                src: 'prismjs/themes/prism.css',
              },
            ],
          }
        }
      },

      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const params: string[] = yield {
          name: 'getParams',
        }
        const language: string =
          params[0] &&
          Object.keys(Prism.languages).indexOf(params[0])
            ? params[0]
            : 'text'

        const BEGIN_NEWLINE = /^\r?\n/
        const END_NEWLINE = /\r?\n[\t ]+$/

        const rawTextContent: string | undefined = yield {
          name: 'textContent',
          index: 0,
        }
        const textContent: string = rawTextContent
          ? stripIndent(rawTextContent)
              .replace(BEGIN_NEWLINE, '')
              .replace(END_NEWLINE, '')
          : ''

        const code: string =
          language !== 'text'
            ? Prism.highlight(
                textContent,
                Prism.languages[language],
                language
              )
            : textContent
        yield {
          name: 'html',
          template:
            '<code class="language-{{ data.language }}">{{{ data.code }}}</code>',
          type: 'inline',
          data: {
            language,
            code,
          },
        }
      },
    },

    katex: {
      preload: async function* (): AsyncGenerator<
        Command,
        any,
        any
      > {
        const state: Record<string, any> = yield {
          name: 'getState',
          symbol: KATEX_STATE,
        }
        if (!state.katexLoaded) {
          state.katexLoaded = true

          yield {
            name: 'addDeps',
            deps: [
              {
                type: 'css',
                src: 'katex/dist/katex.css',
              },
            ],
          }
        }
      },

      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const rawTextContent: string | undefined = yield {
          name: 'textContent',
        }

        const content = katex.renderToString(rawTextContent, {
          throwOnError: false,
          displayMode: true,
        })

        yield {
          name: 'html',
          template: `{{{ data.content }}}`,
          data: {
            content,
          },
        }
      },
    },

    "katex'": {
      preload: async function* (): AsyncGenerator<
        Command,
        any,
        any
      > {
        const state: Record<string, any> = yield {
          name: 'getState',
          symbol: KATEX_STATE,
        }
        if (!state.katexLoaded) {
          state.katexLoaded = true

          yield {
            name: 'addDeps',
            deps: [
              {
                type: 'css',
                src: 'katex/dist/katex.css',
              },
            ],
          }
        }
      },

      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const rawTextContent: string | undefined = yield {
          name: 'textContent',
        }

        const content = katex.renderToString(rawTextContent, {
          throwOnError: false,
        })

        yield {
          name: 'html',
          template: `{{{ data.content }}}`,
          type: 'inline',
          data: {
            content,
          },
        }
      },
    },

    toc: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const tocItems: any[] = yield {
          name: 'receive',
          topic: TOC,
        }

        const stack: any[] = []

        stack.push({
          content: '',
          children: [],
          previous: [],
        })

        while (stack.length > 1 || tocItems.length) {
          let currentItem = stack.pop()

          const nextItem = tocItems.shift()
          const nextItemLevel = nextItem?.tagName
            ? tocDef.indexOf(nextItem.tagName)
            : -1

          if (nextItemLevel === stack.length) {
            const counter = stack
              .concat([currentItem])
              .slice(1)
              .map((item) => item.previous.length + 1)
              .join('.')

            const renderedItem = yield {
              name: 'html',
              template: `
                <li class="std_toc__item">
                  <span class="std_toc__number">{{ data.counter }}</span>
                  <span class="std_toc__text">{{ data.content }}</span>
                  {{#if data.children.length}}
                  <ul class="std_toc__list">
                    {{#each data.children}}
                      {{{ this }}}
                    {{/each}}
                  </ul>
                  {{/if}}
                </li>
              `,
              emit: false,
              data: {
                content: currentItem.content,
                children: currentItem.children,
                counter,
              },
            }
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
            const counter = stack
              .concat([currentItem])
              .slice(1)
              .map((item) => item.previous.length + 1)
              .join('.')

            if (nextItem) {
              tocItems.unshift(nextItem)
            }
            let parentItem = stack.pop()

            const renderedItem = yield {
              name: 'html',
              template: `
                <li class="std_toc__item">
                  <span class="std_toc__number">{{ data.counter }}</span>
                  <span class="std_toc__text">{{ data.content }}</span>
                  {{#if data.children.length}}
                  <ul class="std_toc__list">
                    {{#each data.children}}
                      {{{ this }}}
                    {{/each}}
                  </ul>
                  {{/if}}
                </li>
              `,
              emit: false,
              data: {
                content: currentItem.content,
                children: currentItem.children,
                counter,
              },
            }

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

        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: `
            <h2 class="std_toc__title">
              {{{ data.content }}}
            </h2>
            <ul class="std_toc__list">
              {{#each data.items}}
                {{{ this }}}
              {{/each}}
            </ul>
          `,
          data: {
            items: rootItem.children,
            content,
          },
        }
      },
    },

    blockquote: {
      resolve: async function* (): AsyncGenerator<
        Command,
        any,
        any
      > {
        const content = yield {
          name: 'getBlockInlines',
          transform: {
            ...extractParagraphs,
          },
        }

        yield {
          name: 'html',
          template: `
            <blockquote class="std_blockquote">
              {{{ data.content }}}
            </blockquote>
          `,
          data: {
            content,
          },
        }
      },
    },

    image: {
      resolve: async function* (): AsyncGenerator<
        Command,
        any,
        any
      > {
        const link: string | undefined = yield {
          name: 'textContent',
          index: 0,
        } ?? ''

        const alt: string | undefined = yield {
          name: 'textContent',
          index: 1,
        }

        if (!link) {
          return
        }

        const isUrl = link.match(/(^|^http:|^https:)\/\//)

        if (isUrl) {
          yield {
            name: 'html',
            template: `
              <div class="std_image">
                <img src="{{ data.link }}"{{#if data.alt}} alt="{{ data.alt }}"{{/if}}>
              </div>
            `,
            data: {
              link,
              alt,
            },
          }
        } else {
          const dest = yield {
            name: 'copyFile',
            src: link,
            dest: path.join('images', path.basename(link)),
          }

          yield {
            name: 'html',
            template: `
              <div class="std_image">
                <img src="{{ data.link }}"{{#if data.alt}} alt="{{ data.alt }}"{{/if}}>
              </div>
            `,
            data: {
              link: dest,
              alt,
            },
          }
        }
      },
    },

    qrcode: {
      resolve: async function* (): AsyncGenerator<
        Command,
        any,
        any
      > {
        const content: string | undefined = yield {
          name: 'textContent',
          index: 0,
        } ?? ''

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

        yield {
          name: 'html',
          template:
            '<div class="std_qrcode">{{{ data.content }}}</div>',
          data: {
            content: svg,
          },
        }
      },
    },

    box: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content = yield {
          name: 'getBlockInlines',
          transform: {
            ...extractParagraphs,
          },
        }

        yield {
          name: 'html',
          template: `
            <div class="std_box">
              {{{ data.content }}}
            </div>
          `,
          data: {
            content,
          },
        }
      },
    },
  }
}
