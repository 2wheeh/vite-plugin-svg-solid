---
"vite-plugin-svg-solid": major
---

**Breaking:** Raised the minimum peer versions to Solid `2.0.0-rc.3` and `@solidjs/vite-plugin` `3.0.0-next.34`. Upgrade `solid-js` and `@solidjs/web` together, keeping their versions identical, and upgrade the Vite plugin if using an older release.

```diff
-pnpm add --save-exact solid-js@2.0.0-rc.2 @solidjs/web@2.0.0-rc.2
-pnpm add -D --save-exact @solidjs/vite-plugin@3.0.0-next.33
+pnpm add --save-exact solid-js@2.0.0-rc.3 @solidjs/web@2.0.0-rc.3
+pnpm add -D --save-exact @solidjs/vite-plugin@3.0.0-next.34
```
