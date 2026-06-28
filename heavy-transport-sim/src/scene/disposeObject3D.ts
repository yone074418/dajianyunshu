import * as THREE from 'three'

export function disposeMaterial(material: THREE.Material): void {
  if (!material) return
  material.dispose()
  const mat = material as THREE.MeshStandardMaterial & {
    map?: THREE.Texture | null
    normalMap?: THREE.Texture | null
    roughnessMap?: THREE.Texture | null
    metalnessMap?: THREE.Texture | null
    aoMap?: THREE.Texture | null
    emissiveMap?: THREE.Texture | null
    envMap?: THREE.Texture | null
    lightMap?: THREE.Texture | null
    bumpMap?: THREE.Texture | null
    displacementMap?: THREE.Texture | null
    alphaMap?: THREE.Texture | null
  }

  const textureFields = [
    'map',
    'normalMap',
    'roughnessMap',
    'metalnessMap',
    'aoMap',
    'emissiveMap',
    'envMap',
    'lightMap',
    'bumpMap',
    'displacementMap',
    'alphaMap',
  ] as const

  for (const field of textureFields) {
    const tex = mat[field]
    if (tex && tex.dispose) {
      tex.dispose()
    }
  }
}

export function disposeObject3D(object: THREE.Object3D): void {
  if (!object) return

  const mesh = object as THREE.Mesh
  if (mesh.geometry) {
    mesh.geometry.dispose()
  }

  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      for (const mat of mesh.material) {
        disposeMaterial(mat)
      }
    } else {
      disposeMaterial(mesh.material)
    }
  }

  while (object.children.length > 0) {
    disposeObject3D(object.children[0])
    object.remove(object.children[0])
  }

  if (object.parent) {
    object.parent.remove(object)
  }
}
