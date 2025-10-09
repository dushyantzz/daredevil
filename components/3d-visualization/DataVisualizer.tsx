'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3, BufferGeometry, Line as ThreeLine } from 'three'
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
  chat: '#3b82f6',      // Blue
  call: '#10b981',      // Green
  image: '#f59e0b',     // Amber
  video: '#ef4444',     // Red
  app: '#8b5cf6',       // Purple
  location: '#ec4899',  // Pink
  default: '#6b7280'    // Gray
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
  const meshRef = useRef<InstancedMesh>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Create instanced mesh data
  const { positions, colors, scales } = useMemo(() => {
    const positions: Vector3[] = []
    const colors: Color[] = []
    const scales: number[] = []

    data.forEach((point) => {
      positions.push(new Vector3(...point.position))
      const color = new Color(CATEGORY_COLORS[point.category] || CATEGORY_COLORS.default)
      colors.push(color)
      scales.push((point.value || 1) * 0.3) // Smaller base size
    })

    return { positions, colors, scales }
  }, [data])

  // Animation
  useFrame((state) => {
    if (!meshRef.current || !isAnimating) return

    const time = state.clock.elapsedTime
    const tempObject = new Object3D()

    for (let i = 0; i < data.length; i++) {
      const position = positions[i]
      
      // Floating animation
      tempObject.position.set(
        position.x,
        position.y + Math.sin(time + i * 0.1) * 0.2,
        position.z
      )
      
      // Rotation
      tempObject.rotation.y = time * 0.5 + i * 0.1
      
      // Scale pulse
      const scale = scales[i] * (1 + Math.sin(time * 2 + i * 0.2) * 0.1)
      tempObject.scale.setScalar(scale)
      
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // Initialize instance matrices
  useMemo(() => {
    if (!meshRef.current) return

    const tempObject = new Object3D()
    
    for (let i = 0; i < data.length; i++) {
      const position = positions[i]
      tempObject.position.set(position.x, position.y, position.z)
      tempObject.scale.setScalar(scales[i])
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [data, positions, scales])

  // Set colors
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
    if (onPointClick) {
      onPointClick(point)
    }
  }

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, data.length]}
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

      {/* Permanent labels for all points */}
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

      {/* Hover tooltip with detailed info */}
      {hoveredIndex !== null && (
        <Html position={[
          positions[hoveredIndex].x,
          positions[hoveredIndex].y + 1,
          positions[hoveredIndex].z
        ]}>
          <div className="bg-gradient-to-br from-blue-600/90 to-purple-600/90 backdrop-blur-md text-white px-4 py-3 rounded-xl text-sm whitespace-nowrap pointer-events-none shadow-2xl border border-white/20">
            <div className="font-bold text-base mb-2 flex items-center gap-2">
              <span className="text-2xl">{CATEGORY_ICONS[data[hoveredIndex].category]}</span>
              {data[hoveredIndex].label}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-blue-200">Category:</span>
                <span className="font-semibold">{data[hoveredIndex].category}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-blue-200">Value:</span>
                <span className="font-semibold">{data[hoveredIndex].value}</span>
              </div>
              {data[hoveredIndex].metadata && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <span className="text-blue-200">Click for details</span>
                </div>
              )}
            </div>
          </div>
        </Html>
      )}

      {/* Selection highlight */}
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

      {/* Network connections with better visibility */}
      {data.length > 1 && (
        <NetworkConnections
          data={data}
          positions={positions}
          selectedIndex={selectedIndex}
          hoveredIndex={hoveredIndex}
        />
      )}
    </>
  )
}

// Network connections component with better visualization
function NetworkConnections({
  data,
  positions,
  selectedIndex,
  hoveredIndex
}: {
  data: DataPoint[]
  positions: Vector3[]
  selectedIndex: number | null
  hoveredIndex: number | null
}) {
  const linesRef = useRef<any>(null)

  const connections = useMemo(() => {
    const lines: Array<{
      start: Vector3
      end: Vector3
      distance: number
      categories: [string, string]
      isHighlighted: boolean
    }> = []

    // Create connections between nearby points
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = positions[i].distanceTo(positions[j])

        // Only connect points within a certain distance
        if (distance < 8) {
          const isHighlighted =
            (selectedIndex !== null && (i === selectedIndex || j === selectedIndex)) ||
            (hoveredIndex !== null && (i === hoveredIndex || j === hoveredIndex))

          lines.push({
            start: positions[i],
            end: positions[j],
            distance,
            categories: [data[i].category, data[j].category],
            isHighlighted
          })
        }
      }
    }

    return lines
  }, [positions, data, selectedIndex, hoveredIndex])

  return (
    <group ref={linesRef}>
      {connections.map((connection, index) => (
        <ConnectionLine
          key={index}
          {...connection}
        />
      ))}
    </group>
  )
}

// Enhanced connection line with gradient and animation
function ConnectionLine({
  start,
  end,
  distance,
  categories,
  isHighlighted
}: {
  start: Vector3
  end: Vector3
  distance: number
  categories: [string, string]
  isHighlighted: boolean
}) {
  const ref = useRef<any>(null)
  const particleRef = useRef<any>(null)

  useFrame((state) => {
    if (!ref.current) return

    // Pulsing opacity based on distance (closer = more visible)
    const baseOpacity = isHighlighted ? 0.6 : Math.max(0.1, 1 - distance / 8)
    ref.current.material.opacity = baseOpacity + Math.sin(state.clock.elapsedTime * 2) * 0.1

    // Animate particle along the line
    if (particleRef.current) {
      const t = (Math.sin(state.clock.elapsedTime + distance) + 1) / 2
      particleRef.current.position.lerpVectors(start, end, t)
    }
  })

  const points = useMemo(() => {
    return [start, end]
  }, [start, end])

  // Determine line color based on categories
  const lineColor = useMemo(() => {
    if (isHighlighted) return '#ffffff'
    if (categories[0] === categories[1]) {
      return CATEGORY_COLORS[categories[0]] || CATEGORY_COLORS.default
    }
    return '#6b7280' // Gray for cross-category connections
  }, [categories, isHighlighted])

  return (
    <>
      <line ref={ref}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={lineColor}
          transparent
          opacity={0.3}
          linewidth={isHighlighted ? 3 : 1}
        />
      </line>

      {/* Animated particle traveling along the connection */}
      {isHighlighted && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={lineColor} />
        </mesh>
      )}

      {/* Connection label for highlighted connections */}
      {isHighlighted && (
        <Html position={[
          (start.x + end.x) / 2,
          (start.y + end.y) / 2 + 0.3,
          (start.z + end.z) / 2
        ]}>
          <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
            {distance.toFixed(1)} units
          </div>
        </Html>
      )}
    </>
  )
}

