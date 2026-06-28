import { describe, it, expect, vi } from 'vitest'
import * as THREE from 'three'
import { disposeObject3D, disposeMaterial } from './disposeObject3D'

describe('disposeMaterial', () => {
  it('should dispose a basic material', () => {
    const material = new THREE.MeshStandardMaterial()
    const spy = vi.spyOn(material, 'dispose')
    disposeMaterial(material)
    expect(spy).toHaveBeenCalled()
  })

  it('should dispose material with textures', () => {
    const texture = new THREE.Texture()
    const texSpy = vi.spyOn(texture, 'dispose')
    const material = new THREE.MeshStandardMaterial({ map: texture })
    disposeMaterial(material)
    expect(texSpy).toHaveBeenCalled()
  })

  it('should handle null material gracefully', () => {
    expect(() =>
      disposeMaterial(null as unknown as THREE.Material),
    ).not.toThrow()
  })

  it('should handle material without textures', () => {
    const material = new THREE.MeshBasicMaterial()
    expect(() => disposeMaterial(material)).not.toThrow()
  })
})

describe('disposeObject3D', () => {
  it('should dispose geometry', () => {
    const geometry = new THREE.BoxGeometry()
    const geoSpy = vi.spyOn(geometry, 'dispose')
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial())
    disposeObject3D(mesh)
    expect(geoSpy).toHaveBeenCalled()
  })

  it('should dispose material on mesh', () => {
    const material = new THREE.MeshStandardMaterial()
    const matSpy = vi.spyOn(material, 'dispose')
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material)
    disposeObject3D(mesh)
    expect(matSpy).toHaveBeenCalled()
  })

  it('should handle mesh with material array', () => {
    const mat1 = new THREE.MeshStandardMaterial()
    const mat2 = new THREE.MeshBasicMaterial()
    const spy1 = vi.spyOn(mat1, 'dispose')
    const spy2 = vi.spyOn(mat2, 'dispose')
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), [mat1, mat2])
    disposeObject3D(mesh)
    expect(spy1).toHaveBeenCalled()
    expect(spy2).toHaveBeenCalled()
  })

  it('should remove children recursively', () => {
    const parent = new THREE.Group()
    const child = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial(),
    )
    parent.add(child)
    expect(parent.children.length).toBe(1)
    disposeObject3D(parent)
    expect(parent.children.length).toBe(0)
  })

  it('should be safely callable twice', () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial(),
    )
    expect(() => {
      disposeObject3D(mesh)
      disposeObject3D(mesh)
    }).not.toThrow()
  })

  it('should handle null object gracefully', () => {
    expect(() =>
      disposeObject3D(null as unknown as THREE.Object3D),
    ).not.toThrow()
  })

  it('should handle object without geometry or material', () => {
    const group = new THREE.Group()
    expect(() => disposeObject3D(group)).not.toThrow()
  })

  it('should remove object from parent', () => {
    const parent = new THREE.Group()
    const child = new THREE.Object3D()
    parent.add(child)
    expect(parent.children).toContain(child)
    disposeObject3D(child)
    expect(parent.children).not.toContain(child)
  })
})
