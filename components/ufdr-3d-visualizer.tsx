"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Download,
  Settings,
  Eye,
  EyeOff
} from "lucide-react"

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface VisualizationData {
  communication_network?: {
    nodes: any[]
    links: any[]
    metadata: any
  }
  temporal_activity?: {
    timeline: any[]
    activity_peaks: any[]
    metadata: any
  }
  spatial_analysis?: {
    locations: any[]
    movement_path: any[]
    heatmap_points: any[]
    metadata: any
  }
  data_flow?: {
    data_streams: any[]
    volume_nodes: any[]
    flow_connections: any[]
    metadata: any
  }
}

interface UFDR3DVisualizerProps {
  data: VisualizationData
  visualizationType: string
  isAnimating: boolean
  viewMode: '3d' | '2d'
  onToggleAnimation: () => void
  onResetView: () => void
  onExport: () => void
}

export function UFDR3DVisualizer({
  data,
  visualizationType,
  isAnimating,
  viewMode,
  onToggleAnimation,
  onResetView,
  onExport
}: UFDR3DVisualizerProps) {
  const plotRef = useRef<any>(null)
  const [plotData, setPlotData] = useState<any[]>([])
  const [plotLayout, setPlotLayout] = useState<any>({})
  const [plotConfig, setPlotConfig] = useState<any>({})
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    generatePlotlyData()
  }, [data, visualizationType, viewMode])

  const generatePlotlyData = () => {
    const traces: any[] = []
    let layout: any = {
      title: {
        text: `UFDR 3D Visualization - ${visualizationType.replace('_', ' ').toUpperCase()}`,
        font: { color: '#ffffff', size: 16 }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#ffffff' },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(0,0,0,0.8)',
        bordercolor: '#333',
        borderwidth: 1
      },
      margin: { l: 0, r: 0, t: 60, b: 0 }
    }

    if (viewMode === '3d') {
      layout.scene = {
        bgcolor: 'rgba(0,0,0,0)',
        xaxis: { 
          title: 'X Axis',
          gridcolor: '#333',
          color: '#ffffff'
        },
        yaxis: { 
          title: 'Y Axis',
          gridcolor: '#333',
          color: '#ffffff'
        },
        zaxis: { 
          title: 'Z Axis',
          gridcolor: '#333',
          color: '#ffffff'
        },
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.5 }
        }
      }
    }

    switch (visualizationType) {
      case 'communication_network':
        generateCommunicationNetworkTraces(traces, layout)
        break
      case 'temporal':
        generateTemporalActivityTraces(traces, layout)
        break
      case 'spatial':
        generateSpatialAnalysisTraces(traces, layout)
        break
      case 'data_flow':
        generateDataFlowTraces(traces, layout)
        break
      default:
        generateComprehensiveTraces(traces, layout)
    }

    setPlotData(traces)
    setPlotLayout(layout)
    setPlotConfig({
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: `ufdr_3d_${visualizationType}_${Date.now()}`,
        height: 800,
        width: 1200,
        scale: 2
      }
    })
  }

  const generateCommunicationNetworkTraces = (traces: any[], layout: any) => {
    const network = data.communication_network
    if (!network) return

    // Network nodes
    if (network.nodes && network.nodes.length > 0) {
      traces.push({
        x: network.nodes.map((node: any) => node.x),
        y: network.nodes.map((node: any) => node.y),
        z: network.nodes.map((node: any) => node.z),
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: network.nodes.map((node: any) => node.size || 10),
          color: '#4A90E2',
          line: { color: '#ffffff', width: 2 },
          opacity: 0.8
        },
        text: network.nodes.map((node: any) => 
          `${node.id}<br>Interactions: ${node.totalInteractions}<br>Platforms: ${node.platforms?.join(', ') || 'N/A'}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: 'Contacts'
      })
    }

    // Network links
    if (network.links && network.links.length > 0) {
      const linkTraces: any[] = []
      
      network.links.forEach((link: any) => {
        linkTraces.push({
          x: [link.sourcePos[0], link.targetPos[0]],
          y: [link.sourcePos[1], link.targetPos[1]],
          z: [link.sourcePos[2], link.targetPos[2]],
          mode: 'lines',
          type: 'scatter3d',
          line: {
            color: '#666666',
            width: Math.max(1, link.strength * 2)
          },
          hoverinfo: 'skip',
          showlegend: false,
          opacity: 0.6
        })
      })
      
      traces.push(...linkTraces)
    }
  }

  const generateTemporalActivityTraces = (traces: any[], layout: any) => {
    const temporal = data.temporal_activity
    if (!temporal) return

    // Timeline points
    if (temporal.timeline && temporal.timeline.length > 0) {
      traces.push({
        x: temporal.timeline.map((point: any) => point.x),
        y: temporal.timeline.map((point: any) => point.y),
        z: temporal.timeline.map((point: any) => point.z),
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: temporal.timeline.map((point: any) => Math.max(5, point.eventCount * 2)),
          color: temporal.timeline.map((point: any) => point.intensity),
          colorscale: 'Viridis',
          colorbar: { title: 'Activity Intensity' },
          line: { color: '#ffffff', width: 1 }
        },
        text: temporal.timeline.map((point: any) => 
          `Time: ${point.timestamp}<br>Events: ${point.eventCount}<br>Intensity: ${point.intensity.toFixed(2)}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: 'Timeline Activity'
      })
    }

    // Activity peaks
    if (temporal.activity_peaks && temporal.activity_peaks.length > 0) {
      traces.push({
        x: temporal.activity_peaks.map((peak: any) => peak.x),
        y: temporal.activity_peaks.map((peak: any) => peak.y),
        z: temporal.activity_peaks.map((peak: any) => peak.z),
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: temporal.activity_peaks.map((peak: any) => Math.max(15, peak.peakIntensity * 3)),
          color: '#FF6B6B',
          symbol: 'diamond',
          line: { color: '#ffffff', width: 2 }
        },
        text: temporal.activity_peaks.map((peak: any) => 
          `Peak Activity<br>Time: ${peak.timestamp}<br>Intensity: ${peak.peakIntensity}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: 'Activity Peaks'
      })
    }
  }

  const generateSpatialAnalysisTraces = (traces: any[], layout: any) => {
    const spatial = data.spatial_analysis
    if (!spatial) return

    // Location points
    if (spatial.locations && spatial.locations.length > 0) {
      traces.push({
        x: spatial.locations.map((loc: any) => loc.x),
        y: spatial.locations.map((loc: any) => loc.y),
        z: spatial.locations.map((loc: any) => loc.z),
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: spatial.locations.map((loc: any) => Math.max(8, loc.activityCount * 3)),
          color: spatial.locations.map((loc: any) => loc.intensity),
          colorscale: 'Hot',
          colorbar: { title: 'Activity Intensity' },
          line: { color: '#ffffff', width: 2 }
        },
        text: spatial.locations.map((loc: any) => 
          `${loc.name}<br>Activities: ${loc.activityCount}<br>Intensity: ${loc.intensity}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: 'Locations'
      })
    }

    // Movement path
    if (spatial.movement_path && spatial.movement_path.length > 0) {
      traces.push({
        x: spatial.movement_path.map((point: any) => point.x),
        y: spatial.movement_path.map((point: any) => point.y),
        z: spatial.movement_path.map((point: any) => point.z),
        mode: 'lines+markers',
        type: 'scatter3d',
        line: {
          color: '#00D4AA',
          width: 4
        },
        marker: {
          size: 6,
          color: '#00D4AA'
        },
        text: spatial.movement_path.map((point: any) => 
          `${point.location}<br>Time: ${point.timestamp}<br>Type: ${point.activity_type}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: 'Movement Path'
      })
    }

    // Heatmap points
    if (spatial.heatmap_points && spatial.heatmap_points.length > 0) {
      traces.push({
        x: spatial.heatmap_points.map((point: any) => point.x),
        y: spatial.heatmap_points.map((point: any) => point.y),
        z: spatial.heatmap_points.map((point: any) => point.z),
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: spatial.heatmap_points.map((point: any) => Math.max(3, point.intensity * 0.5)),
          color: spatial.heatmap_points.map((point: any) => point.intensity),
          colorscale: 'Plasma',
          opacity: 0.6
        },
        text: spatial.heatmap_points.map((point: any) => 
          `Type: ${point.activity_type}<br>Intensity: ${point.intensity}<br>Time: ${point.timestamp}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: 'Activity Heatmap'
      })
    }
  }

  const generateDataFlowTraces = (traces: any[], layout: any) => {
    const flow = data.data_flow
    if (!flow) return

    // Volume nodes
    if (flow.volume_nodes && flow.volume_nodes.length > 0) {
      traces.push({
        x: flow.volume_nodes.map((node: any) => node.x),
        y: flow.volume_nodes.map((node: any) => node.y),
        z: flow.volume_nodes.map((node: any) => node.z),
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: flow.volume_nodes.map((node: any) => node.size),
          color: flow.volume_nodes.map((node: any) => node.color),
          line: { color: '#ffffff', width: 2 }
        },
        text: flow.volume_nodes.map((node: any) => 
          `${node.id}<br>Volume: ${node.volume.toLocaleString()}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: 'Data Volumes'
      })
    }

    // Data streams
    if (flow.data_streams && flow.data_streams.length > 0) {
      traces.push({
        x: flow.data_streams.map((stream: any) => stream.x),
        y: flow.data_streams.map((stream: any) => stream.y),
        z: flow.data_streams.map((stream: any) => stream.z),
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: flow.data_streams.map((stream: any) => Math.max(3, stream.volume * 0.1)),
          color: '#FFD700',
          opacity: 0.7
        },
        text: flow.data_streams.map((stream: any) => 
          `Type: ${stream.type}<br>Volume: ${stream.volume}<br>Time: ${stream.timestamp}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: 'Data Streams'
      })
    }
  }

  const generateComprehensiveTraces = (traces: any[], layout: any) => {
    // Generate traces for all visualization types
    generateCommunicationNetworkTraces(traces, layout)
    generateTemporalActivityTraces(traces, layout)
    generateSpatialAnalysisTraces(traces, layout)
    generateDataFlowTraces(traces, layout)
  }

  const handlePlotUpdate = (figure: any) => {
    // Handle plot updates if needed
  }

  return (
    <div className="w-full h-full relative">
      {/* Control Panel */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 bg-zinc-800/90 backdrop-blur-sm rounded-lg p-3 border border-zinc-700">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleAnimation}
              className="bg-zinc-700/50 border-zinc-600 hover:bg-zinc-600"
            >
              {isAnimating ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onResetView}
              className="bg-zinc-700/50 border-zinc-600 hover:bg-zinc-600"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onExport}
              className="bg-zinc-700/50 border-zinc-600 hover:bg-zinc-600"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowControls(!showControls)}
              className="bg-zinc-700/50 border-zinc-600 hover:bg-zinc-600"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Show controls button when hidden */}
      {!showControls && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowControls(true)}
            className="bg-zinc-800/90 border-zinc-700 hover:bg-zinc-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Plotly Visualization */}
      <div className="w-full h-full">
        <Plot
          ref={plotRef}
          data={plotData}
          layout={plotLayout}
          config={plotConfig}
          style={{ width: '100%', height: '100%' }}
          onUpdate={handlePlotUpdate}
          useResizeHandler={true}
        />
      </div>

      {/* Visualization Info */}
      <div className="absolute bottom-4 left-4 z-10 bg-zinc-800/90 backdrop-blur-sm rounded-lg p-3 border border-zinc-700">
        <div className="flex items-center space-x-4 text-sm">
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {viewMode.toUpperCase()} View
          </Badge>
          <Badge variant="outline" className="text-green-400 border-green-400">
            {plotData.length} Traces
          </Badge>
          <span className="text-gray-400">
            {isAnimating ? 'Animating' : 'Static'}
          </span>
        </div>
      </div>
    </div>
  )
}

