import { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import SceneLighting from './SceneLighting'
import Ground from './Ground'
import LoadingUI from './LoadingUI'
import SceneErrorBoundary from './SceneErrorBoundary'
import SceneCameraControls from './SceneCameraControls'
import { SCENE_CAMERA_DEFAULTS } from './cameraDefaults'

interface SceneCanvasProps {
  style?: React.CSSProperties
  cameraResetKey?: number
}

function SceneContent() {
  return (
    <>
      <SceneLighting />
      <Ground />
      <SceneCameraControls />
    </>
  )
}

export default function SceneCanvas({
  style,
  cameraResetKey = 0,
}: SceneCanvasProps) {
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
        camera={{
          position: SCENE_CAMERA_DEFAULTS.position,
          fov: SCENE_CAMERA_DEFAULTS.fov,
          near: SCENE_CAMERA_DEFAULTS.near,
          far: SCENE_CAMERA_DEFAULTS.far,
        }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#e8e8e8')
        }}
      >
        <Suspense fallback={<LoadingUI />}>
          <SceneContent key={cameraResetKey} />
        </Suspense>
      </Canvas>
    </SceneErrorBoundary>
  )
}
