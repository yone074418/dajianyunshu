import { Grid } from '@react-three/drei'

export default function Ground() {
  return (
    <>
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6e6e6e"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#3d85c6"
        fadeDistance={80}
        fadeStrength={1}
        followCamera={false}
        position={[0, -0.01, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.9} />
      </mesh>
    </>
  )
}
