# vite-plugin-svg-solid

## 1.0.0

### Major Changes

- [#2](https://github.com/2wheeh/vite-plugin-svg-solid/pull/2) [`1d47d63`](https://github.com/2wheeh/vite-plugin-svg-solid/commit/1d47d635633641ed4cf7d27c5cfd439c77c6a70b) Thanks [@2wheeh](https://github.com/2wheeh)! - **Breaking:** Raised the minimum peer versions to Solid `2.0.0-rc.3` and `@solidjs/vite-plugin` `3.0.0-next.34`. Upgrade `solid-js` and `@solidjs/web` together, keeping their versions identical, and upgrade the Vite plugin if using an older release.
  
  ```diff
  -pnpm add --save-exact solid-js@2.0.0-rc.2 @solidjs/web@2.0.0-rc.2
  -pnpm add -D --save-exact @solidjs/vite-plugin@3.0.0-next.33
  +pnpm add --save-exact solid-js@2.0.0-rc.3 @solidjs/web@2.0.0-rc.3
  +pnpm add -D --save-exact @solidjs/vite-plugin@3.0.0-next.34
  ```
