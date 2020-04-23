import Prism from 'prismjs'
import loadLanguages from 'prismjs/components'
import stripIndent from 'strip-indent'

import { Resolver, TagInput } from '../../generator/resolver'
import { supportedLanguages } from './prism'
import { Command } from '../../printer'

export const tagResolvers: Record<string, Resolver> = {
  section: {
    resolve: (): Command => ({
      name: 'html',
      template: '<section>{{{ content }}}</section>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string): Record<string, any> => ({
          content,
        }),
      },
    }),
  },

  title: {
    resolve: (): Command => ({
      name: 'html',
      template: '<h1>{{{ content }}}</h1>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string): Record<string, any> => ({
          content,
        }),
      },
    }),
  },

  subtitle: {
    resolve: (): Command => ({
      name: 'html',
      template: '<h2>{{{ content }}}</h2>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string): Record<string, any> => ({
          content,
        }),
      },
    }),
  },

  subsubtitle: {
    resolve: (): Command => ({
      name: 'html',
      template: '<h3>{{{ content }}}</h3>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string): Record<string, any> => ({
          content,
        }),
      },
    }),
  },

  bold: {
    resolve: (): Command => ({
      name: 'html',
      template: '<b>{{{ content }}}</b>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string): Record<string, any> => ({
          content,
        }),
      },
    }),
  },

  italic: {
    resolve: (): Command => ({
      name: 'html',
      template: '<i>{{{ content }}}</i>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string): Record<string, any> => ({
          content,
        }),
      },
    }),
  },

  underline: {
    resolve: (): Command => ({
      name: 'html',
      template: '<u>{{{ content }}}</u>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string): Record<string, any> => ({
          content,
        }),
      },
    }),
  },

  paragraph: {
    resolve: (): Command => ({
      name: 'html',
      template: '<p>{{{ content }}}</p>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string): Record<string, any> => ({
          content,
        }),
      },
    }),
  },

  list: {
    resolve: (): Command => ({
      name: 'html',
      template: '<ul>{{{ content }}}</ul>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string): Record<string, any> => ({
          content,
        }),
      },
    }),
  },

  item: {
    resolve: (): Command => ({
      name: 'html',
      template: '<li>{{{ content }}}</li>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string): Record<string, any> => ({
          content,
        }),
      },
    }),
  },

  code: {
    load: (): void => {
      loadLanguages(supportedLanguages)
    },

    resolve: (): Command => ({
      name: 'html',
      template:
        '<pre class="language-{{ language }}"><code>{{{ code }}}</code></pre>',
      data: {
        name: 'compose',
        reduce: [
          {
            name: 'getAttrs',
            transform: ({
              params,
            }: TagInput): Record<string, any> => ({
              language:
                params[0] &&
                supportedLanguages.indexOf(params[0]) !== -1
                  ? params[0]
                  : 'markdown',
            }),
          },
          {
            name: 'textContent',
            offset: 0,
            transform: (
              textContent: string
            ): Record<string, any> => ({
              textContent,
            }),
          },
        ],
        transform: ({
          language,
          textContent,
        }: Record<string, any>): Record<string, any> => {
          return {
            code: Prism.highlight(
              stripIndent(textContent)
                .replace(/^\r?\n/, '')
                .replace(/\r?\n[\t ]+$/, ''),
              Prism.languages[language],
              language
            ),
          }
        },
      },
    }),
  },
}
