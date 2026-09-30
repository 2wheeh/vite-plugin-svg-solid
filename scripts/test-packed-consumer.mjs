import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

// A separate workspace outside this repo prevents accidental resolution of
// undeclared dependencies from the development node_modules directory.
const temporary = await mkdtemp(join(tmpdir(), 'svgs-packed-'))
const repository = process.cwd()
const manifest = JSON.parse(await readFile('package.json', 'utf8'))
const workspace = (await readFile('pnpm-workspace.yaml', 'utf8')).replace(
  /packages:\n(?: {2}.*\n)+/,
  'packages: []\n',
)

try {
  execFileSync('pnpm', ['pack', '--pack-destination', temporary], { stdio: 'inherit' })
  const tarball = (await readdir(temporary)).find((file) => file.endsWith('.tgz'))
  assert.ok(tarball)
  for (const version of ['rc3', 'rc9', 'rc10']) {
    const fixture = JSON.parse(
      await readFile(`tests/fixtures/${version}/package.json`, 'utf8'),
    )
    const root = join(temporary, version)
    await cp('tests/app', root, { recursive: true })
    await writeFile(join(root, 'pnpm-workspace.yaml'), workspace)
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify(
        {
          private: true,
          type: 'module',
          packageManager: manifest.packageManager,
          dependencies: {
            ...fixture.dependencies,
            'vite-plugin-svg-solid': `file:../${tarball}`,
            '@types/node': manifest.devDependencies['@types/node'],
          },
        },
        null,
        2,
      ),
    )
    console.log(`\nPacked consumer: ${version}`)
    // Frozen-lockfile installs may cache packages without registry metadata.
    execFileSync('pnpm', ['install', '--prefer-offline', '--ignore-scripts'], {
      cwd: root,
      stdio: 'inherit',
    })
    execFileSync('pnpm', ['exec', 'tsc', '-p', root], {
      cwd: repository,
      stdio: 'inherit',
    })
    execFileSync(process.execPath, [resolve('scripts/test-app.mjs'), root], {
      stdio: 'inherit',
    })
  }
} finally {
  await rm(temporary, { recursive: true, force: true })
}
