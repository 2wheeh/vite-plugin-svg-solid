declare module '*.svg?solid' {
  import type { JSX } from '@solidjs/web'
  import type { Component } from 'solid-js'

  const component: Component<JSX.SvgSVGAttributes<SVGSVGElement>>
  export default component
}
