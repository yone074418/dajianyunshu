import { useEffect, useRef } from 'react'

export function useSceneCleanup(
  sceneKey: string | number,
  onCleanup?: () => void,
) {
  const prevKeyRef = useRef<string | number>(sceneKey)
  const isFirstRef = useRef(true)

  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false
      prevKeyRef.current = sceneKey
      return
    }

    if (prevKeyRef.current !== sceneKey) {
      onCleanup?.()
      prevKeyRef.current = sceneKey
    }
  }, [sceneKey, onCleanup])

  useEffect(() => {
    return () => {
      onCleanup?.()
    }
  }, [onCleanup])
}
