import { fileURLToPath } from 'node:url'
import { createServer, type ViteDevServer } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'
import svgs from '../src/index.js'

const servers: ViteDevServer[] = []
afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()))
})

async function load(query: string, options = {}) {
  const server = await createServer({
    configFile: false,
    logLevel: 'silent',
    plugins: [svgs(options), { name: 'solid', transform: () => null }],
    server: { middlewareMode: true, watch: null },
  })
  servers.push(server)
  return server.environments.client.pluginContainer.load(
    `${fileURLToPath(new URL('./app/icon.svg', import.meta.url))}${query}`,
  )
}

describe('component selection', () => {
  it('loads SVG components and preserves viewBox', async () => {
    const result = await load('?solid')
    expect(result).toHaveProperty('code', expect.stringContaining('SvgComponent'))
    expect(result).toHaveProperty('code', expect.stringContaining('viewBox'))
  })
  it('recognizes the query flag among other parameters', async () => {
    expect(await load('?v=1&solid')).toHaveProperty(
      'code',
      expect.stringContaining('SvgComponent'),
    )
  })
  it.each(['', '?raw', '?url', '?solid&raw', '?solid&url'])(
    'preserves Vite asset mode %s',
    async (query) => {
      expect(JSON.stringify(await load(query))).not.toContain('SvgComponent')
    },
  )
  it('supports disabling optimization', async () => {
    expect(await load('?solid', { svgo: false })).toHaveProperty(
      'code',
      expect.stringContaining('Original icon'),
    )
  })
  it('allows a custom include and applies exclude', async () => {
    expect(await load('?component', { include: '**/*.svg?component' })).toHaveProperty(
      'code',
      expect.stringContaining('SvgComponent'),
    )
    expect(
      JSON.stringify(await load('?solid', { exclude: '**/icon.svg*' })),
    ).not.toContain('SvgComponent')
  })
  it('reports a missing Solid plugin', async () => {
    await expect(createServer({ configFile: false, plugins: [svgs()] })).rejects.toThrow(
      'requires @solidjs/vite-plugin',
    )
  })
})
