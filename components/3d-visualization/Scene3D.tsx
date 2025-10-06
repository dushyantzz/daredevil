'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei'
import { Suspense } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import LoadingFallback from './LoadingFallback'

interface Scene3DProps {
  children: React.ReactNode
  cameraPosition?: [number, number, number]
  enableBloom?: boolean
}

export default function Scene3D({ 
  children, 
  cameraPosition = [0, 5, 10],
  enableBloom = true 
}: Scene3DProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        className="bg-[#0a0a0a]"
      >
        {/* Camera Setup */}
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={75}
          near={0.1}
          far={1000}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4a9eff" />
        <pointLight position={[10, -10, -5]} intensity={0.3} color="#ff4a9e" />

        {/* Fog for depth perception */}
        <fog attach="fog" args={['#0a0a0a', 10, 50]} />

        {/* Environment */}
        <Environment preset="night" />

        {/* Grid Floor */}
        <Grid
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#3b82f6"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
          position={[0, -2, 0]}
        />

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={50}
          maxPolarAngle={Math.PI / 1.5}
          rotateSpeed={0.5}
          zoomSpeed={1}
          panSpeed={0.8}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />

        {/* Main Content */}
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>

        {/* Post Processing Effects */}
        {enableBloom && (
          <EffectComposer>
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.9}
              height={300}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}

