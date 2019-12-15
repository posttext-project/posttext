import { Package, Scope } from '../registry'
import { createHtmlElement } from '../html'
import { nodesToString } from '../fmt'
import { TagNode, BlockChildNode, DocumentNode } from '../parser'
import { createTextNode, createDocumentNode } from '../builder'

export default function(pkg: Package) {
  pkg.defineTags({
    *use(
      tagNode: TagNode,
      scope: Scope
    ): IterableIterator<BlockChildNode> {
      if (tagNode.body && tagNode.body[0]) {
        const pkgKey = nodesToString(tagNode.body[0].body)

        scope.usePackage(pkgKey)
      }
    },

    *import(
      tagNode: TagNode,
      scope: Scope
    ): IterableIterator<BlockChildNode> {
      if (tagNode.body && tagNode.body[0]) {
        const pkgKey = nodesToString(tagNode.body[0].body)

        scope.importPackage(pkgKey)
      }
    },

    *tableofcontents(tagNode: TagNode, scope: Scope) {
      yield tagNode
    },

    *section(tagNode: TagNode, scope: Scope) {
      yield createHtmlElement(
        'h1',
        tagNode.attrs,
        tagNode.body &&
          tagNode.body[0] &&
          tagNode.body[0].body
            .map(
              childNode =>
                <BlockChildNode[]>(
                  Array.from(scope.resolve(childNode))
                )
            )
            .reduce((prev, next) => prev.concat(next), [])
      )
    },

    *subsection(tagNode: TagNode, scope: Scope) {
      yield createHtmlElement(
        'h2',
        tagNode.attrs,
        tagNode.body && tagNode.body[0] && tagNode.body[0].body
      )
    },

    *subsubsection(tagNode: TagNode, scope: Scope) {
      yield createHtmlElement(
        'h3',
        tagNode.attrs,
        tagNode.body &&
          tagNode.body[0] &&
          scope.resolveTags(tagNode.body[0].body)
      )
    },

    *p(tagNode: TagNode, scope: Scope) {
      yield createHtmlElement(
        'p',
        tagNode.attrs,
        tagNode.body &&
          tagNode.body[0] &&
          scope.resolveTags(tagNode.body[0].body)
      )
    },

    *bold(tagNode: TagNode, scope: Scope) {
      yield createHtmlElement(
        'b',
        tagNode.attrs,
        tagNode.body &&
          tagNode.body[0] &&
          scope.resolveTags(tagNode.body[0].body)
      )
    },

    *italic(tagNode: TagNode, scope: Scope) {
      yield createHtmlElement(
        'i',
        tagNode.attrs,
        tagNode.body &&
          tagNode.body[0] &&
          scope.resolveTags(tagNode.body[0].body)
      )
    },

    *s(tagNode: TagNode) {
      const count =
        parseInt(
          tagNode.params &&
            tagNode.params[0] &&
            tagNode.params[0]
        ) || 0

      if (count) {
        yield createTextNode('&nbsp;'.repeat(count))
      }
    }
  })

  return pkg
}
