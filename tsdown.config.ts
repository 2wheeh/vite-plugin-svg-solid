import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'es2022',
  clean: true,
  dts: true,
  sourcemap: true,
  failOnWarn: 'ci-only',
})
