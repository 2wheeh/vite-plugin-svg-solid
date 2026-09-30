import solid from '@solidjs/vite-plugin'
import { defineConfig } from 'vite'
import svgs from 'vite-plugin-svgs'

export default defineConfig({
  plugins: [svgs(), solid({ ssr: true })],
  // Make each compatibility app resolve its own runtime peer dependencies.
  resolve: { dedupe: ['solid-js', '@solidjs/web', '@solidjs/signals'] },
})
