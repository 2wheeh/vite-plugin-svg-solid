import { readFile } from 'node:fs/promises'
import type { Config as SvgoConfig } from 'svgo'
import type { FilterPattern, Plugin } from 'vite'
import { svgToComponent } from './lib/component.js'
import { createSvgFilter } from './lib/filter.js'
import { optimizeSvg } from './lib/optimize.js'
import { createSolidTransform } from './lib/solid.js'

export interface SvgsOptions {
  /** Filter SVG component module IDs, including their query strings. */
  include?: FilterPattern
  exclude?: FilterPattern
  /** Disable optimization, or provide an explicit SVGO configuration. */
  svgo?: boolean | SvgoConfig
}

/** Import `icon.svg?solid` as a Solid 2 component. Requires `@solidjs/vite-plugin`. */
export default function svgs(options: SvgsOptions = {}): Plugin {
  const matches = createSvgFilter(options.include, options.exclude)
  let transformSolid: ReturnType<typeof createSolidTransform> | undefined

  return {
    name: 'vite-plugin-svgs',
    enforce: 'pre',
    configResolved(config) {
      transformSolid = createSolidTransform(config)
    },
    async load(id) {
      if (!matches(id)) return
      const filename = id.split('?', 1)[0] as string
      this.addWatchFile(filename)
      const source = optimizeSvg(await readFile(filename, 'utf8'), filename, options.svgo)
      return { code: svgToComponent(source, filename), map: null }
    },
    async transform(source, id, transformOptions) {
      if (!matches(id)) return
      return transformSolid?.call(this, source, id, transformOptions)
    },
  }
}
