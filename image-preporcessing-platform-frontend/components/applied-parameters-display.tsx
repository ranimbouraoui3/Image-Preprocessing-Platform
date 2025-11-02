"use client"

import { useState, useEffect } from "react"
import { apiService, type TransformationHistory } from "@/lib/api-service"

interface AppliedParametersDisplayProps {
  imageId: string
}

export function AppliedParametersDisplay({ imageId }: AppliedParametersDisplayProps) {
  const [history, setHistory] = useState<TransformationHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHistory()
    // Refresh history every 2 seconds to show real-time updates
    const interval = setInterval(loadHistory, 2000)
    return () => clearInterval(interval)
  }, [imageId])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const historyData = await apiService.getImageHistory(imageId)
      setHistory(historyData)
    } catch (error) {
      console.error("Failed to load history:", error)
    } finally {
      setLoading(false)
    }
  }

  const getParameterDescription = (key: string, value: any): string => {
    const descriptions: Record<string, (v: any) => string> = {
      grayscale: (v) => "Grayscale filter applied",
      normalize: (v) => "Image normalization applied",
      blur: (v) => `Blur intensity: ${v}px`,
      brightness: (v) => `Brightness: ${(v * 100).toFixed(0)}%`,
      contrast: (v) => `Contrast: ${(v * 100).toFixed(0)}%`,
      saturation: (v) => `Saturation: ${(v * 100).toFixed(0)}%`,
      threshold: (v) => `Threshold value: ${v}`,
      rotate: (v) => `Rotation: ${v}°`,
      flip_horizontal: (v) => "Flipped horizontally",
      flip_vertical: (v) => "Flipped vertically",
      resize: (v) => (Array.isArray(v) ? `Resized to ${v[0]}×${v[1]}px` : `Resized to ${v.width}×${v.height}px`),
      channel_split: (v) => `${v.charAt(0).toUpperCase() + v.slice(1)} channel extracted`,
      histogram_equalization: (v) => "Histogram equalization applied",
    }

    return descriptions[key]?.(value) || `${key}: ${JSON.stringify(value)}`
  }

  const latestTransformation = history[history.length - 1]?.transformation || {}
  const appliedParams = Object.entries(latestTransformation).filter(
    ([, v]) => v !== undefined && v !== false && v !== null,
  )

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          Applied Parameters
          {loading && <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />}
        </h2>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {appliedParams.length === 0 ? (
          <p className="text-secondary text-sm italic">No transformations applied yet</p>
        ) : (
          appliedParams.map(([key, value]) => (
            <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-secondary/30">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{getParameterDescription(key, value)}</p>
                <p className="text-xs text-secondary mt-1">
                  {history[history.length - 1]?.timestamp
                    ? new Date(history[history.length - 1].timestamp).toLocaleTimeString()
                    : ""}
                </p>
              </div>
            </div>
          ))
        )}

        {/* History Summary */}
        {history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-secondary mb-2 font-medium">TRANSFORMATION HISTORY ({history.length})</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {history.map((item, idx) => {
                const paramCount = Object.entries(item.transformation).filter(
                  ([, v]) => v !== undefined && v !== false && v !== null,
                ).length
                return (
                  <div key={idx} className="text-xs text-secondary">
                    <span className="font-medium">Step {idx + 1}:</span> {paramCount} parameter
                    {paramCount !== 1 ? "s" : ""} applied
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
