import { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import SceneLighting from './SceneLighting'
import Ground from './Ground'
import LoadingUI from './LoadingUI'
import SceneErrorBoundary from './SceneErrorBoundary'
import SceneCameraControls from './SceneCameraControls'
import PlaceholderModels from './PlaceholderModels'
import SceneInfoPanel from './SceneInfoPanel'
import { SCENE_CAMERA_DEFAULTS } from './cameraDefaults'
import { SCENE_OBJECTS } from './sceneObjectMeta'
import { useSceneInteraction } from './useSceneInteraction'

interface SceneCanvasProps {
  style?: React.CSSProperties
}

export default function SceneCanvas({ style }: SceneCanvasProps) {
  const [retryKey, setRetryKey] = useState(0)
  const {
    hoveredObjectId,
    selectedObjectId,
    handlePointerOver,
    handlePointerOut,
    handleClick,
  } = useSceneInteraction()

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1)
  }, [])

  const selectedMeta =
    SCENE_OBJECTS.find((o) => o.id === selectedObjectId) ?? null
  const hoveredMeta =
    SCENE_OBJECTS.find((o) => o.id === hoveredObjectId) ?? null
  const panelMeta = selectedMeta ?? hoveredMeta

  return (
    <div style={{ position: 'relative' }}>
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
            <SceneLighting />
            <Ground />
            <SceneCameraControls />
            <PlaceholderModels
              objects={SCENE_OBJECTS}
              hoveredObjectId={hoveredObjectId}
              selectedObjectId={selectedObjectId}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
              onClick={handleClick}
            />
          </Suspense>
        </Canvas>
        <SceneInfoPanel
          meta={panelMeta}
          isHovered={!!hoveredMeta && !selectedMeta}
        />
      </SceneErrorBoundary>
    </div>
  )
}
