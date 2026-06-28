import { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import SceneLighting from './SceneLighting'
import Ground from './Ground'
import LoadingUI from './LoadingUI'
import SceneErrorBoundary from './SceneErrorBoundary'

interface SceneCanvasProps {
  style?: React.CSSProperties
}

function SceneContent() {
  return (
    <>
      <SceneLighting />
      <Ground />
    </>
  )
}

export default function SceneCanvas({ style }: SceneCanvasProps) {
  const [retryKey, setRetryKey] = useState(0)

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1)
  }, [])

  return (
    <SceneErrorBoundary onRetry={handleRetry}>
      <Canvas
        key={retryKey}
        data-testid="scene-canvas"
        style={{ width: '100%', height: '400px', ...style }}
        camera={{ position: [10, 10, 10], fov: 50, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#e8e8e8')
        }}
      >
        <Suspense fallback={<LoadingUI />}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </SceneErrorBoundary>
  )
}
