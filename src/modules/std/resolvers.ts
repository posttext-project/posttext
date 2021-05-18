/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/'
import stripIndent from 'strip-indent'
import qrcode from 'qrcode'
import path from 'path'

import { Resolver, RegistryOptions } from '../../registry'
import { Command } from '../../printer'

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
          template: '<h1>{{{ data.content }}}</h1>',
          type: 'inline',
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
          template: '<h2>{{{ data.content }}}</h2>',
          type: 'inline',
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
          template: '<h3>{{{ data.content }}}</h3>',
          type: 'inline',
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

    paragraph: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const childNodes: any[] | undefined = yield {
          name: 'getBlockChildNodes',
          displayMode: true,
          index: 0,
        }

        let paragraph: string[] = []
        for (const childNode of childNodes ?? []) {
          switch (childNode.type) {
            case 'text': {
              const chunks = childNode.content
                .split(/(\n[^\S\n]*){2,}/)
                .map((chunk) =>
                  chunk.replace(/\s\s\n/g, '<br>')
                )

              for (const chunk of chunks.slice(0, -1)) {
                paragraph.push(chunk)

                const content = paragraph.join('')
                if (!content.match(/^\s*$/g)) {
                  yield {
                    name: 'html',
                    template: '<p>{{{ data.content }}}</p>',
                    data: {
                      content,
                    },
                  }
                }

                paragraph = []
              }

              if (chunks.length) {
                const lastChunk = chunks.slice(-1)[0]

                paragraph.push(lastChunk)
              }

              break
            }

            case 'inline': {
              paragraph.push(childNode.content)

              break
            }

            default: {
              if (paragraph.length !== 0) {
                const content = paragraph.join('')
                if (!content.match(/^\s*$/g)) {
                  yield {
                    name: 'html',
                    template: '<p>{{{ data.content }}}</p>',
                    data: {
                      content,
                    },
                  }
                }

                paragraph = []
              }

              yield {
                name: 'html',
                template: '{{{ data.content }}}',
                data: {
                  content: childNode.content,
                },
              }
            }
          }
        }

        if (paragraph.length !== 0) {
          const content = paragraph.join('')
          if (!content.match(/^\s*$/g)) {
            yield {
              name: 'html',
              template: '<p>{{{ data.content }}}</p>',
              data: {
                content,
              },
            }
          }
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
        }
        if (!state.languagesLoaded) {
          loadLanguages()

          state.languagesLoaded = true

          yield {
            name: 'addDeps',
            deps: [
              {
                type: 'css',
                id: 'prismjs/themes/prism.css',
                src: 'prismjs/themes/prism.css',
                version: '^1.21.0',
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
            '<pre class="language-{{ data.language }}"><code>{{{ data.code }}}</code></pre>',
          data: {
            language,
            code,
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
            <h1 class="std_toc__title">
              {{{ data.content }}}
            </h1>
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
            text: async function* (
              textContent: string
            ): AsyncGenerator<Command, any, any> {
              const paragraphs = textContent
                .split(/(?:\n\r?[ ]?)+/)
                .filter((chunk) => !/^\s+$/.test(chunk))

              for (const [
                index,
                paragraph,
              ] of paragraphs.entries()) {
                yield {
                  name: 'html',
                  template: `{{{ data.content }}}`,
                  type: 'text',
                  data: {
                    content: paragraph,
                  },
                }

                if (index !== paragraphs.length - 1) {
                  yield {
                    name: 'html',
                    type: 'hard-break',
                  }
                }
              }
            },
            inlines: async function* (
              content: string
            ): AsyncGenerator<Command, any, any> {
              yield {
                name: 'html',
                template: `
                  <p>
                    {{{ data.content }}}
                  </p>
                `,
                data: {
                  content,
                },
              }
            },
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
        const content: string | undefined = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<section>{{{ data.content }}}</section>',
          type: 'inline',
          data: {
            content: content ?? '',
          },
        }
      },
    },
  }
}
