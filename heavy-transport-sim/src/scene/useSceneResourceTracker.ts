import { useRef, useCallback } from 'react'

interface ResourceCounts {
  geometries: number
  materials: number
  textures: number
  listeners: number
}

export function useSceneResourceTracker() {
  const countsRef = useRef<ResourceCounts>({
    geometries: 0,
    materials: 0,
    textures: 0,
    listeners: 0,
  })

  const trackGeometry = useCallback(() => {
    countsRef.current.geometries++
  }, [])

  const trackMaterial = useCallback(() => {
    countsRef.current.materials++
  }, [])

  const trackTexture = useCallback(() => {
    countsRef.current.textures++
  }, [])

  const trackListener = useCallback(() => {
    countsRef.current.listeners++
  }, [])

  const untrackListener = useCallback(() => {
    countsRef.current.listeners = Math.max(0, countsRef.current.listeners - 1)
  }, [])

  const getCounts = useCallback((): ResourceCounts => {
    return { ...countsRef.current }
  }, [])

  const resetCounts = useCallback(() => {
    countsRef.current = {
      geometries: 0,
      materials: 0,
      textures: 0,
      listeners: 0,
    }
  }, [])

  return {
    trackGeometry,
    trackMaterial,
    trackTexture,
    trackListener,
    untrackListener,
    getCounts,
    resetCounts,
  }
}
