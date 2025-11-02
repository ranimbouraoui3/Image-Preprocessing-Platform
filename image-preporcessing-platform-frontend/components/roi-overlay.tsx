"use client"

import { useState } from "react"
import type { DetectionResult } from "@/lib/api-service"

interface ROIOverlayProps {
  detectionResult: DetectionResult
  imageSize: { width: number; height: number }
}

export function ROIOverlay({ detectionResult, imageSize }: ROIOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(true)
  const [showMask, setShowMask] = useState(false)

  if (!detectionResult || detectionResult.rois.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 bg-card rounded-lg p-4 border border-border">
      <h4 className="text-sm font-semibold text-foreground">ROI Display</h4>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            id="overlayToggle"
            checked={showOverlay}
            onChange={(e) => setShowOverlay(e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-secondary">Show Overlay Boxes</span>
        </label>

        {detectionResult.mask && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id="maskToggle"
              checked={showMask}
              onChange={(e) => setShowMask(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm text-secondary">Show Mask</span>
          </label>
        )}
      </div>

      {/* Display ROI count */}
      <div className="text-xs text-secondary bg-secondary/20 rounded p-2">
        {detectionResult.rois.length} Region{detectionResult.rois.length !== 1 ? "s" : ""} Detected
      </div>

      {/* ROI Overlay Container - absolutely positioned divs */}
      {showOverlay && (
        <div
          id="roiOverlayContainer"
          className="relative w-full bg-secondary/10 rounded border border-border overflow-hidden"
          style={{ aspectRatio: "16/9" }}
        >
          {detectionResult.rois.map((roi, i) => {
            const scaleX = 100 / (imageSize.width || 1)
            const scaleY = 100 / (imageSize.height || 1)

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  border: "2px solid #ef4444",
                  left: `${roi.x * scaleX}%`,
                  top: `${roi.y * scaleY}%`,
                  width: `${roi.width * scaleX}%`,
                  height: `${roi.height * scaleY}%`,
                  pointerEvents: "none",
                  boxShadow: "0 0 4px rgba(239, 68, 68, 0.5)",
                }}
              >
                <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  ROI {i + 1}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Mask Display */}
      {showMask && detectionResult.mask && (
        <div className="rounded border border-border overflow-hidden">
          <img src={detectionResult.mask || "/placeholder.svg"} alt="Detection Mask" className="w-full h-auto" />
        </div>
      )}
    </div>
  )
}
