'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Play, Pause, Eye, Maximize2, Grid3x3, Box, Brain, Target, Link, Network } from 'lucide-react'
import Scene3D from '@/components/3d-visualization/Scene3D'
import GNNDataVisualizer from '@/components/gnn/GNNDataVisualizer'
import GNNAnalysisPanel from '@/components/gnn/GNNAnalysisPanel'
import InteractiveControls from '@/components/3d-visualization/InteractiveControls'
import FloatingUI from '@/components/3d-visualization/FloatingUI'
import ParticleBackground from '@/components/3d-visualization/ParticleBackground'

interface UFDRData {
  chats?: any[]
  calls?: any[]
  images?: any[]
  videos?: any[]
  appData?: any[]
  metadata?: any
}

interface GNNAnalysisData {
  alias_groups: Record<string, string[]>
  hidden_relationships: Array<{
    type: string
    source: string
    target: string
    strength: number
    evidence: string
    confidence: number
  }>
  interaction_graph: {
    nodes: Array<{
      id: string
      attributes: {
        platforms: string[]
        locations: string[]
        interactions: number
        call_duration: number
      }
    }>
    edges: Array<{
      source: string
      target: string
      weight: number
    }>
  }
  visualization_data: {
    nodes: Array<{
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
    }>
    edges: Array<{
      source: string
      target: string
      sourcePos: [number, number, number]
      targetPos: [number, number, number]
      weight: number
      type: string
    }>
    alias_clusters: Array<{
      id: string
      center: [number, number, number]
      radius: number
      entity_count: number
      entities: string[]
      color: string
    }>
    hidden_relationship_indicators: Array<{
      source: string
      target: string
      sourcePos: [number, number, number]
      targetPos: [number, number, number]
      type: string
      strength: number
      confidence: number
      evidence: string
      color: string
    }>
    community_clusters: Array<{
      id: string
      center: [number, number, number]
      radius: number
      member_count: number
      members: string[]
      color: string
    }>
  }
  metadata: {
    total_entities: number
    alias_groups_count: number
    hidden_relationships_count: number
    graph_nodes: number
    graph_edges: number
    processing_timestamp: string
  }
}

