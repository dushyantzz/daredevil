'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3 } from 'three'
import { Html, Line, Text } from '@react-three/drei'

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

  const { positions, colors, scales, edgePairs, categoryClusters } = useMemo(() => {

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

    // --- Build lightweight "relationship" edges like the GNN view ---
    // Connect points that share the same contact (chat/call) or same filename group (image/video) when available.
    const byKey = new Map<string, number[]>()
    data.forEach((p, idx) => {
      const md = p.metadata || {}
      const contact = md.contact || md.name || null
      const filename = md.filename || md.file || null
      const key =
        contact ? `contact:${String(contact)}` :
        filename ? `file:${String(filename)}` :
        `cat:${p.category}`
      const arr = byKey.get(key) || []
      arr.push(idx)
      byKey.set(key, arr)
    })

    const edgePairs: Array<[[number, number, number], [number, number, number]]> = []
    const MAX_EDGES_PER_GROUP = 12
    for (const [, indices] of byKey.entries()) {
      if (indices.length < 2) continue
      const slice = indices.slice(0, MAX_EDGES_PER_GROUP)
      for (let i = 0; i < slice.length - 1; i++) {
        const a = positions[slice[i]]
        const b = positions[slice[i + 1]]
        edgePairs.push(
          [[a.x, a.y, a.z], [b.x, b.y, b.z]]
        )
      }
    }

    // --- Category cluster bubbles (like community/alias spheres) ---
    const clusterMap = new Map<string, number[]>()
    data.forEach((p, idx) => {
      const arr = clusterMap.get(p.category) || []
      arr.push(idx)
      clusterMap.set(p.category, arr)
    })

    const categoryClusters = Array.from(clusterMap.entries()).map(([category, idxs]) => {
      const center = new Vector3(0, 0, 0)
      idxs.forEach(i => center.add(positions[i]))
      center.multiplyScalar(1 / Math.max(1, idxs.length))

      let maxDist = 0.5
      idxs.forEach(i => {
        maxDist = Math.max(maxDist, center.distanceTo(positions[i]))
      })

      return {
        category,
        center: [center.x, center.y, center.z] as [number, number, number],
        radius: Math.min(8, Math.max(1.2, maxDist + 0.8)),
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS.default,
        count: idxs.length
      }
    })

    return { positions, colors, scales, edgePairs, categoryClusters }

  }, [data])

  useFrame((state) => {

    if (!meshRef.current || !isAnimating) return

    const clock: any = (state as any)?.clock
    const time =
      typeof clock?.getElapsedTime === 'function'
        ? clock.getElapsedTime()
        : typeof clock?.elapsedTime === 'number'
          ? clock.elapsedTime
          : 0
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
      {/* GNN-style connection edges (thick + visible) */}
      {edgePairs.slice(0, 120).map((pair, idx) => (
        <Line
          key={`edge-${idx}`}
          points={pair}
          color="#FF1493"
          lineWidth={1.5}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      ))}

      {/* Category cluster bubbles */}
      {categoryClusters.map((cluster) => (
        <mesh key={`cluster-${cluster.category}`} position={cluster.center}>
          <sphereGeometry args={[cluster.radius, 20, 20]} />
          <meshBasicMaterial
            color={cluster.color}
            transparent
            opacity={0.12}
            wireframe
          />
          <Html position={[0, cluster.radius + 0.6, 0]}>
            <div className="bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none border border-white/10">
              {cluster.category.toUpperCase()} ({cluster.count})
            </div>
          </Html>
        </mesh>
      ))}

      {/* @ts-ignore */}
      <instancedMesh
        ref={meshRef}
        args={[undefined as any, undefined as any, data.length]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >

        {/* @ts-ignore */}
        <sphereGeometry args={[0.3, 32, 32]} />

        {/* @ts-ignore */}
        <meshStandardMaterial
          metalness={0.7}
          roughness={0.2}
          emissive="#ffffff"
          emissiveIntensity={0.55}
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

        <>
          {/* @ts-ignore */}
          <mesh position={positions[selectedIndex].toArray()}>

            {/* @ts-ignore */}
            <sphereGeometry args={[0.5, 32, 32]} />

            {/* @ts-ignore */}
            <meshBasicMaterial
              color={CATEGORY_COLORS[data[selectedIndex].category]}
              transparent
              opacity={0.2}
              wireframe
            />

          </mesh>
        </>
      )}
    </>
  )
}