"use client"

import { useState, useEffect } from "react"
import { apiService, type TransformationHistory } from "@/lib/api-service"

interface ImageHistoryProps {
  imageId: string
  onRevert?: (stepIndex: number) => void
}

export function ImageHistory({ imageId, onRevert }: ImageHistoryProps) {
  const [history, setHistory] = useState<TransformationHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [revertingStep, setRevertingStep] = useState<number | null>(null)
  const [previewingStep, setPreviewingStep] = useState<number | null>(null)

  useEffect(() => {
    loadHistory()
  }, [imageId])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      const historyData = await apiService.getImageHistory(imageId)
      console.log("[v0] History loaded:", historyData)
      setHistory(historyData)
    } catch (error) {
      console.error("[v0] Failed to load history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevert = async (stepIndex: number) => {
    try {
      setRevertingStep(stepIndex)
      console.log("[v0] Reverting to step:", stepIndex)

      if (onRevert) {
        onRevert(stepIndex)
      }

      // Reload history after revert
      setTimeout(() => {
        loadHistory()
        setRevertingStep(null)
        setPreviewingStep(null)
      }, 500)
    } catch (error) {
      console.error("[v0] Revert failed:", error)
      setRevertingStep(null)
    }
  }

  const handlePreview = (stepIndex: number) => {
    setPreviewingStep(previewingStep === stepIndex ? null : stepIndex)
  }

  const formatTransformation = (transform: any): string => {
    const parts: string[] = []
    if (transform.grayscale) parts.push("Grayscale")
    if (transform.blur) parts.push(`Blur (${transform.blur})`)
    if (transform.brightness) parts.push(`Brightness (${transform.brightness.toFixed(2)})`)
    if (transform.contrast) parts.push(`Contrast (${transform.contrast.toFixed(2)})`)
    if (transform.saturation) parts.push(`Saturation (${transform.saturation.toFixed(2)})`)
    if (transform.threshold) parts.push(`Threshold (${transform.threshold})`)
    if (transform.rotate) parts.push(`Rotate (${transform.rotate}°)`)
    if (transform.flip_horizontal) parts.push("Flip H")
    if (transform.flip_vertical) parts.push("Flip V")
    if (transform.resize) parts.push(`Resize (${transform.resize[0]}x${transform.resize[1]})`)
    if (transform.normalize) parts.push("Normalize")
    if (transform.histogram_equalization) parts.push("Histogram EQ")
    if (transform.channel_split) parts.push(`Channel: ${transform.channel_split}`)
    return parts.length > 0 ? parts.join(", ") : "Unknown transformation"
  }

  if (isLoading && history.length === 0) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-secondary text-sm">Loading history...</p>
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border">
        <p className="text-secondary text-sm text-center">No transformations applied yet</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors border-b border-border"
      >
        <h3 className="font-semibold text-foreground">History ({history.length})</h3>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isExpanded && (
        <div className="max-h-96 overflow-y-auto divide-y divide-border">
          {history.map((item, index) => (
            <div
              key={index}
              className={`p-3 hover:bg-secondary/30 transition-colors ${revertingStep === index ? "bg-primary/10" : previewingStep === index ? "bg-secondary/20" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePreview(index)}>
                  <p className="text-xs font-medium text-primary">Step {history.length - index}</p>
                  <p className="text-xs text-secondary mt-1 break-words">{formatTransformation(item.transformation)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs text-secondary whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => handleRevert(index)}
                    disabled={revertingStep === index}
                    className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {revertingStep === index ? "Reverting..." : "Revert"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
