import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/'
import stripIndent from 'strip-indent'

import { Resolver, RegistryOptions } from '../../registry'
import { Command } from '../../printer'

export const tagResolvers = (
  _options: RegistryOptions
): Record<string, Resolver> => {
  return {
    section: {
      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const content = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<section>{{{ data.content }}}</section>',
          type: 'inline',
          data: {
            content,
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
        const content = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<h1>{{{ data.content }}}</h1>',
          type: 'inline',
          data: {
            content,
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
        const content = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<h2>{{{ data.content }}}</h2>',
          type: 'inline',
          data: {
            content,
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
        const content = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<h3>{{{ data.content }}}</h3>',
          type: 'inline',
          data: {
            content,
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
        const content = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<b>{{{ data.content }}}</b>',
          type: 'inline',
          data: {
            content,
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
        const content = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<i>{{{ data.content }}}</i>',
          type: 'inline',
          data: {
            content,
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
        const content = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<u>{{{ data.content }}}<u>',
          type: 'inline',
          data: {
            content,
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
        const renderedChildNodes = yield {
          name: 'getBlockChildNodes',
          displayMode: true,
          index: 0,
        }

        for (const [
          index,
          renderedNode,
        ] of renderedChildNodes.entries()) {
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
        const content = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<ul>{{{ data.content }}}</ul>',
          data: {
            content,
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
        const content = yield {
          name: 'getBlock',
          index: 0,
        }
        yield {
          name: 'html',
          template: '<li>{{{ data.content }}}</li>',
          data: {
            content,
          },
        }
      },
    },

    code: {
      load: async function* (): AsyncGenerator<
        Command,
        any,
        any
      > {
        const state = yield {
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
        const params = yield {
          name: 'getParams',
        }
        const language = params[0]
        const textContent = yield {
          name: 'textContent',
          index: 0,
        }
        const code = Prism.highlight(
          stripIndent(textContent)
            .replace(/^\r?\n/, '')
            .replace(/\r?\n[\t ]+$/, ''),
          Prism.languages[language],
          language
        )
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
