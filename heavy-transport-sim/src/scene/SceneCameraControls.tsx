import { OrbitControls } from '@react-three/drei'
import { SCENE_CAMERA_DEFAULTS } from './cameraDefaults'

export default function SceneCameraControls() {
  return (
    <OrbitControls
      makeDefault
      target={SCENE_CAMERA_DEFAULTS.target}
      minDistance={SCENE_CAMERA_DEFAULTS.minDistance}
      maxDistance={SCENE_CAMERA_DEFAULTS.maxDistance}
      minPolarAngle={SCENE_CAMERA_DEFAULTS.minPolarAngle}
      maxPolarAngle={SCENE_CAMERA_DEFAULTS.maxPolarAngle}
      enablePan={SCENE_CAMERA_DEFAULTS.enablePan}
      enableDamping
      dampingFactor={0.1}
    />
  )
}
