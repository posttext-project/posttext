import Prism from 'prismjs'
import loadLanguages from 'prismjs/components'
import stripIndent from 'strip-indent'

import { Resolver, RegistryOptions } from '../../registry'
import { supportedLanguages } from './prism'
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
        const content = yield {
          name: 'getBlock',
          index: 0,
        }

        yield {
          name: 'html',
          template: '<p>{{{ data.content }}}</p>',
          data: {
            content,
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
      load: (): void => {
        loadLanguages(supportedLanguages)
      },

      resolve: async function* (): AsyncGenerator<
        Command,
        void,
        any
      > {
        const params = yield {
          name: 'getParams',
        }
        const language =
          params[0] &&
          supportedLanguages.indexOf(params[0]) !== -1
            ? params[0]
            : 'markdown'
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
