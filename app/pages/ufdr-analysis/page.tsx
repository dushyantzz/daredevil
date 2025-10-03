"use client"

import { useState, useEffect } from "react"
import { 
  FileText, 
  Phone, 
  Image, 
  Video, 
  Smartphone, 
  Database, 
  Search, 
  Download, 
  Filter,
  Calendar,
  Clock,
  User,
  MessageSquare,
  MapPin,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UFDRDataParser } from "@/components/ufdr-data-parser"
import { UFDRDataVisualizer } from "@/components/ufdr-data-visualizer"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  LineController,
} from 'chart.js'
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineController
)

interface UFDRData {
  chats: ChatData[]
  calls: CallData[]
  images: ImageData[]
  videos: VideoData[]
  appData: AppData[]
  metadata: {
    totalSize: string
    deviceInfo: string
    extractionDate: string
    dataTypes: string[]
  }
}

interface ChatData {
  id: string
  platform: string
  contact: string
  message: string
  timestamp: string
  type: 'sent' | 'received'
  mediaAttached?: boolean
  location?: string
}

interface CallData {
  id: string
  contact: string
  duration: number
  timestamp: string
  type: 'incoming' | 'outgoing' | 'missed'
  location?: string
}

interface ImageData {
  id: string
  filename: string
  path: string
  size: number
  timestamp: string
  location?: string
  metadata: {
    camera: string
    resolution: string
    gps?: string
  }
}

interface VideoData {
  id: string
  filename: string
  path: string
  size: number
  duration: number
  timestamp: string
  location?: string
  metadata: {
    camera: string
    resolution: string
    fps: number
    gps?: string
  }
}

interface AppData {
  id: string
  appName: string
  packageName: string
  data: any
  timestamp: string
  category: string
}

