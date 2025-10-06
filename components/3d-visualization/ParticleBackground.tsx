'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export default function ParticleBackground() {
  const ref = useRef<THREE.Points>(null)

  // Generate random particle positions
  const particles = useMemo(() => {
    const count = 1000
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 50
      positions[i3 + 1] = (Math.random() - 0.5) * 50
      positions[i3 + 2] = (Math.random() - 0.5) * 50
    }

    return positions
  }, [])

  // Animate particles
  useFrame((state) => {
    if (!ref.current) return
    
    ref.current.rotation.y = state.clock.elapsedTime * 0.05
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
  })

  return (
    <Points
      ref={ref}
      positions={particles}
      stride={3}
      frustumCulled
    >
      <PointMaterial
        transparent
        color="#4a9eff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
      />
    </Points>
  )
}

