'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3 } from 'three'
import { Html, Text } from '@react-three/drei'

interface DataPoint {
  id: string
  position: [number, number, number]
  category: string
  value: number
  label: string
  metadata?: any
}

interface DataVisualizerProps {
  data: DataPoint[]
  isAnimating?: boolean
  onPointClick?: (point: DataPoint) => void
}

const CATEGORY_COLORS: { [key: string]: string } = {
  chat: '#3b82f6',
  call: '#10b981',
  image: '#f59e0b',
  video: '#ef4444',
  app: '#8b5cf6',
  location: '#ec4899',
  default: '#6b7280'
}

const CATEGORY_ICONS: { [key: string]: string } = {
  chat: '💬',
  call: '📞',
  image: '🖼️',
  video: '🎥',
  app: '📱',
  location: '📍',
  default: '⚫'
}

export default function DataVisualizer({
  data,
  isAnimating = false,
  onPointClick
}: DataVisualizerProps) {

  const meshRef = useRef<InstancedMesh | null>(null)

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const { positions, colors, scales } = useMemo(() => {

    const positions: Vector3[] = []
    const colors: Color[] = []
    const scales: number[] = []

    data.forEach((point) => {

      positions.push(new Vector3(...point.position))

      const color = new Color(
        CATEGORY_COLORS[point.category] || CATEGORY_COLORS.default
      )

      colors.push(color)

      scales.push((point.value || 1) * 0.3)

    })

    return { positions, colors, scales }

  }, [data])

  useFrame((state) => {

    if (!meshRef.current || !isAnimating) return

    const time = state.clock.elapsedTime
    const temp = new Object3D()

    for (let i = 0; i < data.length; i++) {

      const position = positions[i]

      temp.position.set(
        position.x,
        position.y + Math.sin(time + i * 0.1) * 0.2,
        position.z
      )

      temp.rotation.y = time * 0.5 + i * 0.1

      const scale = scales[i] * (1 + Math.sin(time * 2 + i * 0.2) * 0.1)

      temp.scale.setScalar(scale)

      temp.updateMatrix()

      meshRef.current.setMatrixAt(i, temp.matrix)

    }

    meshRef.current.instanceMatrix.needsUpdate = true

  })

  useMemo(() => {

    if (!meshRef.current) return

    const temp = new Object3D()

    for (let i = 0; i < data.length; i++) {

      const position = positions[i]

      temp.position.set(position.x, position.y, position.z)

      temp.scale.setScalar(scales[i])

      temp.updateMatrix()

      meshRef.current.setMatrixAt(i, temp.matrix)

    }

    meshRef.current.instanceMatrix.needsUpdate = true

  }, [data, positions, scales])

  useMemo(() => {

    if (!meshRef.current) return

    colors.forEach((color, i) => {

      meshRef.current!.setColorAt(i, color)

    })

    if (meshRef.current.instanceColor) {

      meshRef.current.instanceColor.needsUpdate = true

    }

  }, [colors])

  const handlePointerOver = (event: any) => {

    event.stopPropagation()

    setHoveredIndex(event.instanceId)

    document.body.style.cursor = 'pointer'

  }

  const handlePointerOut = () => {

    setHoveredIndex(null)

    document.body.style.cursor = 'default'

  }

  const handleClick = (event: any) => {

    event.stopPropagation()

    const point = data[event.instanceId]

    setSelectedIndex(event.instanceId)

    onPointClick?.(point)

  }

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined as any, undefined as any, data.length]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >

        <sphereGeometry args={[0.3, 32, 32]} />

        <meshStandardMaterial
          metalness={0.7}
          roughness={0.2}
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />

      </instancedMesh>

      {data.map((point, index) => (

        <Text
          key={point.id}
          position={[
            positions[index].x,
            positions[index].y + 0.5,
            positions[index].z
          ]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >

          {CATEGORY_ICONS[point.category] || CATEGORY_ICONS.default} {point.label}

        </Text>

      ))}

      {hoveredIndex !== null && (

        <Html position={[
          positions[hoveredIndex].x,
          positions[hoveredIndex].y + 1,
          positions[hoveredIndex].z
        ]}>

          <div className="bg-black/80 text-white px-3 py-2 rounded text-xs">

            <div className="font-bold">

              {data[hoveredIndex].label}

            </div>

            <div>Category: {data[hoveredIndex].category}</div>

            <div>Value: {data[hoveredIndex].value}</div>

          </div>

        </Html>

      )}

      {selectedIndex !== null && (

        <mesh position={positions[selectedIndex].toArray()}>

          <sphereGeometry args={[0.5, 32, 32]} />

          <meshBasicMaterial
            color={CATEGORY_COLORS[data[selectedIndex].category]}
            transparent
            opacity={0.2}
            wireframe
          />

        </mesh>

      )}
    </>
  )
}