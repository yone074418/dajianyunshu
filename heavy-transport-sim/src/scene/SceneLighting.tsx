export default function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} />
      <hemisphereLight args={['#87ceeb', '#444444', 0.3]} />
    </>
  )
}
