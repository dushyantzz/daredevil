'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3, BufferGeometry, Group } from 'three'
import { Html, Text } from '@react-three/drei'

function getClockTime(state: any): number {
  const clock = state?.clock
  if (clock && typeof clock.getElapsedTime === 'function') return clock.getElapsedTime()
  if (clock && typeof clock.elapsedTime === 'number') return clock.elapsedTime
  return 0
}

interface GNNNode {
  id: string
  x: number
  y: number
  z: number
  size: number
  color: string
  platforms: string[]
  locations: string[]
  interactions: number
  call_duration: number
}

interface GNNEdge {
  source: string
  target: string
  sourcePos: [number, number, number]
  targetPos: [number, number, number]
  weight: number
  type: string
}

interface AliasCluster {
  id: string
  center: [number, number, number]
  radius: number
  entity_count: number
  entities: string[]
  color: string
}

interface HiddenRelationshipIndicator {
  source: string
  target: string
  sourcePos: [number, number, number]
  targetPos: [number, number, number]
  type: string
  strength: number
  confidence: number
  evidence: string
  color: string
}

interface CommunityCluster {
  id: string
  center: [number, number, number]
  radius: number
  member_count: number
  members: string[]
  color: string
}

interface GNNVisualizationData {
  nodes: GNNNode[]
  edges: GNNEdge[]
  alias_clusters: AliasCluster[]
  hidden_relationship_indicators: HiddenRelationshipIndicator[]
  community_clusters: CommunityCluster[]
}

interface GNNDataVisualizerProps {
  data: GNNVisualizationData | null
  showAliasClusters: boolean
  showHiddenRelationships: boolean
  showCommunityClusters: boolean
  confidenceThreshold: number
  isAnimating?: boolean
  onNodeClick?: (node: GNNNode) => void
  onRelationshipClick?: (relationship: HiddenRelationshipIndicator) => void
}

const NODE_COLORS: { [key: string]: string } = {
  high_connected: '#FF6B6B',    // Red
  medium_connected: '#4ECDC4',  // Teal
  low_connected: '#45B7D1',     // Blue
  default: '#6b7280'            // Gray
}

const RELATIONSHIP_TYPE_COLORS: { [key: string]: string } = {
  common_neighbors: '#FF1493',   // Hot pink
  short_path: '#FF69B4',         // Hot pink
  community_member: '#DA70D6',   // Orchid
  default: '#FF1493'
}

