import { useEffect, useMemo } from 'react'

interface Disposable { dispose(): void }

/** useMemo for three.js resources, disposed when the component unmounts or deps change. */
export function useDisposable<T extends Disposable | Disposable[]>(factory: () => T, deps: unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps)
  useEffect(
    () => () => {
      if (Array.isArray(value)) value.forEach((v) => v.dispose())
      else value.dispose()
    },
    [value],
  )
  return value
}
