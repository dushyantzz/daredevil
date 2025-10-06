'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import gsap from 'gsap'

interface InteractiveControlsProps {
  focusPoint?: [number, number, number] | null
  viewPreset?: 'top' | 'side' | 'isometric' | 'default' | null
  onAnimationComplete?: () => void
}

export default function InteractiveControls({
  focusPoint,
  viewPreset,
  onAnimationComplete
}: InteractiveControlsProps) {
  const { camera, controls } = useThree()
  const animatingRef = useRef(false)

  // Handle focus point animation
  useEffect(() => {
    if (!focusPoint || !controls || animatingRef.current) return

    animatingRef.current = true

    const targetPosition = new Vector3(...focusPoint)
    const cameraOffset = new Vector3(3, 3, 3)
    const newCameraPosition = targetPosition.clone().add(cameraOffset)

    // Animate camera
    gsap.to(camera.position, {
      x: newCameraPosition.x,
      y: newCameraPosition.y,
      z: newCameraPosition.z,
      duration: 1.5,
      ease: 'power3.inOut',
      onUpdate: () => {
        camera.lookAt(targetPosition)
      },
      onComplete: () => {
        animatingRef.current = false
        if (onAnimationComplete) onAnimationComplete()
      }
    })

    // Animate controls target
    if ('target' in controls) {
      gsap.to((controls as any).target, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.5,
        ease: 'power3.inOut'
      })
    }
  }, [focusPoint, camera, controls, onAnimationComplete])

  // Handle view preset changes
  useEffect(() => {
    if (!viewPreset || !controls || animatingRef.current) return

    animatingRef.current = true

    const presets = {
      top: { position: [0, 20, 0], target: [0, 0, 0] },
      side: { position: [20, 5, 0], target: [0, 0, 0] },
      isometric: { position: [10, 10, 10], target: [0, 0, 0] },
      default: { position: [0, 5, 10], target: [0, 0, 0] }
    }

    const preset = presets[viewPreset]
    const targetPosition = new Vector3(...preset.target as [number, number, number])

    // Animate camera
    gsap.to(camera.position, {
      x: preset.position[0],
      y: preset.position[1],
      z: preset.position[2],
      duration: 1.5,
      ease: 'power3.inOut',
      onUpdate: () => {
        camera.lookAt(targetPosition)
      },
      onComplete: () => {
        animatingRef.current = false
        if (onAnimationComplete) onAnimationComplete()
      }
    })

    // Animate controls target
    if ('target' in controls) {
      gsap.to((controls as any).target, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.5,
        ease: 'power3.inOut'
      })
    }
  }, [viewPreset, camera, controls, onAnimationComplete])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (animatingRef.current) return

      switch (event.key.toLowerCase()) {
        case 'r':
          // Reset view
          animatingRef.current = true
          gsap.to(camera.position, {
            x: 0,
            y: 5,
            z: 10,
            duration: 1,
            ease: 'power2.inOut',
            onComplete: () => {
              animatingRef.current = false
            }
          })
          if (controls && 'target' in controls) {
            gsap.to((controls as any).target, {
              x: 0,
              y: 0,
              z: 0,
              duration: 1,
              ease: 'power2.inOut'
            })
          }
          break
        
        case 'f':
          // Focus on center
          if (controls && 'target' in controls) {
            animatingRef.current = true
            const target = (controls as any).target
            const offset = camera.position.clone().sub(target).normalize().multiplyScalar(10)
            
            gsap.to(camera.position, {
              x: offset.x,
              y: offset.y + 5,
              z: offset.z,
              duration: 1,
              ease: 'power2.inOut',
              onComplete: () => {
                animatingRef.current = false
              }
            })
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [camera, controls])

  return null
}