export default function GNNDataVisualizer({
  data,
  showAliasClusters,
  showHiddenRelationships,
  showCommunityClusters,
  confidenceThreshold,
  isAnimating = false,
  onNodeClick,
  onRelationshipClick
}: GNNDataVisualizerProps) {
  const nodesMeshRef = useRef<InstancedMesh>(null)
  const [hoveredNodeIndex, setHoveredNodeIndex] = useState<number | null>(null)
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null)
  const [hoveredRelationshipIndex, setHoveredRelationshipIndex] = useState<number | null>(null)

  // Prepare node data for instanced rendering
  const { nodePositions, nodeColors, nodeScales } = useMemo(() => {
    if (!data?.nodes) return { nodePositions: [], nodeColors: [], nodeScales: [] }

    const positions: Vector3[] = []
    const colors: Color[] = []
    const scales: number[] = []

    data.nodes.forEach((node) => {
      positions.push(new Vector3(node.x, node.y, node.z))
      colors.push(new Color(node.color))
      scales.push(node.size * 0.1) // Scale down for better visibility
    })

    return { nodePositions: positions, nodeColors: colors, nodeScales: scales }
  }, [data?.nodes])

  // Filter relationships by confidence threshold
  const filteredRelationships = useMemo(() => {
    if (!data?.hidden_relationship_indicators) return []
    return data.hidden_relationship_indicators.filter(
      rel => rel.confidence >= confidenceThreshold
    )
  }, [data?.hidden_relationship_indicators, confidenceThreshold])

  // Animation frame updates
  useFrame((state) => {
    if (!nodesMeshRef.current || !data?.nodes || !isAnimating) return

    const time = getClockTime(state)
    const tempObject = new Object3D()

    for (let i = 0; i < data.nodes.length; i++) {
      const position = nodePositions[i]
      
      // Floating animation with different phases for each node
      tempObject.position.set(
        position.x,
        position.y + Math.sin(time * 0.5 + i * 0.2) * 0.3,
        position.z
      )
      
      // Rotation based on node properties
      tempObject.rotation.y = time * 0.3 + i * 0.1
      tempObject.rotation.z = Math.sin(time + i * 0.3) * 0.1
      
      // Scale pulse based on interactions
      const interactionFactor = Math.min(data.nodes[i].interactions / 10, 2)
      const scale = nodeScales[i] * (1 + Math.sin(time * 2 + i * 0.2) * 0.1 * interactionFactor)
      tempObject.scale.setScalar(scale)
      
      tempObject.updateMatrix()
      nodesMeshRef.current.setMatrixAt(i, tempObject.matrix)
    }

    nodesMeshRef.current.instanceMatrix.needsUpdate = true
  })

  // Initialize node matrices
  useEffect(() => {
    if (!nodesMeshRef.current || !data?.nodes) return

    const tempObject = new Object3D()
    
    for (let i = 0; i < data.nodes.length; i++) {
      const position = nodePositions[i]
      tempObject.position.set(position.x, position.y, position.z)
      tempObject.scale.setScalar(nodeScales[i])
      tempObject.updateMatrix()
      nodesMeshRef.current.setMatrixAt(i, tempObject.matrix)
    }

    nodesMeshRef.current.instanceMatrix.needsUpdate = true
  }, [data?.nodes, nodePositions, nodeScales])

  // Set node colors
  useEffect(() => {
    if (!nodesMeshRef.current || !data?.nodes) return

    nodeColors.forEach((color, i) => {
      nodesMeshRef.current!.setColorAt(i, color)
    })

    if (nodesMeshRef.current.instanceColor) {
      nodesMeshRef.current.instanceColor.needsUpdate = true
    }
  }, [nodeColors, data?.nodes])

  const handleNodePointerOver = (event: any) => {
    event.stopPropagation()
    setHoveredNodeIndex(event.instanceId)
    document.body.style.cursor = 'pointer'
  }

  const handleNodePointerOut = () => {
    setHoveredNodeIndex(null)
    document.body.style.cursor = 'default'
  }

  const handleNodeClick = (event: any) => {
    event.stopPropagation()
    const node = data?.nodes[event.instanceId]
    setSelectedNodeIndex(event.instanceId)
    if (onNodeClick && node) {
      onNodeClick(node)
    }
  }

  if (!data) return null

  return (
    <group>
      {/* Main nodes */}
      <instancedMesh
        ref={nodesMeshRef}
        args={[undefined, undefined, data.nodes.length]}
        onPointerOver={handleNodePointerOver}
        onPointerOut={handleNodePointerOut}
        onClick={handleNodeClick}
      >
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          metalness={0.8}
          roughness={0.2}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* Node labels */}
      {data.nodes.map((node, index) => (
        <Text
          key={node.id}
          position={[nodePositions[index].x, nodePositions[index].y + 0.8, nodePositions[index].z]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {node.id}
        </Text>
      ))}

      {/* Direct edges */}
      {data.edges.map((edge, index) => (
        <DirectEdge
          key={`edge-${index}`}
          edge={edge}
          isHighlighted={false}
        />
      ))}

      {/* Hidden relationship indicators */}
      {showHiddenRelationships && filteredRelationships.map((relationship, index) => (
        <HiddenRelationshipLine
          key={`hidden-${index}`}
          relationship={relationship}
          isHighlighted={hoveredRelationshipIndex === index}
          onPointerOver={() => setHoveredRelationshipIndex(index)}
          onPointerOut={() => setHoveredRelationshipIndex(null)}
          onClick={() => onRelationshipClick?.(relationship)}
        />
      ))}

      {/* Alias clusters */}
      {showAliasClusters && data.alias_clusters.map((cluster, index) => (
        <AliasClusterVisualization
          key={`alias-${index}`}
          cluster={cluster}
          isAnimating={isAnimating}
        />
      ))}

      {/* Community clusters */}
      {showCommunityClusters && data.community_clusters.map((cluster, index) => (
        <CommunityClusterVisualization
          key={`community-${index}`}
          cluster={cluster}
          isAnimating={isAnimating}
        />
      ))}

      {/* Hover tooltips */}
      {hoveredNodeIndex !== null && data.nodes[hoveredNodeIndex] && (
        <NodeTooltip
          node={data.nodes[hoveredNodeIndex]}
          position={nodePositions[hoveredNodeIndex]}
        />
      )}

      {/* Selection highlight */}
      {selectedNodeIndex !== null && data.nodes[selectedNodeIndex] && (
        <SelectionHighlight
          position={nodePositions[selectedNodeIndex]}
          color={data.nodes[selectedNodeIndex].color}
        />
      )}
    </group>
  )
}

// Direct edge component
function DirectEdge({ edge, isHighlighted }: { edge: GNNEdge; isHighlighted: boolean }) {
  const points = useMemo(() => [
    new Vector3(...edge.sourcePos),
    new Vector3(...edge.targetPos)
  ], [edge.sourcePos, edge.targetPos])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#6b7280"
        transparent
        opacity={isHighlighted ? 0.8 : 0.4}
        linewidth={isHighlighted ? 3 : 1}
      />
    </line>
  )
}

