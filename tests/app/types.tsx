import type { JSX } from '@solidjs/web'
import Icon from './icon.svg?solid'

const icon: JSX.Element = <Icon width={24} class="icon" aria-hidden="true" />
// @ts-expect-error SVG components are functions, not asset URLs.
const url: string = Icon
// @ts-expect-error Unknown SVG props should remain type errors.
const invalid = <Icon notAnSvgAttribute="invalid" />
void [icon, url, invalid]
