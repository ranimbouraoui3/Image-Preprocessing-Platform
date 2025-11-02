"use client"

import { useState } from "react"
import { apiService, type DetectionResult } from "@/lib/api-service"

interface DetectionROIProps {
  imageId: string
  imageUrl: string
  onDetectComplete: (result: DetectionResult) => void
  isLoading?: boolean
}

interface DetectionHistoryEntry {
  timestamp: string
  method: "contour" | "face"
  roiCount: number
  hasMask: boolean
}

export function DetectionROI({ imageId, imageUrl, onDetectComplete, isLoading = false }: DetectionROIProps) {
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionMethod, setDetectionMethod] = useState<"contour" | "face">("contour")
  const [error, setError] = useState<string | null>(null)
  const [detectionHistory, setDetectionHistory] = useState<DetectionHistoryEntry[]>([])
  const [highlightedRoiIndex, setHighlightedRoiIndex] = useState<number | null>(null)
  const [lastDetectionResult, setLastDetectionResult] = useState<DetectionResult | null>(null)

  const handleDetect = async () => {
    try {
      setIsDetecting(true)
      setError(null)
      console.log("[v0] Starting detection with method:", detectionMethod)
      const result = await apiService.detectROI(imageId, detectionMethod)
      console.log("[v0] Detection result:", result)

      // Add to history
      const historyEntry: DetectionHistoryEntry = {
        timestamp: new Date().toLocaleTimeString(),
        method: detectionMethod,
        roiCount: result.rois.length,
        hasMask: !!result.mask,
      }
      setDetectionHistory((prev) => [...prev, historyEntry])
      setLastDetectionResult(result)
      setHighlightedRoiIndex(null)

      onDetectComplete(result)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Detection failed"
      console.error("[v0] Detection error:", errorMsg)
      setError(errorMsg)
    } finally {
      setIsDetecting(false)
    }
  }

  return (
    <div className="bg-card rounded-lg p-4 border border-border space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Detection / ROI</h3>
        <label className="text-xs font-medium text-secondary block mb-2">Method</label>
        <select
          value={detectionMethod}
          onChange={(e) => setDetectionMethod(e.target.value as "contour" | "face")}
          disabled={isDetecting || isLoading}
          className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg border border-border disabled:opacity-50 text-sm"
        >
          <option value="contour">Contour Detection</option>
          <option value="face">Face Detection</option>
        </select>
      </div>

      <button
        onClick={handleDetect}
        disabled={isDetecting || isLoading}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center justify-center gap-2"
      >
        {isDetecting && (
          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        )}
        {isDetecting ? "Detecting..." : "Apply Detection"}
      </button>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      {lastDetectionResult && lastDetectionResult.rois.length > 0 && (
        <div className="border-t border-border pt-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">
            Detected ROIs ({lastDetectionResult.rois.length})
          </h4>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {lastDetectionResult.rois.map((roi, idx) => (
              <li
                key={idx}
                onClick={() => setHighlightedRoiIndex(highlightedRoiIndex === idx ? null : idx)}
                className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                  highlightedRoiIndex === idx
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/30 text-secondary hover:bg-secondary/50"
                }`}
              >
                <div className="font-medium">ROI {idx + 1}</div>
                <div className="text-xs">
                  x:{Math.round(roi.x)} y:{Math.round(roi.y)}
                </div>
                <div className="text-xs">
                  w:{Math.round(roi.width)} h:{Math.round(roi.height)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {detectionHistory.length > 0 && (
        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-1 mb-2">
            <h4 className="text-xs font-semibold text-foreground">Detection History</h4>
          </div>
          <ul className="space-y-1 max-h-32 overflow-y-auto">
            {detectionHistory.map((entry, idx) => (
              <li key={idx} className="text-xs text-secondary p-2 bg-secondary/20 rounded">
                <div className="font-medium">{entry.method === "face" ? "👤 Face" : "📦 Contour"}</div>
                <div>ROIs: {entry.roiCount}</div>
                <div>{entry.timestamp}</div>
                {entry.hasMask && <div className="text-primary">✓ Mask</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
