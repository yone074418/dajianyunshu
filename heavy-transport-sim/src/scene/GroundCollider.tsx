import { CuboidCollider, RigidBody } from '@react-three/rapier'

export default function GroundCollider() {
  return (
    <RigidBody type="fixed" colliders={false} name="ground">
      <CuboidCollider args={[50, 0.1, 50]} position={[0, -0.1, 0]} />
    </RigidBody>
  )
}
