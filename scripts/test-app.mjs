import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium, expect } from '@playwright/test'
import { build, createServer, preview } from 'vite'

const root = resolve(process.argv[2])
const require = createRequire(resolve(root, 'package.json'))
const version = require('solid-js/package.json').version
const webVersion = JSON.parse(
  await readFile(
    resolve(dirname(require.resolve('@solidjs/web')), '../package.json'),
    'utf8',
  ),
).version
assert.equal(webVersion, version)
console.log(`Runtime peers: solid-js=${version}, @solidjs/web=${webVersion}`)

const browser = await chromium.launch()
const errors = []
const page = await browser.newPage()
page.on('pageerror', (error) => errors.push(error.message))
let server
let previewServer

async function checkPage(url) {
  await page.goto(url)
  const icon = page.getByTestId('icon')
  await expect(icon).toHaveAttribute('width', '32')
  await expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
  await expect(icon).toHaveAttribute('class', 'icon')
  await expect(icon).toHaveAttribute('aria-label', 'Demo icon')
  assert.equal(
    await icon.evaluate((node) => node.namespaceURI),
    'http://www.w3.org/2000/svg',
  )
  await page.getByRole('button', { name: 'Resize' }).click()
  await expect(icon).toHaveAttribute('width', '40')
  await icon.click()
  await expect(icon).toHaveAttribute('width', '41')
  await expect(page.getByTestId('complex').locator('text')).toHaveText(
    '{literal} & <safe>',
  )
  await expect(page.getByTestId('raw')).toContainText('<svg')
  await expect(page.getByTestId('glob')).toHaveText('2')
  assert.equal(
    await page
      .getByRole('img', { name: 'URL import' })
      .evaluate((img) => img.complete && img.naturalWidth > 0),
    true,
  )
  const use = page.getByTestId('complex').locator('use')
  const href = await use.getAttribute('xlink:href')
  assert.ok(href?.startsWith('#'))
  assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1)
  assert.deepEqual(errors, [])
}

function installHydrationRoute(server) {
  server.middlewares.use('/hydrate', async (_request, response, next) => {
    try {
      const { render, generateHydrationScript } =
        await server.ssrLoadModule('/server.tsx')
      const iconModule = await server.ssrLoadModule('/icon.svg?solid')
      assert.equal(iconModule.$$moduleUrl, 'icon.svg?solid')
      const html = await render()
      assert.match(html, /<svg/)
      assert.match(html, /width="32"/)
      const template = (await readFile(resolve(root, 'index.html'), 'utf8')).replace(
        '<div id="app"></div>',
        `<div id="app">${html}</div><script>window.__ssrIcon = document.querySelector('[data-testid="icon"]')</script>`,
      )
      response.setHeader('Content-Type', 'text/html')
      response.end(
        await server.transformIndexHtml(
          '/hydrate',
          template.replace('</head>', `${generateHydrationScript()}</head>`),
        ),
      )
    } catch (error) {
      next(error)
    }
  })
}

try {
  server = await createServer({
    root,
    logLevel: 'warn',
    plugins: [{ name: 'test:hydration-route', configureServer: installHydrationRoute }],
    server: { host: '127.0.0.1', port: 0 },
  })
  await server.listen()
  const address = server.httpServer.address()
  const url = `http://127.0.0.1:${address.port}`
  await checkPage(url)

  const original = await readFile(resolve(root, 'icon.svg'), 'utf8')
  try {
    await writeFile(resolve(root, 'icon.svg'), original.replace('0 0 24 24', '0 0 48 48'))
    await expect(page.getByTestId('icon')).toHaveAttribute('viewBox', '0 0 48 48')
    // An SVG update should preserve the parent's signal state.
    await expect(page.getByTestId('icon')).toHaveAttribute('width', '41')
  } finally {
    await writeFile(resolve(root, 'icon.svg'), original)
  }
  await expect(page.getByTestId('icon')).toHaveAttribute('viewBox', '0 0 24 24')
  console.log(
    '  development, reactive props, events, asset imports, glob, and SVG HMR passed',
  )

  await checkPage(`${url}/hydrate`)
  assert.equal(
    await page.evaluate(
      () => window.__ssrIcon === document.querySelector('[data-testid="icon"]'),
    ),
    true,
  )
  console.log('  SSR and hydration passed')
  await server.close()
  server = undefined

  await build({ root, logLevel: 'warn', build: { outDir: 'dist/client' } })
  previewServer = await preview({
    root,
    logLevel: 'warn',
    build: { outDir: 'dist/client' },
    preview: { host: '127.0.0.1', port: 0 },
  })
  const previewAddress = previewServer.httpServer.address()
  await checkPage(`http://127.0.0.1:${previewAddress.port}`)
  await build({
    root,
    logLevel: 'warn',
    build: { ssr: 'server.tsx', outDir: 'dist/server' },
  })
  const built = await import(pathToFileURL(resolve(root, 'dist/server/server.js')).href)
  const html = await built.render()
  assert.match(html, /<svg/)
  assert.match(html, /width="32"/)
  assert.deepEqual(errors, [])
  console.log('  production client and SSR builds passed')
} finally {
  await server?.close()
  await previewServer?.close()
  await browser.close()
}
