import { relative } from 'node:path'
import { type HookHandler, normalizePath, type Plugin, type ResolvedConfig } from 'vite'

type SolidTransform = HookHandler<NonNullable<Plugin['transform']>>

export function createSolidTransform(config: ResolvedConfig): SolidTransform {
  const hook = config.plugins.find((plugin) => plugin.name === 'solid')?.transform
  if (!hook) {
    throw new Error(
      'vite-plugin-svg-solid requires @solidjs/vite-plugin. Add solid() to plugins.',
    )
  }
  const transform = typeof hook === 'function' ? hook : hook.handler

  return async function (source, id, transformOptions) {
    // Borrow a JSX extension so the installed Solid plugin compiles this
    // module with the application's compiler, SSR settings, and refresh pass.
    const queryStart = id.indexOf('?')
    const jsxId =
      queryStart < 0
        ? `${id}.jsx`
        : `${id.slice(0, queryStart)}.jsx${id.slice(queryStart)}`
    if (this.environment.config.consumer === 'server' || transformOptions?.ssr) {
      // Solid's lazy/glob SSR lookup uses this export as a client manifest key.
      // Supply the real module ID before Solid sees the synthetic JSX filename.
      const moduleUrl = normalizePath(relative(config.root, id))
      source += `\nexport const $$moduleUrl = ${JSON.stringify(moduleUrl)};`
    }
    const result = await transform.call(this, source, jsxId, transformOptions)
    if (result == null) {
      this.error(
        `Solid skipped ${id}. Ensure its include/exclude filters accept .svg.jsx files.`,
      )
    }
    return result
  }
}