export default function UFDR3DVisualizationGNNPage() {
  const [ufdrData, setUfdrData] = useState<UFDRData | null>(null)
  const [gnnAnalysis, setGnnAnalysis] = useState<GNNAnalysisData | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [selectedRelationship, setSelectedRelationship] = useState<any>(null)
  const [viewPreset, setViewPreset] = useState<'top' | 'side' | 'isometric' | 'default' | null>(null)
  const [focusPoint, setFocusPoint] = useState<[number, number, number] | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  
  // GNN visualization controls
  const [showAliasClusters, setShowAliasClusters] = useState(true)
  const [showHiddenRelationships, setShowHiddenRelationships] = useState(true)
  const [showCommunityClusters, setShowCommunityClusters] = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5)

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      setUfdrData(data)
      
      // Automatically run GNN analysis
      await runGNNAnalysis(data)
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Error parsing file. Please ensure it\'s a valid JSON file.')
    } finally {
      setIsUploading(false)
    }
  }, [])

  // Load sample data
  const handleLoadSampleData = useCallback(async () => {
    setIsUploading(true)
    try {
      const response = await fetch('/sample-ufdr-data.json')
      const data = await response.json()
      setUfdrData(data)
      
      // Automatically run GNN analysis
      await runGNNAnalysis(data)
    } catch (error) {
      console.error('Error loading sample data:', error)
      alert('Error loading sample data.')
    } finally {
      setIsUploading(false)
    }
  }, [])

  // Run GNN analysis
  const runGNNAnalysis = useCallback(async (data: UFDRData) => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 10
        })
      }, 200)

      const response = await fetch('/api/gnn-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ufdrData: data,
          analysisType: 'full'
        }),
      })

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      if (!response.ok) {
        throw new Error('GNN analysis failed')
      }

      const result = await response.json()
      setGnnAnalysis(result.gnnAnalysis)
      
      // Small delay to show completion
      setTimeout(() => {
        setIsAnalyzing(false)
        setAnalysisProgress(0)
      }, 500)

    } catch (error) {
      console.error('GNN analysis error:', error)
      setIsAnalyzing(false)
      setAnalysisProgress(0)
      alert('GNN analysis failed. Please try again.')
    }
  }, [])

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node)
    setFocusPoint([node.x, node.y, node.z])
  }, [])

  // Handle relationship click
  const handleRelationshipClick = useCallback((relationship: any) => {
    setSelectedRelationship(relationship)
    // Focus on the midpoint of the relationship
    const midX = (relationship.sourcePos[0] + relationship.targetPos[0]) / 2
    const midY = (relationship.sourcePos[1] + relationship.targetPos[1]) / 2
    const midZ = (relationship.sourcePos[2] + relationship.targetPos[2]) / 2
    setFocusPoint([midX, midY, midZ])
  }, [])

  // Handle export
  const handleExport = useCallback(() => {
    if (!gnnAnalysis) return

    const exportData = {
      ufdrData,
      gnnAnalysis,
      metadata: {
        exportTimestamp: new Date().toISOString(),
        confidenceThreshold,
        visualizationSettings: {
          showAliasClusters,
          showHiddenRelationships,
          showCommunityClusters
        }
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gnn-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [ufdrData, gnnAnalysis, confidenceThreshold, showAliasClusters, showHiddenRelationships, showCommunityClusters])

  // Handle reset
  const handleReset = useCallback(() => {
    setViewPreset('default')
    setSelectedNode(null)
    setSelectedRelationship(null)
    setFocusPoint(null)
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    if (!gnnAnalysis) return { totalPoints: 0, categories: 0, connections: 0 }

    return {
      totalPoints: gnnAnalysis.metadata.graph_nodes,
      categories: gnnAnalysis.metadata.alias_groups_count + gnnAnalysis.metadata.hidden_relationships_count,
      connections: gnnAnalysis.metadata.graph_edges
    }
  }, [gnnAnalysis])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'e':
          handleExport()
          break
        case 'a':
          if (ufdrData && !isAnalyzing) {
            runGNNAnalysis(ufdrData)
          }
          break
        case ' ':
          event.preventDefault()
          setIsAnimating(!isAnimating)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleExport, ufdrData, isAnalyzing, runGNNAnalysis, isAnimating])

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-pink-500/5 pointer-events-none z-10" />

      {/* Upload Area */}
      <AnimatePresence>
        {!gnnAnalysis && !isAnalyzing && (
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
                <div className="flex justify-center mb-4">
                  <Brain className="h-16 w-16 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  GNN-Powered UFDR Analysis
                </h2>
                <p className="text-gray-300 text-sm">
                  Upload your forensic data for advanced alias resolution and hidden relationship detection
                </p>
              </div>

              <div className="flex flex-col gap-3">
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
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg cursor-pointer transition-colors inline-block"
                  >
                    {isUploading ? 'Processing...' : 'Choose File'}
                  </motion.div>
                </label>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/20"></div>
                  <span className="text-gray-400 text-sm">or</span>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoadSampleData}
                  disabled={isUploading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Load Sample Data
                </motion.button>
              </div>

              <div className="mt-6 text-xs text-gray-400 space-y-1">
                <div>• Automatic alias resolution</div>
                <div>• Hidden relationship detection</div>
                <div>• Community analysis</div>
                <div>• 3D network visualization</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Scene */}
      {gnnAnalysis && (
        <>
          <Scene3D enableBloom={true}>
            <ParticleBackground />
            <GNNDataVisualizer
              data={gnnAnalysis.visualization_data}
              showAliasClusters={showAliasClusters}
              showHiddenRelationships={showHiddenRelationships}
              showCommunityClusters={showCommunityClusters}
              confidenceThreshold={confidenceThreshold}
              isAnimating={isAnimating}
              onNodeClick={handleNodeClick}
              onRelationshipClick={handleRelationshipClick}
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

          {/* GNN Analysis Panel */}
          <GNNAnalysisPanel
            data={gnnAnalysis}
            onToggleAliasClusters={setShowAliasClusters}
            onToggleHiddenRelationships={setShowHiddenRelationships}
            onToggleCommunityClusters={setShowCommunityClusters}
            onConfidenceThresholdChange={setConfidenceThreshold}
            onExportAnalysis={handleExport}
            isAnalyzing={isAnalyzing}
            analysisProgress={analysisProgress}
          />

          {/* Floating UI */}
          <FloatingUI
            selectedPoint={selectedNode}
            onClose={() => setSelectedNode(null)}
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

          {/* GNN Controls */}
          <div className="absolute top-4 left-4 flex gap-2 z-30">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAliasClusters(!showAliasClusters)}
              className={`backdrop-blur-md border rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                showAliasClusters 
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Target className="h-4 w-4" />
              Aliases
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHiddenRelationships(!showHiddenRelationships)}
              className={`backdrop-blur-md border rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                showHiddenRelationships 
                  ? 'bg-pink-500/20 border-pink-500 text-pink-400' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Link className="h-4 w-4" />
              Hidden
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCommunityClusters(!showCommunityClusters)}
              className={`backdrop-blur-md border rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                showCommunityClusters 
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Network className="h-4 w-4" />
              Communities
            </motion.button>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 text-xs text-gray-300 z-30">
            <div className="font-semibold text-white mb-2">Shortcuts:</div>
            <div>E - Export analysis</div>
            <div>A - Re-run analysis</div>
            <div>Space - Toggle animation</div>
          </div>
        </>
      )}
    </div>
  )
}
