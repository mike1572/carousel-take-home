import { useEffect, useRef } from 'react'
import type * as THREE_NS from 'three'
import { motionPrefs } from './motion'

/**
 * PaperDrift — a full-width band of paper sheets piled at the bottom of the hero.
 * The brand metaphor: the manual paperwork Carousel removes.
 *
 * Performance / a11y:
 *  - Three.js is lazy-loaded (dynamic import) only when the band nears the viewport.
 *  - All sheets are one InstancedMesh → a single draw call.
 *  - Motion + pointer interaction are disabled for prefers-reduced-motion and
 *    coarse (touch) pointers; a static pile still renders.
 */
export default function PaperDrift() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const { hoverFine, reduceMotion } = motionPrefs()
    let dispose = () => {}
    let started = false

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true
          io.disconnect()
          import('three')
            .then((THREE) => {
              dispose = initScene(THREE, mount, {
                animate: !reduceMotion,
                pointer: hoverFine && !reduceMotion,
              })
            })
            .catch(() => {}) // fail silently: the hero still works without the band
        }
      },
      { rootMargin: '300px' }
    )
    io.observe(mount)

    return () => {
      io.disconnect()
      dispose()
    }
  }, [])

  return <div className="paper-drift" ref={mountRef} aria-hidden="true" />
}

type Opts = { animate: boolean; pointer: boolean }

function initScene(THREE: typeof THREE_NS, mount: HTMLDivElement, opts: Opts) {
  const COUNT = 520
  const PAPER_TINTS = [0xffffff, 0xfdfdfb, 0xf8f5ee, 0xfbf9f3]

  let width = mount.clientWidth
  let height = mount.clientHeight || 300

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  mount.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
  camera.position.set(0, 1.9, 7.6)
  camera.lookAt(0, -0.25, 0)

  // Soft ambient base + a grazing key light: the low angle catches sheet edges
  // and overlaps, giving the pile depth instead of a flat white blob.
  // (Intensities run high because MeshStandard uses physically-based lighting.)
  scene.add(new THREE.AmbientLight(0xffffff, 2.0))
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(5, 2.6, 3) // grazing, from the side
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xf3ead4, 0.5) // warm bounce
  fill.position.set(-4, 1.5, 3)
  scene.add(fill)

  const geo = new THREE.PlaneGeometry(1, 1.3)
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.92,
    metalness: 0,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

  // Per-sheet base state (kept so the animation can offset from it)
  const base = new Array(COUNT).fill(0).map(() => {
    const x = (Math.random() - 0.5) * 19
    // Pile denser near the ground: pow() biases y toward the base
    const y = Math.pow(Math.random(), 2.1) * 1.15 - 0.4
    const z = (Math.random() - 0.5) * 3.2
    return {
      x,
      y,
      z,
      rx: -Math.PI / 2 + (Math.random() - 0.5) * 0.44, // lay flat, varied enough to catch light
      ry: Math.random() * Math.PI * 2, // in-plane spin (random heading)
      rz: (Math.random() - 0.5) * 0.4,
      s: 0.95 + Math.random() * 0.85,
      phase: Math.random() * Math.PI * 2,
    }
  })

  const color = new THREE.Color()
  const dummy = new THREE.Object3D()
  // YXZ: spin in-plane (Y) first, then lay flat (X), then tilt (Z) — keeps sheets flat.
  dummy.rotation.order = 'YXZ'
  for (let i = 0; i < COUNT; i++) {
    const b = base[i]
    dummy.position.set(b.x, b.y, b.z)
    dummy.rotation.set(b.rx, b.ry, b.rz)
    dummy.scale.setScalar(b.s)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
    mesh.setColorAt(i, color.setHex(PAPER_TINTS[i % PAPER_TINTS.length]))
  }
  mesh.instanceMatrix.needsUpdate = true
  scene.add(mesh)

  // Pointer → world position on a horizontal plane (for the cursor-repel)
  const ndc = new THREE.Vector2(0, 0)
  const targetNdc = new THREE.Vector2(0, 0)
  const ray = new THREE.Raycaster()
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.3)
  const hit = new THREE.Vector3(999, 0, 999)
  const REPEL_R = 2.4

  function onPointerMove(e: PointerEvent) {
    const r = renderer.domElement.getBoundingClientRect()
    targetNdc.x = ((e.clientX - r.left) / r.width) * 2 - 1
    targetNdc.y = -((e.clientY - r.top) / r.height) * 2 + 1
  }
  function onPointerLeave() {
    hit.set(999, 0, 999)
  }
  if (opts.pointer) {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerleave', onPointerLeave)
  }

  let raf = 0
  const clock = new THREE.Clock()

  function frame() {
    const t = clock.getElapsedTime()

    // Smooth the pointer, project it into the scene (for cursor-repel only).
    // The camera stays fixed — no left/right drift of the whole pile.
    ndc.lerp(targetNdc, 0.08)
    if (opts.pointer) {
      ray.setFromCamera(ndc, camera)
      ray.ray.intersectPlane(plane, hit)
    }

    for (let i = 0; i < COUNT; i++) {
      const b = base[i]
      let y = b.y + Math.sin(t * 0.6 + b.phase) * 0.03
      let rz = b.rz + Math.cos(t * 0.7 + b.phase) * 0.05
      let rx = b.rx + Math.sin(t * 0.5 + b.phase) * 0.04

      // Cursor repel: lift + flutter nearby sheets
      if (opts.pointer) {
        const dx = b.x - hit.x
        const dz = b.z - hit.z
        const d = Math.sqrt(dx * dx + dz * dz)
        if (d < REPEL_R) {
          const push = 1 - d / REPEL_R
          y += push * 0.8
          rz += push * 0.6 * Math.sign(dx || 1)
          rx += push * 0.4
        }
      }

      dummy.position.set(b.x, y, b.z)
      dummy.rotation.set(rx, b.ry, rz)
      dummy.scale.setScalar(b.s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true

    renderer.render(scene, camera)
    if (opts.animate) raf = requestAnimationFrame(frame)
  }

  frame() // renders at least one static frame even when animation is off

  function onResize() {
    width = mount.clientWidth
    height = mount.clientHeight || 300
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    if (!opts.animate) frame()
  }
  window.addEventListener('resize', onResize)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerleave', onPointerLeave)
    geo.dispose()
    mat.dispose()
    mesh.dispose()
    renderer.dispose()
    if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
  }
}
