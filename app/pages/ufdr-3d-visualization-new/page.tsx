'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Play, Pause, Eye, Maximize2, Grid3x3, Box } from 'lucide-react'
import Scene3D from '@/components/3d-visualization/Scene3D'
import DataVisualizer from '@/components/3d-visualization/DataVisualizer'
import InteractiveControls from '@/components/3d-visualization/InteractiveControls'
import FloatingUI from '@/components/3d-visualization/FloatingUI'
import ParticleBackground from '@/components/3d-visualization/ParticleBackground'

interface DataPoint {
  id: string
  position: [number, number, number]
  category: string
  value: number
  label: string
  metadata?: any
}

interface UFDRData {
  chats?: any[]
  calls?: any[]
  images?: any[]
  videos?: any[]
  appData?: any[]
  metadata?: any
}

export default function UFDR3DVisualizationNew() {
  const [ufdrData, setUfdrData] = useState<UFDRData | null>(null)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [isAnimating, setIsAnimating] = useState(true)
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null)
  const [viewPreset, setViewPreset] = useState<'top' | 'side' | 'isometric' | 'default' | null>(null)
  const [focusPoint, setFocusPoint] = useState<[number, number, number] | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Parse UFDR data into 3D data points
  const parseUFDRData = useCallback((data: UFDRData) => {
    const points: DataPoint[] = []
    let index = 0

    // Parse chats
    if (data.chats) {
      data.chats.forEach((chat, i) => {
        points.push({
          id: `chat-${i}`,
          position: [
            (Math.random() - 0.5) * 10,
            Math.random() * 5,
            (Math.random() - 0.5) * 10
          ],
          category: 'chat',
          value: 1,
          label: chat.contact || `Chat ${i + 1}`,
          metadata: chat
        })
      })
    }

    // Parse calls
    if (data.calls) {
      data.calls.forEach((call, i) => {
        points.push({
          id: `call-${i}`,
          position: [
            (Math.random() - 0.5) * 10,
            Math.random() * 5 + 5,
            (Math.random() - 0.5) * 10
          ],
          category: 'call',
          value: call.duration || 1,
          label: call.contact || `Call ${i + 1}`,
          metadata: call
        })
      })
    }

    // Parse images
    if (data.images) {
      data.images.forEach((image, i) => {
        points.push({
          id: `image-${i}`,
          position: [
            (Math.random() - 0.5) * 10 + 5,
            Math.random() * 5,
            (Math.random() - 0.5) * 10
          ],
          category: 'image',
          value: 0.8,
          label: image.name || `Image ${i + 1}`,
          metadata: image
        })
      })
    }

    // Parse videos
    if (data.videos) {
      data.videos.forEach((video, i) => {
        points.push({
          id: `video-${i}`,
          position: [
            (Math.random() - 0.5) * 10 - 5,
            Math.random() * 5,
            (Math.random() - 0.5) * 10
          ],
          category: 'video',
          value: 1.2,
          label: video.name || `Video ${i + 1}`,
          metadata: video
        })
      })
    }

    // Parse app data
    if (data.appData) {
      data.appData.forEach((app, i) => {
        points.push({
          id: `app-${i}`,
          position: [
            (Math.random() - 0.5) * 10,
            Math.random() * 5,
            (Math.random() - 0.5) * 10 + 5
          ],
          category: 'app',
          value: 0.9,
          label: app.name || `App ${i + 1}`,
          metadata: app
        })
      })
    }

    return points
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      setUfdrData(data)
      const points = parseUFDRData(data)
      setDataPoints(points)
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Error parsing file. Please ensure it\'s a valid JSON file.')
    } finally {
      setIsUploading(false)
    }
  }, [parseUFDRData])

  // Handle point click
  const handlePointClick = useCallback((point: DataPoint) => {
    setSelectedPoint(point)
    setFocusPoint(point.position)
  }, [])

  // Handle export
  const handleExport = useCallback(() => {
    // Capture screenshot logic would go here
    console.log('Export functionality')
  }, [])

  // Handle reset
  const handleReset = useCallback(() => {
    setViewPreset('default')
    setSelectedPoint(null)
    setFocusPoint(null)
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const categories = new Set(dataPoints.map(p => p.category))
    return {
      totalPoints: dataPoints.length,
      categories: categories.size,
      connections: Math.floor(dataPoints.length * 1.5)
    }
  }, [dataPoints])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'e':
          handleExport()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleExport])

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-pink-500/5 pointer-events-none z-10" />

      {/* Upload Area */}
      <AnimatePresence>
        {dataPoints.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md border-2 border-dashed border-white/30 rounded-2xl p-12 text-center max-w-md"
            >
              <div className="mb-6">
                <Upload className="h-16 w-16 mx-auto text-blue-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Upload UFDR Data
                </h2>
                <p className="text-gray-300 text-sm">
                  Upload your forensic data JSON file to visualize in stunning 3D
                </p>
              </div>

              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg cursor-pointer transition-colors inline-block"
                >
                  {isUploading ? 'Processing...' : 'Choose File'}
                </motion.div>
              </label>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Scene */}
      {dataPoints.length > 0 && (
        <>
          <Scene3D enableBloom={true}>
            <ParticleBackground />
            <DataVisualizer
              data={dataPoints}
              isAnimating={isAnimating}
              onPointClick={handlePointClick}
            />
            <InteractiveControls
              focusPoint={focusPoint}
              viewPreset={viewPreset}
              onAnimationComplete={() => {
                setFocusPoint(null)
                setViewPreset(null)
              }}
            />
          </Scene3D>

          {/* Floating UI */}
          <FloatingUI
            selectedPoint={selectedPoint}
            onClose={() => setSelectedPoint(null)}
            onExport={handleExport}
            onReset={handleReset}
            stats={stats}
          />

          {/* View Presets */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {[
              { name: 'Top', value: 'top' as const, icon: Grid3x3 },
              { name: 'Side', value: 'side' as const, icon: Box },
              { name: 'Iso', value: 'isometric' as const, icon: Maximize2 },
              { name: 'Default', value: 'default' as const, icon: Eye }
            ].map((preset) => {
              const Icon = preset.icon
              return (
                <motion.button
                  key={preset.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewPreset(preset.value)}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {preset.name}
                </motion.button>
              )
            })}
          </div>

          {/* Animation Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAnimating(!isAnimating)}
            className="absolute top-20 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 text-white hover:bg-white/20 transition-colors z-30"
          >
            {isAnimating ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </motion.button>
        </>
      )}
    </div>
  )
}

