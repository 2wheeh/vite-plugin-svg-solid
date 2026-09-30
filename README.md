# vite-plugin-svg-solid

Import SVG files as Solid 2 components in Vite.

## Install

Requires Node.js 22.12+, Vite 8, Solid `2.0.0-rc.3` or later, and
`@solidjs/vite-plugin` `3.0.0-next.34` or later within their current major versions.
For Solid `rc.10`:

```sh
pnpm add --save-exact solid-js@2.0.0-rc.10 @solidjs/web@2.0.0-rc.10
pnpm add -D vite-plugin-svg-solid vite@^8
pnpm add -D --save-exact @solidjs/vite-plugin@3.0.0-next.46
```

Tested combinations (`solid-js` and `@solidjs/web` must use the same version):

| Solid | `@solidjs/vite-plugin` |
| --- | --- |
| `2.0.0-rc.3` | `3.0.0-next.34` |
| `2.0.0-rc.9` | `3.0.0-next.44` |
| `2.0.0-rc.10` | `3.0.0-next.46` |

## Setup

```ts
// vite.config.ts
import solid from '@solidjs/vite-plugin';
import { defineConfig } from 'vite';
import svgs from 'vite-plugin-svg-solid';

export default defineConfig({
  plugins: [svgs(), solid()],
});
```

For SSR, use `solid({ ssr: true })`. HMR and hydration follow Solid's settings.

Add the SVG component types:

```ts
// src/vite-env.d.ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svg-solid/client" />
```

Set `jsx: "preserve"` and `jsxImportSource: "@solidjs/web"` in your tsconfig.
For rc.9/rc.10, use `skipLibCheck: true` to bypass upstream declaration errors.

## Usage

```tsx
import Icon from './icon.svg?solid'; // Solid component
import url from './icon.svg'; // Asset URL (also accepts ?url)
import source from './icon.svg?raw'; // SVG source

export default function App() {
  return <Icon width={24} height={24} class='icon' aria-label='Icon' />;
}
```

Props override root SVG attributes. Reactive props, events, and `ref` work as in
Solid. Import SVGs from your source directory, outside `public`.

Import multiple icons:

```ts
const icons = import.meta.glob('./icons/*.svg', {
  query: '?solid',
  import: 'default',
  eager: true,
});
```

## Options

```ts
svgs({
  include: '**/*.svg?solid',
  exclude: '**/vendor/**',
  svgo: false, // Disable optimization (enabled by default).
});
```

`include` replaces the default `?solid` selection; custom patterns need matching
TypeScript module declarations. Explicit Vite asset queries always take priority.

`svgo` also accepts an SVGO config object. Defaults use `preset-default` and
`prefixIds`, preserving `viewBox`. A custom `plugins` list replaces those defaults.

MIT.
