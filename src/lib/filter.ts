import { createFilter, type FilterPattern } from 'vite'

export function createSvgFilter(include?: FilterPattern, exclude?: FilterPattern) {
  const filter = createFilter(include, exclude)

  return (id: string): boolean => {
    if (id.startsWith('\0') || !filter(id)) return false
    const [filename = '', query = ''] = id.split('?', 2)
    const params = new URLSearchParams(query)
    // Vite's explicit asset modes always retain their built-in semantics.
    if (
      params.has('url') ||
      params.has('raw') ||
      params.has('inline') ||
      params.has('no-inline')
    )
      return false
    return filename.endsWith('.svg') && (include !== undefined || params.has('solid'))
  }
}
