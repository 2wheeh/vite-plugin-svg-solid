import { execFileSync } from 'node:child_process'
import { cp, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const versions = process.argv.slice(2)
for (const version of versions.length ? versions : ['rc3', 'rc9', 'rc10']) {
  if (!['rc3', 'rc9', 'rc10'].includes(version))
    throw new Error(`Unknown fixture: ${version}`)
  const root = resolve('tests/fixtures', version, '.tmp/app')
  await rm(root, { recursive: true, force: true })
  await mkdir(root, { recursive: true })
  await cp('tests/app', root, { recursive: true })
  console.log(`\nTesting ${version}`)
  execFileSync('pnpm', ['exec', 'tsc', '-p', root], { stdio: 'inherit' })
  execFileSync(process.execPath, ['scripts/test-app.mjs', root], { stdio: 'inherit' })
}
