"use client"

import { useState, useEffect } from "react"
import { apiService, type TransformationParams } from "@/lib/api-service"

interface ParametersDisplayProps {
  imageId: string
}

export function ParametersDisplay({ imageId }: ParametersDisplayProps) {
  const [history, setHistory] = useState<Array<{ params: TransformationParams; applied_at: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadHistory()
    const interval = setInterval(loadHistory, 2000) // Refresh every 2 seconds for real-time updates
    return () => clearInterval(interval)
  }, [imageId])

  const loadHistory = async () => {
    try {
      const historyData = await apiService.getImageHistory(imageId)
      setHistory(historyData as any)
    } catch (error) {
      console.error("Failed to load history:", error)
    }
  }

  const getLatestParams = () => {
    if (history.length === 0) return null
    return history[history.length - 1].params
  }

  const formatParamValue = (key: string, value: any): string => {
    if (value === true) return "ON"
    if (value === false) return "OFF"
    if (Array.isArray(value)) return `${value[0]}×${value[1]}`
    if (typeof value === "number") {
      if (key === "brightness" || key === "contrast" || key === "saturation") {
        return `${(value * 100).toFixed(0)}%`
      }
      if (key === "blur" || key === "rotate" || key === "threshold") {
        return value.toFixed(0)
      }
      return value.toFixed(1)
    }
    return String(value)
  }

  const getParamLabel = (key: string): string => {
    const labels: Record<string, string> = {
      grayscale: "Grayscale",
      blur: "Blur",
      brightness: "Brightness",
      contrast: "Contrast",
      saturation: "Saturation",
      threshold: "Threshold",
      rotate: "Rotation",
      flip_horizontal: "Flip H",
      flip_vertical: "Flip V",
      resize: "Resize",
      normalize: "Normalize",
      histogram_equalization: "Histogram EQ",
      channel_split: "Channel",
    }
    return labels[key] || key
  }

  const latestParams = getLatestParams()

  if (!latestParams || Object.keys(latestParams).length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-secondary">No transformations applied</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Applied Parameters</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(latestParams).map(([key, value]) => (
          <div
            key={key}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs"
          >
            <span className="font-medium text-blue-900">{getParamLabel(key)}:</span>
            <span className="text-blue-700 font-semibold">{formatParamValue(key, value)}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-secondary pt-2">
        Total transformations: <span className="font-semibold text-foreground">{history.length}</span>
      </div>
    </div>
  )
}
