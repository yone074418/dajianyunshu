import { RigidBody, CuboidCollider } from '@react-three/rapier'

interface ObstacleColliderProps {
  id: string
  position?: [number, number, number]
  halfExtents?: [number, number, number]
  children?: React.ReactNode
}

export default function ObstacleCollider({
  id,
  position = [0, 1.5, 0],
  halfExtents = [0.15, 1.5, 0.15],
  children,
}: ObstacleColliderProps) {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={position}
      name={id}
      data-testid={`collider-${id}`}
    >
      <CuboidCollider args={halfExtents} />
      {children}
    </RigidBody>
  )
}
