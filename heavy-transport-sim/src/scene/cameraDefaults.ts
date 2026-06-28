export const SCENE_CAMERA_DEFAULTS = {
  position: [8, 6, 8] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
  fov: 50,
  near: 0.1,
  far: 200,
  minDistance: 4,
  maxDistance: 40,
  minPolarAngle: 0.15,
  maxPolarAngle: Math.PI / 2.15,
  enablePan: false,
} as const
