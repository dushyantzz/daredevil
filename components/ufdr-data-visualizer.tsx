"use client"

import { useState } from "react"
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity, 
  MapPin, 
  Clock,
  Users,
  Calendar,
  Filter,
  Download,
  Database
} from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
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

interface UFDRVisualizerProps {
  data: {
    chats: any[]
    calls: any[]
    images: any[]
    videos: any[]
    appData: any[]
  } | null
}

export function UFDRDataVisualizer({ data }: UFDRVisualizerProps) {
  const [selectedVisualization, setSelectedVisualization] = useState<string>("overview")
  const [timeRange, setTimeRange] = useState<string>("7d")

  // Generate comprehensive analytics
  const generateAnalytics = () => {
    if (!data) return {
      communicationByHour: [],
      locationData: {},
      appUsage: {},
      mediaByType: { images: 0, videos: 0, totalSize: 0 },
      timelineData: {}
    }

    // Communication patterns
    const communicationByHour = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0')
      const chatCount = data.chats.filter(chat => 
        new Date(chat.timestamp).getHours() === i
      ).length
      const callCount = data.calls.filter(call => 
        new Date(call.timestamp).getHours() === i
      ).length
      return { hour, chats: chatCount, calls: callCount }
    })

    // Location analysis
    const locationData = [...data.chats, ...data.calls, ...data.images, ...data.videos]
      .filter(item => item.location)
      .reduce((acc: { [key: string]: number }, item) => {
        acc[item.location] = (acc[item.location] || 0) + 1
        return acc
      }, {})

    // App usage patterns
    const appUsage = data.appData.reduce((acc: { [key: string]: number }, app) => {
      acc[app.appName] = (acc[app.appName] || 0) + 1
      return acc
    }, {})

    // Media analysis
    const mediaByType = {
      images: data.images.length,
      videos: data.videos.length,
      totalSize: data.images.reduce((sum, img) => sum + (img.size || 0), 0) + 
                data.videos.reduce((sum, vid) => sum + (vid.size || 0), 0)
    }

    // Timeline analysis
    const timelineData = data.chats.reduce((acc: { [key: string]: number }, chat) => {
      const date = new Date(chat.timestamp).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    return {
      communicationByHour,
      locationData,
      appUsage,
      mediaByType,
      timelineData
    }
  }

  const analytics = generateAnalytics()

  const visualizations = {
    overview: {
      title: "Data Overview",
      icon: <BarChart3 className="h-5 w-5" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Communications</p>
                <p className="text-2xl font-bold text-white">
                  {(data?.chats?.length || 0) + (data?.calls?.length || 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Media Files</p>
                <p className="text-2xl font-bold text-white">
                  {(data?.images?.length || 0) + (data?.videos?.length || 0)}
                </p>
              </div>
              <PieChart className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">App Records</p>
                <p className="text-2xl font-bold text-white">{data?.appData.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Locations</p>
                <p className="text-2xl font-bold text-white">
                  {Object.keys(analytics.locationData || {}).length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      )
    },
    communication: {
      title: "Communication Patterns",
      icon: <TrendingUp className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
            <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold mb-4">Activity by Hour</h3>
              {analytics.communicationByHour.length > 0 ? (
                <Bar
                  data={{
                    labels: analytics.communicationByHour.map(item => `${item.hour}:00`),
                    datasets: [
                      {
                        label: 'Chats',
                        data: analytics.communicationByHour.map(item => item.chats),
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 1
                      },
                      {
                        label: 'Calls',
                        data: analytics.communicationByHour.map(item => item.calls),
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgba(34, 197, 94, 1)',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        labels: { color: 'white' }
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
              ) : (
                <p className="text-gray-400 text-center py-8">No communication data available</p>
              )}
            </div>
        </div>
      )
    },
    locations: {
      title: "Location Analysis",
      icon: <MapPin className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold mb-4">Activity by Location</h3>
            {Object.keys(analytics.locationData).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analytics.locationData)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 8)
                  .map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                      <span className="text-white">{location}</span>
                      <Badge variant="secondary">{count} activities</Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No location data available</p>
            )}
          </div>
        </div>
      )
    },
    apps: {
      title: "App Usage Analysis",
      icon: <Users className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold mb-4">Most Used Apps</h3>
            {Object.keys(analytics.appUsage).length > 0 ? (
              <Doughnut
                data={{
                  labels: Object.keys(analytics.appUsage),
                  datasets: [{
                    data: Object.values(analytics.appUsage),
                    backgroundColor: [
                      'rgba(99, 102, 241, 0.8)',
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(251, 191, 36, 0.8)',
                      'rgba(239, 68, 68, 0.8)',
                      'rgba(168, 85, 247, 0.8)',
                      'rgba(236, 72, 153, 0.8)',
                      'rgba(14, 165, 233, 0.8)',
                      'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: [
                      'rgba(99, 102, 241, 1)',
                      'rgba(34, 197, 94, 1)',
                      'rgba(251, 191, 36, 1)',
                      'rgba(239, 68, 68, 1)',
                      'rgba(168, 85, 247, 1)',
                      'rgba(236, 72, 153, 1)',
                      'rgba(14, 165, 233, 1)',
                      'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 2
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: { color: 'white' }
                    }
                  }
                }}
              />
            ) : (
              <p className="text-gray-400 text-center py-8">No app usage data available</p>
            )}
          </div>
        </div>
      )
    },
    timeline: {
      title: "Timeline Analysis",
      icon: <Clock className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
            <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
              {Object.keys(analytics.timelineData).length > 0 ? (
                <Line
                  data={{
                    labels: Object.keys(analytics.timelineData).slice(-14), // Last 14 days
                    datasets: [{
                      label: 'Daily Activity',
                      data: Object.keys(analytics.timelineData).slice(-14).map(date => analytics.timelineData[date]),
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      borderColor: 'rgba(99, 102, 241, 1)',
                      borderWidth: 2,
                      tension: 0.4,
                      fill: true
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        labels: { color: 'white' }
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
              ) : (
                <p className="text-gray-400 text-center py-8">No timeline data available</p>
              )}
            </div>
        </div>
      )
    }
  }

  if (!data) {
    return (
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
        <div className="text-center">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-gray-400">Upload UFDR data to see advanced visualizations</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800">
      {/* Visualization Controls */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(visualizations).map(([key, viz]) => (
              <Button
                key={key}
                variant={selectedVisualization === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedVisualization(key)}
                className="flex items-center gap-2"
              >
                {viz.icon}
                {viz.title}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white px-3 py-1 rounded text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visualization Content */}
      <div className="p-6">
        {visualizations[selectedVisualization as keyof typeof visualizations]?.content}
      </div>
    </div>
  )
}
