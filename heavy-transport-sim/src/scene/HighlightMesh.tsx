import { useRef, useEffect } from 'react'
import type { Mesh, MeshStandardMaterial } from 'three'

interface HighlightMeshProps {
  isHovered: boolean
  isSelected: boolean
  baseColor: string
  hoverColor: string
  selectedColor: string
  children: React.ReactNode
}

export default function HighlightMesh({
  isHovered,
  isSelected,
  baseColor,
  hoverColor,
  selectedColor,
  children,
}: HighlightMeshProps) {
  const meshRef = useRef<Mesh>(null)

  useEffect(() => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as MeshStandardMaterial
    if (isSelected) {
      mat.color.set(selectedColor)
      mat.emissive.set(selectedColor)
      mat.emissiveIntensity = 0.3
    } else if (isHovered) {
      mat.color.set(hoverColor)
      mat.emissive.set(hoverColor)
      mat.emissiveIntensity = 0.15
    } else {
      mat.color.set(baseColor)
      mat.emissive.set('#000000')
      mat.emissiveIntensity = 0
    }
  }, [isHovered, isSelected, baseColor, hoverColor, selectedColor])

  return (
    <mesh ref={meshRef}>
      {children}
      <meshStandardMaterial color={baseColor} />
    </mesh>
  )
}
