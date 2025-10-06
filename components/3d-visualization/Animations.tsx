'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'

// Hook for smooth scale animation on mount
export function useScaleIn(duration = 1) {
  const ref = useRef<any>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.from(ref.current.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration,
      ease: 'elastic.out(1, 0.5)'
    })
  }, [duration])

  return ref
}

// Hook for floating animation
export function useFloating(amplitude = 0.5, speed = 1) {
  const ref = useRef<any>(null)
  const initialY = useRef<number>(0)

  useEffect(() => {
    if (ref.current) {
      initialY.current = ref.current.position.y
    }
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = initialY.current + Math.sin(state.clock.elapsedTime * speed) * amplitude
  })

  return ref
}

// Hook for rotation animation
export function useRotation(speed = 1) {
  const ref = useRef<any>(null)

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * speed
  })

  return ref
}

// Hook for pulse animation
export function usePulse(minScale = 0.8, maxScale = 1.2, speed = 1) {
  const ref = useRef<any>(null)

  useFrame((state) => {
    if (!ref.current) return
    const scale = minScale + (Math.sin(state.clock.elapsedTime * speed) + 1) * 0.5 * (maxScale - minScale)
    ref.current.scale.setScalar(scale)
  })

  return ref
}

// Hook for fade in animation
export function useFadeIn(duration = 1, delay = 0) {
  const ref = useRef<any>(null)

  useEffect(() => {
    if (!ref.current || !ref.current.material) return

    gsap.from(ref.current.material, {
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out'
    })
  }, [duration, delay])

  return ref
}

// Hook for camera shake
export function useCameraShake(intensity = 0.1, enabled = false) {
  useFrame((state) => {
    if (!enabled) return

    state.camera.position.x += (Math.random() - 0.5) * intensity
    state.camera.position.y += (Math.random() - 0.5) * intensity
  })
}

// Hook for smooth position transition
export function useSmoothPosition(targetPosition: [number, number, number], duration = 1) {
  const ref = useRef<any>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.to(ref.current.position, {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
      duration,
      ease: 'power3.inOut'
    })
  }, [targetPosition, duration])

  return ref
}

