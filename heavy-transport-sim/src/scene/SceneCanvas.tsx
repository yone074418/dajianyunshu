import { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import SceneLighting from './SceneLighting'
import Ground from './Ground'
import LoadingUI from './LoadingUI'
import SceneErrorBoundary from './SceneErrorBoundary'
import SceneCameraControls from './SceneCameraControls'
import PlaceholderModels from './PlaceholderModels'
import SceneInfoPanel from './SceneInfoPanel'
import GroundCollider from './GroundCollider'
import VehicleRigidBody from './VehicleRigidBody'
import ObstacleCollider from './ObstacleCollider'
import TriggerZone from './TriggerZone'
import TriggerEventPanel from './TriggerEventPanel'
import { SCENE_CAMERA_DEFAULTS } from './cameraDefaults'
import { SCENE_PHYSICS_CONFIG } from './physicsConfig'
import { SCENE_OBJECTS } from './sceneObjectMeta'
import { useSceneInteraction } from './useSceneInteraction'
import { useTriggerEvents } from './useTriggerEvents'

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
  const { events, recordEvent } = useTriggerEvents()

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
            <Physics
              gravity={SCENE_PHYSICS_CONFIG.gravity}
              timeStep={SCENE_PHYSICS_CONFIG.timeStep}
            >
              <SceneLighting />
              <Ground />
              <GroundCollider />
              <SceneCameraControls />
              <VehicleRigidBody id="tractor-6x6" position={[-3, 0.6, 0]}>
                <PlaceholderModels
                  objects={SCENE_OBJECTS.filter((o) => o.category === 'vehicle')}
                  hoveredObjectId={hoveredObjectId}
                  selectedObjectId={selectedObjectId}
                  onPointerOver={handlePointerOver}
                  onPointerOut={handlePointerOut}
                  onClick={handleClick}
                />
              </VehicleRigidBody>
              <VehicleRigidBody id="cargo-main" position={[0, 0.6, 0]}>
                <PlaceholderModels
                  objects={SCENE_OBJECTS.filter((o) => o.category === 'cargo')}
                  hoveredObjectId={hoveredObjectId}
                  selectedObjectId={selectedObjectId}
                  onPointerOver={handlePointerOver}
                  onPointerOut={handlePointerOut}
                  onClick={handleClick}
                />
              </VehicleRigidBody>
              <ObstacleCollider id="height-limit" position={[4, 1.5, 0]}>
                <PlaceholderModels
                  objects={SCENE_OBJECTS.filter(
                    (o) => o.category === 'obstacle',
                  )}
                  hoveredObjectId={hoveredObjectId}
                  selectedObjectId={selectedObjectId}
                  onPointerOver={handlePointerOver}
                  onPointerOut={handlePointerOut}
                  onClick={handleClick}
                />
              </ObstacleCollider>
              <TriggerZone
                id="trigger-height-zone"
                name="限高检测区"
                position={[4, 1, 0]}
                halfExtents={[1.5, 1.5, 1.5]}
                onTriggerEvent={recordEvent}
              />
            </Physics>
          </Suspense>
        </Canvas>
        <SceneInfoPanel
          meta={panelMeta}
          isHovered={!!hoveredMeta && !selectedMeta}
        />
        <TriggerEventPanel events={events} />
      </SceneErrorBoundary>
    </div>
  )
}
