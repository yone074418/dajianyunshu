import { useEffect, useRef, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneViewMode } from './useSceneViewMode'
import { shouldIgnoreKeyboardEvent } from './keyboardControlGuard'
import { clampFirstPersonPosition } from './firstPersonBoundary'
import { FIRST_PERSON_CONFIG } from './firstPersonConfig'

const keysPressed = new Set<string>()

export function useFirstPersonControls() {
  const mode = useSceneViewMode((s) => s.mode)
  const exitWalkthrough = useSceneViewMode((s) => s.exitWalkthrough)
  const { camera } = useThree()
  const positionRef = useRef<[number, number, number]>([
    ...FIRST_PERSON_CONFIG.defaultPosition,
  ])
  const yawRef = useRef(FIRST_PERSON_CONFIG.defaultYaw)
  const pitchRef = useRef(FIRST_PERSON_CONFIG.defaultPitch)
  const isSetupRef = useRef(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboardEvent(e)) return

      if (e.key === 'Escape') {
        exitWalkthrough()
        return
      }

      keysPressed.add(e.key.toLowerCase())
    },
    [exitWalkthrough],
  )

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.delete(e.key.toLowerCase())
  }, [])

  useEffect(() => {
    if (mode !== 'walkthrough') {
      keysPressed.clear()
      isSetupRef.current = false
      return
    }

    if (!isSetupRef.current) {
      positionRef.current = [...FIRST_PERSON_CONFIG.defaultPosition]
      yawRef.current = FIRST_PERSON_CONFIG.defaultYaw
      pitchRef.current = FIRST_PERSON_CONFIG.defaultPitch
      isSetupRef.current = true
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      keysPressed.clear()
    }
  }, [mode, handleKeyDown, handleKeyUp])

  useFrame((_, delta) => {
    if (mode !== 'walkthrough') return

    const speed = FIRST_PERSON_CONFIG.moveSpeed * delta
    const pos = positionRef.current
    const direction = new THREE.Vector3()

    if (keysPressed.has('w') || keysPressed.has('arrowup')) {
      direction.z -= 1
    }
    if (keysPressed.has('s') || keysPressed.has('arrowdown')) {
      direction.z += 1
    }
    if (keysPressed.has('a') || keysPressed.has('arrowleft')) {
      direction.x -= 1
    }
    if (keysPressed.has('d') || keysPressed.has('arrowright')) {
      direction.x += 1
    }

    if (direction.lengthSq() > 0) {
      direction.normalize()
      direction.applyEuler(new THREE.Euler(0, yawRef.current, 0))

      pos[0] += direction.x * speed
      pos[2] += direction.z * speed

      const clamped = clampFirstPersonPosition(pos)
      pos[0] = clamped[0]
      pos[1] = clamped[1]
      pos[2] = clamped[2]
    }

    camera.position.set(pos[0], pos[1], pos[2])
    const lookTarget = new THREE.Vector3(
      pos[0] - Math.sin(yawRef.current),
      pos[1] + Math.sin(pitchRef.current),
      pos[2] - Math.cos(yawRef.current),
    )
    camera.lookAt(lookTarget)
  })
}
