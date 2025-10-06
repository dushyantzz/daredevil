"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Loader2, 
  Eye, 
  Network, 
  Clock, 
  MapPin, 
  Database,
  Settings,
  Download,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Filter,
  Search,
  BarChart3,
  Globe,
  Smartphone,
  MessageSquare,
  Phone,
  Camera,
  Video,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { UFDRDataParser } from "@/components/ufdr-data-parser"
import { UFDR3DVisualizer } from "@/components/ufdr-3d-visualizer"
import { UFDRVisualizationFilters } from "@/components/ufdr-visualization-filters"

interface VisualizationData {
  communication_network?: any
  temporal_activity?: any
  spatial_analysis?: any
  data_flow?: any
  metadata?: any
  dataPoints?: number
}

interface UFDRData {
  chats: any[]
  calls: any[]
  images: any[]
  videos: any[]
  appData: any[]
  metadata: {
    totalSize: string
    deviceInfo: string
    extractionDate: string
    dataTypes: string[]
  }
}

type VisualizationType = 'comprehensive' | 'communication_network' | 'temporal' | 'spatial' | 'data_flow'

export default function UFDR3DVisualizationPage() {
  const [ufdrData, setUfdrData] = useState<UFDRData | null>(null)
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [currentVisualization, setCurrentVisualization] = useState<VisualizationType>('comprehensive')
  const [isAnimating, setIsAnimating] = useState(false)
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d')
  const [filters, setFilters] = useState<any>(null)
  const [filteredData, setFilteredData] = useState<VisualizationData | null>(null)

  const visualizationTypes: { [key in VisualizationType]: { label: string; icon: any; description: string } } = {
    comprehensive: { label: 'Comprehensive View', icon: Layers, description: 'Complete 3D analysis of all UFDR data' },
    communication_network: { label: 'Communication Network', icon: Network, description: '3D network of contacts and platforms' },
    temporal: { label: 'Temporal Activity', icon: Clock, description: 'Time-based activity patterns in 3D' },
    spatial: { label: 'Spatial Analysis', icon: MapPin, description: 'Geographic movement and location data' },
    data_flow: { label: 'Data Flow', icon: Database, description: '3D visualization of data volumes and flows' }
  }

  const handleDataParsed = useCallback((data: UFDRData) => {
    setUfdrData(data)
    setVisualizationData(null)
  }, [])

  const processVisualization = useCallback(async () => {
    if (!ufdrData) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 200)

      const response = await fetch('/api/ufdr-3d-visualization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ufdrData,
          visualizationType: currentVisualization
        }),
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (!response.ok) {
        throw new Error('Failed to process visualization')
      }

      const result = await response.json()
      setVisualizationData(result.visualizationData)
    } catch (error) {
      console.error('Visualization processing error:', error)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }, [ufdrData, currentVisualization])

  const toggleAnimation = useCallback(() => {
    setIsAnimating(prev => !prev)
  }, [])

  const resetView = useCallback(() => {
    // Reset 3D view to default position
    setIsAnimating(false)
  }, [])

  const exportVisualization = useCallback(() => {
    const dataToExport = filteredData || visualizationData
    if (!dataToExport) return

    const dataStr = JSON.stringify(dataToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `ufdr_3d_visualization_${currentVisualization}_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filteredData, visualizationData, currentVisualization])

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
  }, [])

  const applyFilters = useCallback(() => {
    if (!visualizationData || !filters) return

    // Apply filtering logic here
    // For now, we'll just set the filtered data to the original data
    // In a real implementation, you would filter the visualization data based on the filter criteria
    setFilteredData(visualizationData)
  }, [visualizationData, filters])

  const clearFilters = useCallback(() => {
    setFilters(null)
    setFilteredData(null)
  }, [])

  // Auto-process when data changes
  useEffect(() => {
    if (ufdrData && !visualizationData) {
      processVisualization()
    }
  }, [ufdrData, processVisualization, visualizationData])

  return (
    <div className="min-h-screen bg-zinc-900 text-white relative">
      {/* Filters Component */}
      {visualizationData && (
        <UFDRVisualizationFilters
          data={visualizationData}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />
      )}
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Eye className="h-8 w-8 mr-3 text-blue-500" />
                UFDR 3D Visualization
              </h1>
              <p className="text-gray-400 mt-1">
                Interactive 3D analysis of forensic data with advanced visualization
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                Python Backend
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                Plotly 3D
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Data Upload */}
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data Upload
              </h3>
              <UFDRDataParser onDataParsed={handleDataParsed} />
            </div>

            {/* Visualization Controls */}
            {ufdrData && (
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Visualization Controls
                </h3>
                
                {/* Visualization Type Selection */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-300">Visualization Type</label>
                  <div className="space-y-2">
                    {Object.entries(visualizationTypes).map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <button
                          key={key}
                          onClick={() => setCurrentVisualization(key as VisualizationType)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            currentVisualization === key
                              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                              : 'border-zinc-700 bg-zinc-700/50 hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            <div>
                              <div className="text-sm font-medium">{config.label}</div>
                              <div className="text-xs text-gray-400">{config.description}</div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* View Controls */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-300">View Controls</label>
                  <div className="flex space-x-2">
                    <Button
                      variant={viewMode === '3d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('3d')}
                      className="flex-1"
                    >
                      <Maximize2 className="h-4 w-4 mr-1" />
                      3D
                    </Button>
                    <Button
                      variant={viewMode === '2d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('2d')}
                      className="flex-1"
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      2D
                    </Button>
                  </div>
                </div>

                {/* Animation Controls */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-300">Animation</label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAnimation}
                      className="flex-1"
                    >
                      {isAnimating ? (
                        <Pause className="h-4 w-4 mr-1" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      {isAnimating ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetView}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Export */}
                <Button
                  onClick={exportVisualization}
                  disabled={!visualizationData}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            )}

            {/* Data Statistics */}
            {ufdrData && (
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Data Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-green-400" />
                      <span className="text-sm">Chats</span>
                    </div>
                    <span className="text-sm font-medium">{ufdrData.chats.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-blue-400" />
                      <span className="text-sm">Calls</span>
                    </div>
                    <span className="text-sm font-medium">{ufdrData.calls.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Camera className="h-4 w-4 mr-2 text-purple-400" />
                      <span className="text-sm">Images</span>
                    </div>
                    <span className="text-sm font-medium">{ufdrData.images.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-2 text-red-400" />
                      <span className="text-sm">Videos</span>
                    </div>
                    <span className="text-sm font-medium">{ufdrData.videos.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2 text-yellow-400" />
                      <span className="text-sm">Apps</span>
                    </div>
                    <span className="text-sm font-medium">{ufdrData.appData.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Visualization Area */}
          <div className="lg:col-span-3">
            {!ufdrData ? (
              <div className="bg-zinc-800 rounded-lg p-8 text-center">
                <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload UFDR Data</h3>
                <p className="text-gray-400">
                  Upload your forensic data files to begin 3D visualization analysis
                </p>
              </div>
            ) : isProcessing ? (
              <div className="bg-zinc-800 rounded-lg p-8">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Processing Visualization</h3>
                  <p className="text-gray-400 mb-4">
                    Generating 3D visualization data using Python backend...
                  </p>
                  <Progress value={processingProgress} className="mb-4" />
                  <p className="text-sm text-gray-400">
                    {Math.round(processingProgress)}% complete
                  </p>
                </div>
              </div>
            ) : visualizationData ? (
              <div className="space-y-6">
                {/* Visualization Header */}
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {visualizationTypes[currentVisualization].label}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {visualizationTypes[currentVisualization].description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {visualizationData.dataPoints || 0} Data Points
                      </Badge>
                      <Badge variant="outline">
                        {viewMode.toUpperCase()} View
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 3D Visualization Container */}
                <div className="bg-zinc-800 rounded-lg p-6">
                  <div className="aspect-video bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden">
                    <UFDR3DVisualizer
                      data={filteredData || visualizationData}
                      visualizationType={currentVisualization}
                      isAnimating={isAnimating}
                      viewMode={viewMode}
                      onToggleAnimation={toggleAnimation}
                      onResetView={resetView}
                      onExport={exportVisualization}
                    />
                  </div>
                </div>

                {/* Visualization Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Communication Network */}
                  {visualizationData.communication_network && (
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3 flex items-center">
                        <Network className="h-5 w-5 mr-2 text-blue-400" />
                        Communication Network
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contacts:</span>
                          <span>{visualizationData.communication_network.metadata?.totalContacts || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Interactions:</span>
                          <span>{visualizationData.communication_network.metadata?.totalInteractions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Platforms:</span>
                          <span>{visualizationData.communication_network.metadata?.platforms?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Temporal Activity */}
                  {visualizationData.temporal_activity && (
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-green-400" />
                        Temporal Activity
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Events:</span>
                          <span>{visualizationData.temporal_activity.metadata?.totalEvents || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Activity Peaks:</span>
                          <span>{visualizationData.temporal_activity.activity_peaks?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Activity Types:</span>
                          <span>{visualizationData.temporal_activity.metadata?.activityTypes?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Spatial Analysis */}
                  {visualizationData.spatial_analysis && (
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-purple-400" />
                        Spatial Analysis
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Locations:</span>
                          <span>{visualizationData.spatial_analysis.metadata?.totalLocations || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Movement Points:</span>
                          <span>{visualizationData.spatial_analysis.movement_path?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Heatmap Points:</span>
                          <span>{visualizationData.spatial_analysis.heatmap_points?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data Flow */}
                  {visualizationData.data_flow && (
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3 flex items-center">
                        <Database className="h-5 w-5 mr-2 text-yellow-400" />
                        Data Flow
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Volume:</span>
                          <span>{visualizationData.data_flow.metadata?.totalDataVolume || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Data Types:</span>
                          <span>{visualizationData.data_flow.metadata?.dataTypes?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Flow Connections:</span>
                          <span>{visualizationData.data_flow.flow_connections?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-800 rounded-lg p-8 text-center">
                <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Visualize</h3>
                <p className="text-gray-400 mb-4">
                  Data uploaded successfully. Click the process button to generate 3D visualization.
                </p>
                <Button onClick={processVisualization} disabled={isProcessing}>
                  <Eye className="h-4 w-4 mr-2" />
                  Generate 3D Visualization
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
