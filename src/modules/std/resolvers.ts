/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/'
import stripIndent from 'strip-indent'

import { Resolver, RegistryOptions } from '../../registry'
import { Command } from '../../printer'

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

    section: {
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

    title: {
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

    subtitle: {
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

    subsubtitle: {
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
            content: content ?? '',
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
            content: content ?? '',
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
            content: content ?? '',
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
        const renderedChildNodes: string[] | undefined = yield {
          name: 'getBlockChildNodes',
          displayMode: true,
          index: 0,
        }

        for (const [index, renderedNode] of (
          renderedChildNodes ?? []
        ).entries()) {
          if (renderedNode.match(/$\s+^/)) {
            continue
          }

          if (index % 2 === 0) {
            yield {
              name: 'html',
              template: '<p>{{{ data.content }}}</p>',
              type: 'inline',
              data: {
                content: renderedNode,
              },
            }
          } else {
            yield {
              name: 'html',
              template: '{{{ data.content }}}',
              data: {
                content: renderedNode,
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
            content: content ?? '',
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
  }
}
