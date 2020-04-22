import Prism from 'prismjs'
import loadLanguages from 'prismjs/components'
import stripIndent from 'strip-indent'

import { Resolver, TagInput } from '../../generator/resolver'
import { supportedLanguages } from './prism'

export const tagResolvers: Record<string, Resolver> = {
  section: {
    resolve: () => ({
      name: 'html',
      template: '<section>{{{ content }}}</section>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({
          content,
        }),
      },
    }),
  },

  title: {
    resolve: () => ({
      name: 'html',
      template: '<h1>{{{ content }}}</h1>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({
          content,
        }),
      },
    }),
  },

  subtitle: {
    resolve: () => ({
      name: 'html',
      template: '<h2>{{{ content }}}</h2>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({
          content,
        }),
      },
    }),
  },

  subsubtitle: {
    resolve: () => ({
      name: 'html',
      template: '<h3>{{{ content }}}</h3>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({
          content,
        }),
      },
    }),
  },

  bold: {
    resolve: () => ({
      name: 'html',
      template: '<b>{{{ content }}}</b>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({
          content,
        }),
      },
    }),
  },

  italic: {
    resolve: () => ({
      name: 'html',
      template: '<i>{{{ content }}}</i>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({
          content,
        }),
      },
    }),
  },

  underline: {
    resolve: () => ({
      name: 'html',
      template: '<u>{{{ content }}}</u>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({
          content,
        }),
      },
    }),
  },

  paragraph: {
    resolve: () => ({
      name: 'html',
      template: '<p>{{{ content }}}</p>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({
          content,
        }),
      },
    }),
  },

  list: {
    resolve: () => ({
      name: 'html',
      template: '<ul>{{{ content }}}</ul>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({ content }),
      },
    }),
  },

  item: {
    resolve: () => ({
      name: 'html',
      template: '<li>{{{ content }}}</li>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({ content }),
      },
    }),
  },

  code: {
    load: () => {
      loadLanguages(supportedLanguages)
    },

    resolve: () => ({
      name: 'html',
      template:
        '<pre class="language-{{ language }}"><code>{{{ code }}}</code></pre>',
      data: {
        name: 'compose',
        reduce: [
          {
            name: 'getAttrs',
            transform: ({ params }: TagInput) => ({
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
            transform: (textContent: string) => ({
              textContent,
            }),
          },
        ],
        transform: ({ language, textContent }: any) => {
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
