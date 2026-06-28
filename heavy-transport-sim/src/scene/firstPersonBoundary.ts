import { FIRST_PERSON_CONFIG } from './firstPersonConfig'

export function clampFirstPersonPosition(
  position: [number, number, number],
): [number, number, number] {
  const { boundary, minHeight } = FIRST_PERSON_CONFIG

  return [
    Math.max(boundary.minX, Math.min(boundary.maxX, position[0])),
    Math.max(minHeight, position[1]),
    Math.max(boundary.minZ, Math.min(boundary.maxZ, position[2])),
  ]
}
