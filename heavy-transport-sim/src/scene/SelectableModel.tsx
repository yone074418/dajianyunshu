import type { SceneObjectMeta } from './sceneObjectMeta'

interface SelectableModelProps {
  meta: SceneObjectMeta
  onPointerOver: (id: string) => void
  onPointerOut: () => void
  onClick: (id: string) => void
  children: React.ReactNode
}

export default function SelectableModel({
  meta,
  onPointerOver,
  onPointerOut,
  onClick,
  children,
}: SelectableModelProps) {
  return (
    <group
      data-testid={`scene-object-${meta.id}`}
      onPointerOver={(e) => {
        e.stopPropagation()
        onPointerOver(meta.id)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onPointerOut()
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick(meta.id)
      }}
    >
      {children}
    </group>
  )
}
