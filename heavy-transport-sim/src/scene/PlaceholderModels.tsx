import SelectableModel from './SelectableModel'
import HighlightMesh from './HighlightMesh'
import type { SceneObjectMeta } from './sceneObjectMeta'

interface PlaceholderModelsProps {
  objects: SceneObjectMeta[]
  hoveredObjectId: string | null
  selectedObjectId: string | null
  onPointerOver: (id: string) => void
  onPointerOut: () => void
  onClick: (id: string) => void
}

export default function PlaceholderModels({
  objects,
  hoveredObjectId,
  selectedObjectId,
  onPointerOver,
  onPointerOut,
  onClick,
}: PlaceholderModelsProps) {
  return (
    <group>
      {objects.map((meta, index) => {
        const x = (index - 1) * 4
        const isHovered = hoveredObjectId === meta.id
        const isSelected = selectedObjectId === meta.id

        return (
          <SelectableModel
            key={meta.id}
            meta={meta}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
            onClick={onClick}
          >
            {meta.category === 'cargo' && (
              <HighlightMesh
                isHovered={isHovered}
                isSelected={isSelected}
                baseColor="#4a90d9"
                hoverColor="#6ab0f9"
                selectedColor="#2d70b3"
              >
                <boxGeometry args={[2, 1.2, 1.5]} />
              </HighlightMesh>
            )}
            {meta.category === 'vehicle' && (
              <HighlightMesh
                isHovered={isHovered}
                isSelected={isSelected}
                baseColor="#5b8c3e"
                hoverColor="#7bae5e"
                selectedColor="#3d6b2a"
              >
                <boxGeometry args={[3, 1, 1.2]} />
              </HighlightMesh>
            )}
            {meta.category === 'obstacle' && (
              <group position={[x, 0, 0]}>
                <HighlightMesh
                  isHovered={isHovered}
                  isSelected={isSelected}
                  baseColor="#c0392b"
                  hoverColor="#e74c3c"
                  selectedColor="#962d22"
                >
                  <boxGeometry args={[0.3, 3, 0.3]} />
                </HighlightMesh>
                <mesh position={[0, 1.8, 0]}>
                  <boxGeometry args={[2.5, 0.2, 0.2]} />
                  <meshStandardMaterial
                    color={
                      isSelected ? '#962d22' : isHovered ? '#e74c3c' : '#c0392b'
                    }
                    emissive={isSelected || isHovered ? '#c0392b' : '#000'}
                    emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.15 : 0}
                  />
                </mesh>
              </group>
            )}
          </SelectableModel>
        )
      })}
    </group>
  )
}
