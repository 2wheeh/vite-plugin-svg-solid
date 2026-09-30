import { createSignal } from 'solid-js'
import iconUrl from './asset.svg'
import raw from './asset.svg?raw'
import Complex from './complex.svg?solid'
import Icon from './icon.svg?solid'

const icons = import.meta.glob('./{icon,complex}.svg', {
  query: '?solid',
  import: 'default',
  eager: true,
})

export default function App() {
  const [size, setSize] = createSignal(32)
  return (
    <main>
      <button type="button" onClick={() => setSize((value) => value + 8)}>
        Resize
      </button>
      <Icon
        data-testid="icon"
        width={size()}
        height={size()}
        class="icon"
        aria-label="Demo icon"
        onClick={() => setSize((value) => value + 1)}
      />
      <Complex data-testid="complex" />
      <img src={iconUrl} alt="URL import" />
      <pre data-testid="raw">{raw}</pre>
      <output data-testid="glob">{Object.keys(icons).length}</output>
    </main>
  )
}
