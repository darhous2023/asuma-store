"use client"

import { useEffect, useRef } from "react"

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let renderer: import("three").WebGLRenderer
    let animId: number

    const init = async (reducedMotion: boolean) => {
      const THREE = await import("three")

      const W = mount.clientWidth
      const H = mount.clientHeight

      // Scene + Camera
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
      camera.position.z = 4

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      // ── Outer gold particle ring ──
      const outerGeo = new THREE.BufferGeometry()
      const outerN = 200
      const outerPos = new Float32Array(outerN * 3)
      for (let i = 0; i < outerN; i++) {
        const phi = Math.acos(-1 + (2 * i) / outerN)
        const theta = Math.sqrt(outerN * Math.PI) * phi
        const r = 1.5 + Math.random() * 0.8
        outerPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        outerPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        outerPos[i * 3 + 2] = r * Math.cos(phi)
      }
      outerGeo.setAttribute("position", new THREE.BufferAttribute(outerPos, 3))
      const outerMat = new THREE.PointsMaterial({
        color: 0xc9a96e,
        size: 0.035,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
      })
      const outerPoints = new THREE.Points(outerGeo, outerMat)
      scene.add(outerPoints)

      // ── Inner bright core ──
      const innerGeo = new THREE.BufferGeometry()
      const innerN = 80
      const innerPos = new Float32Array(innerN * 3)
      for (let i = 0; i < innerN; i++) {
        const phi = Math.acos(-1 + (2 * i) / innerN)
        const theta = Math.sqrt(innerN * Math.PI) * phi
        const r = 0.6 + Math.random() * 0.3
        innerPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        innerPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        innerPos[i * 3 + 2] = r * Math.cos(phi)
      }
      innerGeo.setAttribute("position", new THREE.BufferAttribute(innerPos, 3))
      const innerMat = new THREE.PointsMaterial({
        color: 0xe5c882,
        size: 0.025,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
      })
      const innerPoints = new THREE.Points(innerGeo, innerMat)
      scene.add(innerPoints)

      // ── Mouse parallax ──
      let mx = 0, my = 0
      const onMouse = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 0.4
        my = (e.clientY / window.innerHeight - 0.5) * 0.4
      }
      window.addEventListener("mousemove", onMouse, { passive: true })

      // ── Resize ──
      const onResize = () => {
        if (!mount) return
        const nW = mount.clientWidth
        const nH = mount.clientHeight
        camera.aspect = nW / nH
        camera.updateProjectionMatrix()
        renderer.setSize(nW, nH)
      }
      window.addEventListener("resize", onResize)

      // ── Animate ──
      const clock = new THREE.Clock()
      const animate = () => {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        if (!reducedMotion) {
          outerPoints.rotation.y = t * 0.06 + mx
          outerPoints.rotation.x = my * 0.3
          innerPoints.rotation.y = -t * 0.1 + mx * 0.5
          innerPoints.rotation.x = -my * 0.2
        }

        renderer.render(scene, camera)
      }
      animate()

      // cleanup captures
      return () => {
        window.removeEventListener("mousemove", onMouse)
        window.removeEventListener("resize", onResize)
      }
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let cleanup: (() => void) | undefined
    init(reducedMotion).then((fn) => { cleanup = fn })

    return () => {
      cancelAnimationFrame(animId)
      cleanup?.()
      if (renderer) {
        renderer.dispose()
        renderer.domElement.remove()
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  )
}
