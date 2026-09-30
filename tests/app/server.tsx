import { renderToString } from '@solidjs/web'
import App from './app'

export { generateHydrationScript } from '@solidjs/web'

export function render() {
  return renderToString(() => <App />)
}
