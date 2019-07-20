import { Package, Scope } from '../registry'
import { createHtmlElement } from '../html'
import { createTextNode, nodesToString } from '../fmt'
import { TagNode, TextNode } from '../parser'

const pkg = Package.create()

pkg.defineTags({
  use(tagNode: TagNode, scope: Scope): false {
    if (tagNode.body && tagNode.body[0]) {
      const pkgKey = nodesToString(tagNode.body[0].body)

      scope.usePackage(pkgKey)
    }

    return false
  },

  import(tagNode: TagNode, scope: Scope): false {
    if (tagNode.body && tagNode.body[0]) {
      const pkgKey = nodesToString(tagNode.body[0].body)

      scope.importPackage(pkgKey)
    }

    return false
  },

  tableofcontents(tagNode: TagNode, scope: Scope): TagNode {
    return tagNode
  },

  section(tagNode: TagNode, scope: Scope): TagNode {
    return createHtmlElement(
      'h1',
      tagNode.attrs,
      scope.resolve(
        tagNode.body && tagNode.body[0] && tagNode.body[0].body
      )
    )
  },

  subsection(tagNode: TagNode, scope: Scope): TagNode {
    return createHtmlElement(
      'h2',
      tagNode.attrs,
      scope.resolve(
        tagNode.body && tagNode.body[0] && tagNode.body[0].body
      )
    )
  },

  subsubsection(tagNode: TagNode, scope: Scope): TagNode {
    return createHtmlElement(
      'h3',
      tagNode.attrs,
      scope.resolve(
        tagNode.body && tagNode.body[0] && tagNode.body[0].body
      )
    )
  },

  p(tagNode: TagNode, scope: Scope): TagNode {
    return createHtmlElement(
      'p',
      tagNode.attrs,
      scope.resolve(
        tagNode.body && tagNode.body[0] && tagNode.body[0].body
      )
    )
  },

  bold(tagNode: TagNode, scope: Scope): TagNode {
    return createHtmlElement(
      'b',
      tagNode.attrs,
      scope.resolve(
        tagNode.body && tagNode.body[0] && tagNode.body[0].body
      )
    )
  },

  italic(tagNode: TagNode, scope: Scope): TagNode {
    return createHtmlElement(
      'i',
      tagNode.attrs,
      scope.resolve(
        tagNode.body && tagNode.body[0] && tagNode.body[0].body
      )
    )
  },

  s(tagNode: TagNode): TextNode | false {
    const count =
      parseInt(
        tagNode.params &&
          tagNode.params[0] &&
          tagNode.params[0].value
      ) || 0

    return count
      ? createTextNode('&nbsp;'.repeat(count))
      : false
  }
})

export { pkg }
