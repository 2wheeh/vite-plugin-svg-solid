import { optimize, type Config as SvgoConfig } from 'svgo'

export function optimizeSvg(
  source: string,
  filename: string,
  options: boolean | SvgoConfig = true,
): string {
  if (options === false) return source

  return optimize(source, {
    // Preserve viewBox for responsive sizing, and isolate IDs per file.
    plugins: ['preset-default', 'prefixIds'],
    ...(typeof options === 'object' ? options : {}),
    path: filename,
  }).data
}
