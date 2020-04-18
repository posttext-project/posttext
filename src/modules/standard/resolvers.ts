import Prism from 'prismjs'
import loadLanguages from 'prismjs/components'

import { Resolver, TagInput } from '../../generator/resolver'
import { supportedLanguages } from '../../generator/prism'

export const tagResolvers: Record<string, Resolver> = {
  section: {
    resolve: () => ({
      name: 'html',
      template: '<section>{{ textContent }}</section>',
      data: {
        name: 'textContent',
        offset: 0,
        transform: (textContent: string) => ({
          textContent
        })
      }
    })
  },

  title: {
    resolve: () => ({
      name: 'html',
      template: '<h1>{{ textContent }}</h1>',
      data: {
        name: 'textContent',
        offset: 0,
        transform: (textContent: string) => ({
          textContent
        })
      }
    })
  },

  subtitle: {
    resolve: () => ({
      name: 'html',
      template: '<h2>{{ textContent }}</h2>',
      data: {
        name: 'textContent',
        offset: 0,
        transform: (textContent: string) => ({
          textContent
        })
      }
    })
  },

  subsubtitle: {
    resolve: () => ({
      name: 'html',
      template: '<h3>{{ textContent }}</h3>',
      data: {
        name: 'textContent',
        offset: 0,
        transform: (textContent: string) => ({
          textContent
        })
      }
    })
  },

  bold: {
    resolve: () => ({
      name: 'html',
      template: '<b>{{ textContent }}</b>',
      data: {
        name: 'textContent',
        offset: 0,
        transform: (textContent: string) => ({
          textContent
        })
      }
    })
  },

  italic: {
    resolve: () => ({
      name: 'html',
      template: '<i>{{ textContent }}</i>',
      data: {
        name: 'textContent',
        offset: 0,
        transform: (textContent: string) => ({
          textContent
        })
      }
    })
  },

  underline: {
    resolve: () => ({
      name: 'html',
      template: '<u>{{ textContent }}</u>',
      data: {
        name: 'textContent',
        offset: 0,
        transform: (textContent: string) => ({
          textContent
        })
      }
    })
  },

  paragraph: {
    resolve: () => ({
      name: 'html',
      template: '<p>{{ textContent }}</p>',
      data: {
        name: 'textContent',
        offset: 0,
        transform: (textContent: string) => ({
          textContent
        })
      }
    })
  },

  list: {
    resolve: () => ({
      name: 'html',
      template: '<ul>{{ content }}</ul>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({ content })
      }
    })
  },

  item: {
    resolve: () => ({
      name: 'html',
      template: '<li>{{ content }}</li>',
      data: {
        name: 'getBlock',
        offset: 0,
        transform: (content: string) => ({ content })
      }
    })
  },

  code: {
    load: () => {
      loadLanguages(supportedLanguages)
    },

    resolve: () => ({
      name: 'html',
      template: `
          <pre class="language-{{ language }}">
            <code>{{ code }}</code>
          </pre>
        `,
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
                  : 'text'
            })
          },
          {
            name: 'textContent',
            offset: 0,
            transform: (textContent: string) => ({
              textContent
            })
          }
        ],
        transform: ({ language, textContent }: any) => ({
          code: Prism.highlight(
            textContent,
            Prism.languages[language],
            language
          )
        })
      }
    })
  }
}
