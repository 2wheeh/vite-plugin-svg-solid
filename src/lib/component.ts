import { DOMParser, type Element, type Node } from '@xmldom/xmldom'

function serialize(node: Node, root = false): string {
  switch (node.nodeType) {
    case 1: {
      const element = node as Element
      const attributes = Array.from(
        element.attributes,
        (attribute) => ` ${attribute.name}={${JSON.stringify(attribute.value)}}`,
      ).join('')
      const children = Array.from(element.childNodes, (child) => serialize(child)).join(
        '',
      )
      return `<${element.tagName}${attributes}${root ? ' {...props}' : ''}>${children}</${element.tagName}>`
    }
    case 3:
    case 4:
      return node.nodeValue ? `{${JSON.stringify(node.nodeValue)}}` : ''
    default:
      // XML declarations, doctypes and comments are not JSX content.
      return ''
  }
}

export function svgToComponent(source: string, filename: string): string {
  const document = new DOMParser({
    onError(level, message) {
      throw new Error(`${filename}: ${level}: ${message}`)
    },
  }).parseFromString(source, 'image/svg+xml')
  const root = document.documentElement
  if (root?.tagName !== 'svg') {
    throw new Error(`${filename}: Expected an <svg> root element`)
  }
  return `export default function SvgComponent(props = {}) { return ${serialize(root, true)}; }`
}
