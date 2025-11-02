"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface SplitViewProps {
  originalImage: string
  processedImage: string
  originalLabel?: string
  processedLabel?: string
  onShowComparison?: (show: boolean) => void
}

export function SplitView({
  originalImage,
  processedImage,
  originalLabel = "Original",
  processedLabel = "Processed",
  onShowComparison,
}: SplitViewProps) {
  const [viewMode, setViewMode] = useState<"split" | "comparison">("split")
  const [dividerPos, setDividerPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [fadeOpacity, setFadeOpacity] = useState(0.5)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const newPos = ((e.clientX - rect.left) / rect.width) * 100
      setDividerPos(Math.max(0, Math.min(100, newPos)))
    }

    const handleMouseUp = () => setIsDragging(false)

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  if (viewMode === "comparison") {
    return (
      <div ref={containerRef} className="relative w-full h-full bg-border rounded-lg overflow-hidden flex flex-col">
        {/* Toggle Buttons */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setViewMode("split")}
            className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            Split View
          </button>
          <button
            onClick={() => setFadeOpacity(Math.max(0, fadeOpacity - 0.1))}
            className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs"
            title="Reduce overlay opacity"
          >
            -
          </button>
          <button
            onClick={() => setFadeOpacity(Math.min(1, fadeOpacity + 0.1))}
            className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs"
            title="Increase overlay opacity"
          >
            +
          </button>
        </div>

        <div className="flex flex-1 gap-2 p-4">
          {/* Original */}
          <div className="flex-1 relative rounded-lg overflow-hidden bg-background">
            <img
              src={originalImage || "/placeholder.svg"}
              alt={originalLabel}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
              {originalLabel}
            </div>
          </div>

          {/* Processed with Overlay */}
          <div className="flex-1 relative rounded-lg overflow-hidden bg-background">
            <img
              src={processedImage || "/placeholder.svg"}
              alt={processedLabel}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-white" style={{ opacity: 1 - fadeOpacity }} />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
              {processedLabel}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Original split view with slider
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-border rounded-lg overflow-hidden cursor-col-resize select-none flex flex-col"
    >
      {/* Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setViewMode("comparison")}
          className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          Compare
        </button>
      </div>

      {/* Original Image */}
      <div className="absolute inset-0">
        <img
          src={originalImage || "/placeholder.svg"}
          alt={originalLabel}
          className="w-full h-full object-contain bg-background"
        />
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm font-medium">
          {originalLabel}
        </div>
      </div>

      {/* Processed Image */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${dividerPos}%` }}>
        <img
          src={processedImage || "/placeholder.svg"}
          alt={processedLabel}
          className="w-full h-full object-contain bg-background"
          style={{ width: `${(100 / dividerPos) * 100}%` }}
        />
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm font-medium">
          {processedLabel}
        </div>
      </div>

      {/* Divider */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-primary cursor-col-resize hover:w-2 transition-all"
        style={{ left: `${dividerPos}%`, transform: "translateX(-50%)" }}
        onMouseDown={() => setIsDragging(true)}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full shadow-lg">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1zm4 0a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" />
          </svg>
        </div>
      </motion.div>
    </div>
  )
}