// Hidden relationship line component
function HiddenRelationshipLine({
  relationship,
  isHighlighted,
  onPointerOver,
  onPointerOut,
  onClick
}: {
  relationship: HiddenRelationshipIndicator
  isHighlighted: boolean
  onPointerOver: () => void
  onPointerOut: () => void
  onClick: () => void
}) {
  const ref = useRef<any>(null)
  const particleRef = useRef<any>(null)

  useFrame((state) => {
    if (!ref.current) return

    // Pulsing animation
    const pulse = Math.sin(getClockTime(state) * 3) * 0.3 + 0.7
    ref.current.material.opacity = pulse * (isHighlighted ? 0.9 : 0.6)

    // Animate particle along the line
    if (particleRef.current) {
      const t = (Math.sin(getClockTime(state) * 2) + 1) / 2
      particleRef.current.position.lerpVectors(
        new Vector3(...relationship.sourcePos),
        new Vector3(...relationship.targetPos),
        t
      )
    }
  })

  const points = useMemo(() => [
    new Vector3(...relationship.sourcePos),
    new Vector3(...relationship.targetPos)
  ], [relationship.sourcePos, relationship.targetPos])

  const lineColor = RELATIONSHIP_TYPE_COLORS[relationship.type] || RELATIONSHIP_TYPE_COLORS.default

  return (
    <group onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
      {/* Main line */}
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
          opacity={0.6}
          linewidth={isHighlighted ? 4 : 2}
        />
      </line>

      {/* Animated particle */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>

      {/* Relationship label */}
      {isHighlighted && (
        <Html position={[
          (relationship.sourcePos[0] + relationship.targetPos[0]) / 2,
          (relationship.sourcePos[1] + relationship.targetPos[1]) / 2 + 0.5,
          (relationship.sourcePos[2] + relationship.targetPos[2]) / 2
        ]}>
          <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs max-w-xs pointer-events-none">
            <div className="font-semibold text-pink-400 mb-1">
              Hidden Relationship ({relationship.type.replace('_', ' ')})
            </div>
            <div className="space-y-1">
              <div>Confidence: <span className="text-yellow-400">{(relationship.confidence * 100).toFixed(1)}%</span></div>
              <div>Strength: <span className="text-green-400">{relationship.strength.toFixed(2)}</span></div>
              <div className="text-xs text-gray-300 mt-2">{relationship.evidence}</div>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Alias cluster visualization
function AliasClusterVisualization({ cluster, isAnimating }: { cluster: AliasCluster; isAnimating: boolean }) {
  const ref = useRef<any>(null)

  useFrame((state) => {
    if (!ref.current || !isAnimating) return

    const time = getClockTime(state)
    const scale = 1 + Math.sin(time * 0.5) * 0.1
    ref.current.scale.setScalar(scale)
  })

  return (
    <mesh
      ref={ref}
      position={cluster.center}
    >
      <sphereGeometry args={[cluster.radius, 16, 16]} />
      <meshBasicMaterial
        color={cluster.color}
        transparent
        opacity={0.2}
        wireframe
      />
      
      {/* Cluster label */}
      <Html position={[0, cluster.radius + 0.5, 0]}>
        <div className="bg-yellow-500/20 backdrop-blur-sm text-yellow-400 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none border border-yellow-500/30">
          Alias Group ({cluster.entity_count} entities)
        </div>
      </Html>
    </mesh>
  )
}

// Community cluster visualization
function CommunityClusterVisualization({ cluster, isAnimating }: { cluster: CommunityCluster; isAnimating: boolean }) {
  const ref = useRef<any>(null)

  useFrame((state) => {
    if (!ref.current || !isAnimating) return

    const time = getClockTime(state)
    const scale = 1 + Math.sin(time * 0.3 + cluster.center[0]) * 0.05
    ref.current.scale.setScalar(scale)
  })

  return (
    <mesh
      ref={ref}
      position={cluster.center}
    >
      <sphereGeometry args={[cluster.radius, 20, 20]} />
      <meshBasicMaterial
        color={cluster.color}
        transparent
        opacity={0.15}
        wireframe
      />
      
      {/* Community label */}
      <Html position={[0, cluster.radius + 0.5, 0]}>
        <div className="bg-purple-500/20 backdrop-blur-sm text-purple-400 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none border border-purple-500/30">
          Community ({cluster.member_count} members)
        </div>
      </Html>
    </mesh>
  )
}

// Node tooltip component
function NodeTooltip({ node, position }: { node: GNNNode; position: Vector3 }) {
  return (
    <Html position={[position.x, position.y + 1.5, position.z]}>
      <div className="bg-gradient-to-br from-blue-600/90 to-purple-600/90 backdrop-blur-md text-white px-4 py-3 rounded-xl text-sm whitespace-nowrap pointer-events-none shadow-2xl border border-white/20 max-w-xs">
        <div className="font-bold text-base mb-2">{node.id}</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-blue-200">Interactions:</span>
            <span className="font-semibold">{node.interactions}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-blue-200">Call Duration:</span>
            <span className="font-semibold">{Math.round(node.call_duration)}s</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-blue-200">Platforms:</span>
            <span className="font-semibold">{node.platforms.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-blue-200">Locations:</span>
            <span className="font-semibold">{node.locations.length}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/20">
            <span className="text-blue-200">Click for details</span>
          </div>
        </div>
      </div>
    </Html>
  )
}

// Selection highlight component
function SelectionHighlight({ position, color }: { position: Vector3; color: string }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        wireframe
      />
    </mesh>
  )
}
