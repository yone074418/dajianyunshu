import { useState, useCallback } from 'react'

export type SceneObjectId = string | null

export interface SceneInteractionState {
  hoveredObjectId: SceneObjectId
  selectedObjectId: SceneObjectId
}

export function useSceneInteraction() {
  const [hoveredObjectId, setHoveredObjectId] = useState<SceneObjectId>(null)
  const [selectedObjectId, setSelectedObjectId] = useState<SceneObjectId>(null)

  const handlePointerOver = useCallback((id: string) => {
    setHoveredObjectId(id)
  }, [])

  const handlePointerOut = useCallback(() => {
    setHoveredObjectId(null)
  }, [])

  const handleClick = useCallback(
    (id: string) => {
      setSelectedObjectId((prev) => (prev === id ? null : id))
    },
    [],
  )

  const clearSelection = useCallback(() => {
    setSelectedObjectId(null)
  }, [])

  return {
    hoveredObjectId,
    selectedObjectId,
    handlePointerOver,
    handlePointerOut,
    handleClick,
    clearSelection,
  }
}
