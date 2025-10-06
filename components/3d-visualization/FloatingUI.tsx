'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, RotateCcw, Maximize2, Eye, Layers } from 'lucide-react'

interface DataPoint {
  id: string
  label: string
  category: string
  value: number
  metadata?: any
}

interface FloatingUIProps {
  selectedPoint: DataPoint | null
  onClose: () => void
  onExport?: () => void
  onReset?: () => void
  stats?: {
    totalPoints: number
    categories: number
    connections: number
  }
}

export default function FloatingUI({
  selectedPoint,
  onClose,
  onExport,
  onReset,
  stats
}: FloatingUIProps) {
  return (
    <>
      {/* Stats Panel */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white max-w-xs"
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Visualization Stats
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Data Points:</span>
              <span className="font-semibold">{stats.totalPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Categories:</span>
              <span className="font-semibold">{stats.categories}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Connections:</span>
              <span className="font-semibold">{stats.connections}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20">
            <h4 className="text-xs font-semibold mb-2 text-blue-300">💡 How to Use:</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• <strong>Hover</strong> over spheres for details</li>
              <li>• <strong>Click</strong> to select and see connections</li>
              <li>• <strong>Drag</strong> to rotate the view</li>
              <li>• <strong>Scroll</strong> to zoom in/out</li>
              <li>• Lines show <strong>relationships</strong></li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {onReset && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 text-white hover:bg-white/20 transition-colors"
            title="Reset View (R)"
          >
            <RotateCcw className="h-5 w-5" />
          </motion.button>
        )}
        
        {onExport && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExport}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 text-white hover:bg-white/20 transition-colors"
            title="Export Scene (E)"
          >
            <Download className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      {/* Selected Point Details */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white max-w-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Data Point Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Label</label>
                <p className="text-sm font-medium mt-1">{selectedPoint.label}</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Category</label>
                <p className="text-sm font-medium mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                    {selectedPoint.category}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Value</label>
                <p className="text-sm font-medium mt-1">{selectedPoint.value}</p>
              </div>

              {selectedPoint.metadata && (
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Metadata</label>
                  <div className="mt-1 text-xs bg-black/30 rounded p-2 max-h-32 overflow-y-auto">
                    <pre className="text-gray-300">
                      {JSON.stringify(selectedPoint.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white max-w-xs"
      >
        <h3 className="text-sm font-semibold mb-3">Data Categories</h3>
        <div className="space-y-2">
          {[
            { name: 'Chat', color: '#3b82f6', icon: '💬' },
            { name: 'Call', color: '#10b981', icon: '📞' },
            { name: 'Image', color: '#f59e0b', icon: '🖼️' },
            { name: 'Video', color: '#ef4444', icon: '🎥' },
            { name: 'App', color: '#8b5cf6', icon: '📱' },
            { name: 'Location', color: '#ec4899', icon: '📍' }
          ].map((category) => (
            <div key={category.name} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full shadow-lg"
                style={{
                  backgroundColor: category.color,
                  boxShadow: `0 0 10px ${category.color}50`
                }}
              />
              <span className="text-lg">{category.icon}</span>
              <span>{category.name}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <h4 className="text-xs font-semibold mb-2">Connection Lines</h4>
          <div className="space-y-1 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-white/60"></div>
              <span>Same category</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-400/40"></div>
              <span>Cross category</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-white"></div>
              <span>Selected/Hovered</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Keyboard Shortcuts Help */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white text-xs"
      >
        <div className="flex gap-4 items-center">
          <span className="font-semibold">Controls:</span>
          <span><kbd className="bg-white/20 px-2 py-1 rounded">R</kbd> Reset</span>
          <span><kbd className="bg-white/20 px-2 py-1 rounded">F</kbd> Focus</span>
          <span><kbd className="bg-white/20 px-2 py-1 rounded">E</kbd> Export</span>
          <span className="text-gray-300">|</span>
          <span><kbd className="bg-white/20 px-2 py-1 rounded">🖱️ Drag</kbd> Rotate</span>
          <span><kbd className="bg-white/20 px-2 py-1 rounded">Scroll</kbd> Zoom</span>
        </div>
      </motion.div>
    </>
  )
}

