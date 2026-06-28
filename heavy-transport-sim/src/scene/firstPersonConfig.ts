export const FIRST_PERSON_CONFIG = {
  defaultPosition: [0, 1.7, 8] as [number, number, number],
  defaultYaw: 0,
  defaultPitch: 0,
  moveSpeed: 4,
  minHeight: 1.2,
  maxDistanceFromOrigin: 35,
  boundary: {
    minX: -25,
    maxX: 25,
    minZ: -25,
    maxZ: 25,
  },
} as const