export default function UFDRAnalysisPage() {
  const [ufdrData, setUfdrData] = useState<UFDRData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDataType, setSelectedDataType] = useState<string>("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']))
  const [chartData, setChartData] = useState<any>({})
  const [showDataParser, setShowDataParser] = useState(false)

  // Mock data generation for demonstration
  useEffect(() => {
    const generateMockData = (): UFDRData => {
      const platforms = ['WhatsApp', 'Telegram', 'Signal', 'SMS', 'iMessage']
      const contacts = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Alex Brown']
      const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']
      
      const chats: ChatData[] = Array.from({ length: 150 }, (_, i) => ({
        id: `chat_${i}`,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        contact: contacts[Math.floor(Math.random() * contacts.length)],
        message: `Sample message ${i + 1} with some content that might be relevant to the investigation.`,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        type: Math.random() > 0.5 ? 'sent' : 'received',
        mediaAttached: Math.random() > 0.8,
        location: Math.random() > 0.7 ? locations[Math.floor(Math.random() * locations.length)] : undefined
      }))

      const calls: CallData[] = Array.from({ length: 75 }, (_, i) => ({
        id: `call_${i}`,
        contact: contacts[Math.floor(Math.random() * contacts.length)],
        duration: Math.floor(Math.random() * 3600), // 0-3600 seconds
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        type: ['incoming', 'outgoing', 'missed'][Math.floor(Math.random() * 3)] as 'incoming' | 'outgoing' | 'missed',
        location: Math.random() > 0.6 ? locations[Math.floor(Math.random() * locations.length)] : undefined
      }))

      const images: ImageData[] = Array.from({ length: 200 }, (_, i) => ({
        id: `img_${i}`,
        filename: `IMG_${String(i + 1).padStart(4, '0')}.jpg`,
        path: `/DCIM/Camera/IMG_${String(i + 1).padStart(4, '0')}.jpg`,
        size: Math.floor(Math.random() * 5000000) + 1000000, // 1-6MB
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: Math.random() > 0.5 ? locations[Math.floor(Math.random() * locations.length)] : undefined,
        metadata: {
          camera: 'iPhone 13 Pro',
          resolution: '4032x3024',
          gps: Math.random() > 0.3 ? `${Math.random() * 180 - 90}, ${Math.random() * 360 - 180}` : undefined
        }
      }))

      const videos: VideoData[] = Array.from({ length: 50 }, (_, i) => ({
        id: `vid_${i}`,
        filename: `VID_${String(i + 1).padStart(4, '0')}.mp4`,
        path: `/DCIM/Camera/VID_${String(i + 1).padStart(4, '0')}.mp4`,
        size: Math.floor(Math.random() * 100000000) + 10000000, // 10-110MB
        duration: Math.floor(Math.random() * 300) + 10, // 10-310 seconds
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: Math.random() > 0.4 ? locations[Math.floor(Math.random() * locations.length)] : undefined,
        metadata: {
          camera: 'iPhone 13 Pro',
          resolution: '1920x1080',
          fps: 30,
          gps: Math.random() > 0.2 ? `${Math.random() * 180 - 90}, ${Math.random() * 360 - 180}` : undefined
        }
      }))

      const appData: AppData[] = Array.from({ length: 100 }, (_, i) => ({
        id: `app_${i}`,
        appName: ['Instagram', 'Facebook', 'Twitter', 'TikTok', 'Snapchat', 'LinkedIn'][Math.floor(Math.random() * 6)],
        packageName: `com.example.app${i}`,
        data: { activity: 'login', timestamp: new Date().toISOString() },
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: ['Social', 'Communication', 'Entertainment', 'Productivity'][Math.floor(Math.random() * 4)]
      }))

      return {
        chats,
        calls,
        images,
        videos,
        appData,
        metadata: {
          totalSize: '2.4 GB',
          deviceInfo: 'iPhone 13 Pro - iOS 16.1',
          extractionDate: new Date().toISOString(),
          dataTypes: ['Chats', 'Calls', 'Images', 'Videos', 'App Data']
        }
      }
    }

    // Simulate loading
    setTimeout(() => {
      const mockData = generateMockData()
      setUfdrData(mockData)
      generateChartData(mockData)
      setIsLoading(false)
    }, 2000)
  }, [])

  const generateChartData = (data: UFDRData) => {
    // Data type distribution
    const dataTypeDistribution = {
      labels: ['Chats', 'Calls', 'Images', 'Videos', 'App Data'],
      datasets: [{
        data: [data.chats.length, data.calls.length, data.images.length, data.videos.length, data.appData.length],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(168, 85, 247, 1)'
        ],
        borderWidth: 2
      }]
    }

    // Timeline analysis
    const timelineData = data.chats.reduce((acc: { [key: string]: number }, chat) => {
      const date = new Date(chat.timestamp).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    const timelineChart = {
      labels: Object.keys(timelineData).slice(-7), // Last 7 days
      datasets: [{
        label: 'Chat Activity',
        data: Object.keys(timelineData).slice(-7).map(date => timelineData[date]),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    }

    // Platform distribution
    const platformData = data.chats.reduce((acc: { [key: string]: number }, chat) => {
      acc[chat.platform] = (acc[chat.platform] || 0) + 1
      return acc
    }, {})

    const platformChart = {
      labels: Object.keys(platformData),
      datasets: [{
        data: Object.values(platformData),
        backgroundColor: [
          'rgba(37, 211, 102, 0.8)',
          'rgba(0, 123, 255, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(220, 53, 69, 0.8)',
          'rgba(108, 117, 125, 0.8)'
        ],
        borderColor: [
          'rgba(37, 211, 102, 1)',
          'rgba(0, 123, 255, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(220, 53, 69, 1)',
          'rgba(108, 117, 125, 1)'
        ],
        borderWidth: 2
      }]
    }

    setChartData({
      dataTypeDistribution,
      timelineChart,
      platformChart
    })
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const exportData = (dataType: string) => {
    if (!ufdrData) return
    
    let dataToExport: any = null
    let filename = ''
    
    switch (dataType) {
      case 'chats':
        dataToExport = ufdrData.chats
        filename = 'ufdr_chats_export.json'
        break
      case 'calls':
        dataToExport = ufdrData.calls
        filename = 'ufdr_calls_export.json'
        break
      case 'images':
        dataToExport = ufdrData.images
        filename = 'ufdr_images_export.json'
        break
      case 'videos':
        dataToExport = ufdrData.videos
        filename = 'ufdr_videos_export.json'
        break
      case 'appData':
        dataToExport = ufdrData.appData
        filename = 'ufdr_appdata_export.json'
        break
      default:
        dataToExport = ufdrData
        filename = 'ufdr_complete_export.json'
    }
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` : `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading UFDR Analysis</h2>
          <p className="text-gray-400">Parsing and analyzing forensic data...</p>
        </div>
      </div>
    )
  }

  if (!ufdrData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-gray-400">Unable to load UFDR data. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-4 text-center text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
            UFDR Analysis Dashboard
          </h1>
          <p className="text-center text-gray-400 text-lg">
            Comprehensive Universal Forensic Data Recovery Analysis
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 pl-10 pr-4 py-2 rounded-full focus:ring-2 focus:ring-white focus:border-transparent"
            />
          </div>
          <select
            value={selectedDataType}
            onChange={(e) => setSelectedDataType(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-full focus:ring-2 focus:ring-white focus:border-transparent"
          >
            <option value="all">All Data Types</option>
            <option value="chats">Chats</option>
            <option value="calls">Calls</option>
            <option value="images">Images</option>
            <option value="videos">Videos</option>
            <option value="appData">App Data</option>
          </select>
          <Button
            variant="outline"
            onClick={() => setShowDataParser(!showDataParser)}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {showDataParser ? 'Hide Parser' : 'Upload Data'}
          </Button>
        </div>

        {/* Data Parser */}
        {showDataParser && (
          <div className="mb-8">
            <UFDRDataParser onDataParsed={setUfdrData} />
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Chats</p>
                <p className="text-2xl font-bold text-white">{ufdrData.chats.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Calls</p>
                <p className="text-2xl font-bold text-white">{ufdrData.calls.length}</p>
              </div>
              <Phone className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Images</p>
                <p className="text-2xl font-bold text-white">{ufdrData.images.length}</p>
              </div>
              <Image className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Videos</p>
                <p className="text-2xl font-bold text-white">{ufdrData.videos.length}</p>
              </div>
              <Video className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">App Records</p>
                <p className="text-2xl font-bold text-white">{ufdrData.appData.length}</p>
              </div>
              <Smartphone className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Advanced Visualizations */}
        <div className="mb-8">
          <UFDRDataVisualizer data={ufdrData ? {
            chats: ufdrData.chats,
            calls: ufdrData.calls,
            images: ufdrData.images,
            videos: ufdrData.videos,
            appData: ufdrData.appData
          } : null} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-500" />
              Data Type Distribution
            </h3>
            {chartData.dataTypeDistribution && (
              <Doughnut
                data={chartData.dataTypeDistribution}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        color: 'white'
                      }
                    }
                  }
                }}
              />
            )}
          </div>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Activity Timeline
            </h3>
            {chartData.timelineChart && (
              <Line
                data={chartData.timelineChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: 'white' },
                      grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                      ticks: { color: 'white' },
                      grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                  }
                }}
              />
            )}
          </div>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-yellow-500" />
              Platform Usage
            </h3>
            {chartData.platformChart && (
              <Bar
                data={chartData.platformChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: 'white' },
                      grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                      ticks: { color: 'white' },
                      grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Data Sections */}
        <div className="space-y-6">
          {/* Chats Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800">
            <div 
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-zinc-800 transition-colors"
              onClick={() => toggleSection('chats')}
            >
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold">Chat Messages</h2>
                <Badge variant="secondary" className="ml-3">{ufdrData.chats.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    exportData('chats')
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                {expandedSections.has('chats') ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>
            </div>
            {expandedSections.has('chats') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {ufdrData.chats.slice(0, 20).map((chat) => (
                    <div key={chat.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-400">{chat.platform}</span>
                        <Badge variant={chat.type === 'sent' ? 'default' : 'secondary'}>
                          {chat.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 mb-2 line-clamp-2">{chat.message}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{chat.contact}</span>
                        <span>{new Date(chat.timestamp).toLocaleDateString()}</span>
                      </div>
                      {chat.location && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {chat.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calls Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800">
            <div 
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-zinc-800 transition-colors"
              onClick={() => toggleSection('calls')}
            >
              <div className="flex items-center">
                <Phone className="h-6 w-6 text-green-500 mr-3" />
                <h2 className="text-xl font-semibold">Call Records</h2>
                <Badge variant="secondary" className="ml-3">{ufdrData.calls.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    exportData('calls')
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                {expandedSections.has('calls') ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>
            </div>
            {expandedSections.has('calls') && (
              <div className="px-6 pb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left py-3 px-4">Contact</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Duration</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ufdrData.calls.slice(0, 10).map((call) => (
                        <tr key={call.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                          <td className="py-3 px-4">{call.contact}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={call.type === 'missed' ? 'destructive' : call.type === 'incoming' ? 'default' : 'secondary'}
                            >
                              {call.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{formatDuration(call.duration)}</td>
                          <td className="py-3 px-4">{new Date(call.timestamp).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{call.location || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Images Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800">
            <div 
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-zinc-800 transition-colors"
              onClick={() => toggleSection('images')}
            >
              <div className="flex items-center">
                <Image className="h-6 w-6 text-yellow-500 mr-3" />
                <h2 className="text-xl font-semibold">Images</h2>
                <Badge variant="secondary" className="ml-3">{ufdrData.images.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    exportData('images')
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                {expandedSections.has('images') ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>
            </div>
            {expandedSections.has('images') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                  {ufdrData.images.slice(0, 24).map((image) => (
                    <div key={image.id} className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
                      <div className="aspect-square bg-zinc-700 rounded-lg mb-2 flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-300 truncate">{image.filename}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                      <p className="text-xs text-gray-500">{image.metadata.resolution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Videos Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800">
            <div 
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-zinc-800 transition-colors"
              onClick={() => toggleSection('videos')}
            >
              <div className="flex items-center">
                <Video className="h-6 w-6 text-red-500 mr-3" />
                <h2 className="text-xl font-semibold">Videos</h2>
                <Badge variant="secondary" className="ml-3">{ufdrData.videos.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    exportData('videos')
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                {expandedSections.has('videos') ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>
            </div>
            {expandedSections.has('videos') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {ufdrData.videos.slice(0, 12).map((video) => (
                    <div key={video.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                      <div className="aspect-video bg-zinc-700 rounded-lg mb-3 flex items-center justify-center">
                        <Video className="h-12 w-12 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-300 truncate mb-1">{video.filename}</p>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{formatFileSize(video.size)}</span>
                        <span>{formatDuration(video.duration)}</span>
                      </div>
                      <p className="text-xs text-gray-500">{video.metadata.resolution} @ {video.metadata.fps}fps</p>
                      {video.location && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {video.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* App Data Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800">
            <div 
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-zinc-800 transition-colors"
              onClick={() => toggleSection('appData')}
            >
              <div className="flex items-center">
                <Smartphone className="h-6 w-6 text-purple-500 mr-3" />
                <h2 className="text-xl font-semibold">App Data</h2>
                <Badge variant="secondary" className="ml-3">{ufdrData.appData.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    exportData('appData')
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                {expandedSections.has('appData') ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>
            </div>
            {expandedSections.has('appData') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {ufdrData.appData.slice(0, 15).map((app) => (
                    <div key={app.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-white">{app.appName}</h3>
                        <Badge variant="outline">{app.category}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{app.packageName}</p>
                      <p className="text-xs text-gray-400">
                        Last activity: {new Date(app.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Section */}
        <div className="mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Database className="h-6 w-6 text-gray-500 mr-3" />
            Extraction Metadata
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Total Data Size</p>
              <p className="text-lg font-semibold text-white">{ufdrData.metadata.totalSize}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Device Information</p>
              <p className="text-lg font-semibold text-white">{ufdrData.metadata.deviceInfo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Extraction Date</p>
              <p className="text-lg font-semibold text-white">
                {new Date(ufdrData.metadata.extractionDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Data Types</p>
              <p className="text-lg font-semibold text-white">{ufdrData.metadata.dataTypes.length}</p>
            </div>
          </div>
        </div>

        {/* Export All Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => exportData('all')}
            className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Complete UFDR Report
          </Button>
        </div>
      </div>
    </div>
  )
}
