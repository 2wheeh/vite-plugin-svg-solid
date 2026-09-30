import { describe, expect, it } from 'vitest'
import { svgToComponent } from '../src/lib/component.js'

describe('SVG to JSX', () => {
  it('preserves XML values without interpreting braces as expressions', () => {
    const code = svgToComponent(
      '<svg data-label="&quot;{value}&quot;"><text>{literal} &amp; &lt;safe&gt;</text></svg>',
      'icon.svg',
    )
    expect(code).toContain('data-label={"\\"{value}\\""}')
    expect(code).toContain('{"{literal} & <safe>"}')
    expect(code).toContain(' {...props}')
  })

  it('preserves CDATA, SVG casing, namespaces, and whitespace', () => {
    const code = svgToComponent(
      '<?xml version="1.0"?><svg xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 10 10"><!-- comment --><style><![CDATA[path { fill: red; }]]></style><use xlink:href="#a"/><text xml:space="preserve"> a  b </text></svg>',
      'icon.svg',
    )
    expect(code).toContain('viewBox={"0 0 10 10"}')
    expect(code).toContain('xlink:href={"#a"}')
    expect(code).toContain('{"path { fill: red; }"}')
    expect(code).toContain('{" a  b "}')
    expect(code).not.toContain('comment')
    expect(code).not.toContain('<?xml')
  })

  it.each(['', '<html/>', '<svg><path></svg>', '<svg/><svg/>'])(
    'rejects invalid input: %s',
    (source) => {
      expect(() => svgToComponent(source, 'broken.svg')).toThrow()
    },
  )
})
