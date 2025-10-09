"use client"

import { useState } from 'react'
import { Upload, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UploadOneVideoPage() {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    try {
      // Handle single video upload
      console.log('Uploading video:', file.name)
      // Add your upload logic here
      
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Video uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Single Video</h1>
          <p className="text-gray-300">Upload and analyze a single video file</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-white/50 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-white/60" />
              <p className="text-white/80 mb-2">
                {isUploading ? 'Uploading...' : 'Click to upload video'}
              </p>
              <p className="text-sm text-white/60">
                Supports MP4, AVI, MOV, and other video formats
              </p>
            </div>
          </label>

          {isUploading && (
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-white/60">Processing video...</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
            onClick={() => window.history.back()}
          >
            Back to Uploads
          </Button>
        </div>
      </div>
    </div>
  )
}
