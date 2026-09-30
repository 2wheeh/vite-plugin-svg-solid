import { hydrate, render } from '@solidjs/web'
import App from './app'

const container = document.getElementById('app')
if (!container) throw new Error('Missing #app')
if (container.hasChildNodes()) hydrate(() => <App />, container)
else render(() => <App />, container)
