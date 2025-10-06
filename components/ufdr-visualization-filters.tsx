"use client"

import { useState, useEffect } from "react"
import { 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  Database,
  Sliders,
  X,
  Check
} from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"

interface FilterState {
  timeRange: {
    start: string
    end: string
    enabled: boolean
  }
  dataTypes: {
    chats: boolean
    calls: boolean
    images: boolean
    videos: boolean
    appData: boolean
  }
  intensity: {
    min: number
    max: number
    enabled: boolean
  }
  location: {
    enabled: boolean
    coordinates?: {
      lat: number
      lng: number
      radius: number
    }
  }
  platforms: {
    enabled: boolean
    selected: string[]
  }
}

interface UFDRVisualizationFiltersProps {
  data: any
  onFiltersChange: (filters: FilterState) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

export function UFDRVisualizationFilters({
  data,
  onFiltersChange,
  onApplyFilters,
  onClearFilters
}: UFDRVisualizationFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    timeRange: {
      start: '',
      end: '',
      enabled: false
    },
    dataTypes: {
      chats: true,
      calls: true,
      images: true,
      videos: true,
      appData: true
    },
    intensity: {
      min: 0,
      max: 100,
      enabled: false
    },
    location: {
      enabled: false
    },
    platforms: {
      enabled: false,
      selected: []
    }
  })

  const [isOpen, setIsOpen] = useState(false)
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([])

  useEffect(() => {
    // Extract available platforms from data
    if (data?.communication_network?.metadata?.platforms) {
      setAvailablePlatforms(data.communication_network.metadata.platforms)
    }
  }, [data])

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleTimeRangeChange = (field: 'start' | 'end', value: string) => {
    updateFilters({
      timeRange: {
        ...filters.timeRange,
        [field]: value
      }
    })
  }

  const handleDataTypeChange = (type: keyof FilterState['dataTypes'], enabled: boolean) => {
    updateFilters({
      dataTypes: {
        ...filters.dataTypes,
        [type]: enabled
      }
    })
  }

  const handleIntensityChange = (field: 'min' | 'max', value: number) => {
    updateFilters({
      intensity: {
        ...filters.intensity,
        [field]: value
      }
    })
  }

  const handlePlatformToggle = (platform: string) => {
    const selected = filters.platforms.selected.includes(platform)
      ? filters.platforms.selected.filter(p => p !== platform)
      : [...filters.platforms.selected, platform]
    
    updateFilters({
      platforms: {
        ...filters.platforms,
        selected
      }
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.timeRange.enabled) count++
    if (filters.intensity.enabled) count++
    if (filters.location.enabled) count++
    if (filters.platforms.enabled) count++
    if (!Object.values(filters.dataTypes).every(Boolean)) count++
    return count
  }

  const clearAllFilters = () => {
    setFilters({
      timeRange: { start: '', end: '', enabled: false },
      dataTypes: {
        chats: true,
        calls: true,
        images: true,
        videos: true,
        appData: true
      },
      intensity: { min: 0, max: 100, enabled: false },
      location: { enabled: false },
      platforms: { enabled: false, selected: [] }
    })
    onClearFilters()
  }

  if (!isOpen) {
    return (
      <div className="fixed top-4 left-4 z-20">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 hover:bg-zinc-700"
          size="sm"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {getActiveFiltersCount() > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 left-4 z-20 w-80 bg-zinc-800/95 backdrop-blur-sm rounded-lg border border-zinc-700 shadow-xl">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Sliders className="h-5 w-5 mr-2" />
            Visualization Filters
          </h3>
          <div className="flex items-center space-x-2">
            {getActiveFiltersCount() > 0 && (
              <Button
                onClick={clearAllFilters}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Time Range
            </label>
            <Button
              onClick={() => updateFilters({
                timeRange: { ...filters.timeRange, enabled: !filters.timeRange.enabled }
              })}
              variant="ghost"
              size="sm"
              className={filters.timeRange.enabled ? 'text-green-400' : 'text-gray-400'}
            >
              {filters.timeRange.enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
          
          {filters.timeRange.enabled && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-400">Start Date</label>
                <input
                  type="datetime-local"
                  value={filters.timeRange.start}
                  onChange={(e) => handleTimeRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">End Date</label>
                <input
                  type="datetime-local"
                  value={filters.timeRange.end}
                  onChange={(e) => handleTimeRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-sm text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Data Types Filter */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Data Types
          </label>
          <div className="space-y-2">
            {Object.entries(filters.dataTypes).map(([type, enabled]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm capitalize">{type}</span>
                <Button
                  onClick={() => handleDataTypeChange(type as keyof FilterState['dataTypes'], !enabled)}
                  variant="ghost"
                  size="sm"
                  className={enabled ? 'text-green-400' : 'text-gray-400'}
                >
                  {enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Intensity Filter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Activity Intensity</label>
            <Button
              onClick={() => updateFilters({
                intensity: { ...filters.intensity, enabled: !filters.intensity.enabled }
              })}
              variant="ghost"
              size="sm"
              className={filters.intensity.enabled ? 'text-green-400' : 'text-gray-400'}
            >
              {filters.intensity.enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
          
          {filters.intensity.enabled && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Min: {filters.intensity.min}</span>
                  <span>Max: {filters.intensity.max}</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.intensity.min}
                    onChange={(e) => handleIntensityChange('min', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.intensity.max}
                    onChange={(e) => handleIntensityChange('max', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Platform Filter */}
        {availablePlatforms.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Platforms</label>
              <Button
                onClick={() => updateFilters({
                  platforms: { ...filters.platforms, enabled: !filters.platforms.enabled }
                })}
                variant="ghost"
                size="sm"
                className={filters.platforms.enabled ? 'text-green-400' : 'text-gray-400'}
              >
                {filters.platforms.enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
            
            {filters.platforms.enabled && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availablePlatforms.map((platform) => (
                  <div key={platform} className="flex items-center justify-between">
                    <span className="text-sm">{platform}</span>
                    <Button
                      onClick={() => handlePlatformToggle(platform)}
                      variant="ghost"
                      size="sm"
                      className={filters.platforms.selected.includes(platform) ? 'text-green-400' : 'text-gray-400'}
                    >
                      {filters.platforms.selected.includes(platform) ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Apply Filters Button */}
        <Button
          onClick={onApplyFilters}
          className="w-full"
          disabled={getActiveFiltersCount() === 0}
        >
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters ({getActiveFiltersCount()})
        </Button>
      </div>
    </div>
  )
}

