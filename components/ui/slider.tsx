"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  max?: number
  min?: number
  step?: number
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, defaultValue = [0], onValueChange, max = 100, min = 0, step = 1, disabled = false, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<number[]>(value || defaultValue)
    const [isDragging, setIsDragging] = React.useState(false)
    const sliderRef = React.useRef<HTMLDivElement>(null)
    
    const currentValue = value || internalValue
    const percentage = ((currentValue[0] - min) / (max - min)) * 100

    const updateValue = (newValue: number[]) => {
      const clampedValue = [Math.max(min, Math.min(max, newValue[0]))]
      setInternalValue(clampedValue)
      onValueChange?.(clampedValue)
    }

    const handleMouseDown = (event: React.MouseEvent) => {
      if (disabled) return
      
      setIsDragging(true)
      const rect = sliderRef.current?.getBoundingClientRect()
      if (rect) {
        const percentage = (event.clientX - rect.left) / rect.width
        const newValue = min + percentage * (max - min)
        updateValue([newValue])
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || disabled) return
      
      const rect = sliderRef.current?.getBoundingClientRect()
      if (rect) {
        const percentage = (event.clientX - rect.left) / rect.width
        const newValue = min + percentage * (max - min)
        updateValue([newValue])
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging])

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])

    return (
      <div
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        {...props}
      >
        <div
          ref={sliderRef}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
          <div
            className="absolute h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            style={{
              left: `${percentage}%`,
              transform: 'translateX(-50%)',
              top: '-6px'
            }}
          />
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
