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
          template: 'getBlock',
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
          template: '<h1>{{{ content }}}</h1>',
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
          template: '<h2>{{{ content }}}</h2>',
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
          template: '<h3>{{{ content }}}</h3>',
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
          template: '<b>{{{ content }}}</b>',
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
          template: '<i>{{{ content }}}</i>',
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
          template: '<u>{{{ content }}}<u>',
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
          template: '<p>{{{ content }}}</p>',
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
          template: '<ul>{{{ content }}}</ul>',
          data: content,
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
          template: '<li>{{{ content }}}</li>',
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
            '<pre class="language-{{ language }}"><code>{{{ code }}}</code></pre>',
          data: {
            language,
            code,
          },
        }
      },
    },
  }
}
