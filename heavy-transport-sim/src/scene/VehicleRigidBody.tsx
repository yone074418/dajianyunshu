import { RigidBody, CuboidCollider } from '@react-three/rapier'

interface VehicleRigidBodyProps {
  id: string
  position?: [number, number, number]
  children?: React.ReactNode
}

export default function VehicleRigidBody({
  id,
  position = [0, 0.6, 0],
  children,
}: VehicleRigidBodyProps) {
  return (
    <RigidBody
      type="dynamic"
      colliders={false}
      position={position}
      name={id}
      data-testid={`rigidbody-${id}`}
    >
      <CuboidCollider args={[1.5, 0.5, 0.6]} />
      {children}
    </RigidBody>
  )
}
