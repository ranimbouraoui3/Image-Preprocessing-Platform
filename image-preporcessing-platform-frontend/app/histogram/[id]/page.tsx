"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { HistogramViewer } from "@/components/histogram-viewer"
import { NotificationToast, useToast } from "@/components/notification-toast"
import { apiService, type ImageData } from "@/lib/api-service"
import { ParametersDisplay } from "@/components/parameters-display"
import Link from "next/link"

export default function HistogramPage() {
  const params = useParams()
  const router = useRouter()
  const imageId = params.id as string
  const { toasts, addToast, removeToast } = useToast()

  const [image, setImage] = useState<ImageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    loadImage()
  }, [imageId])

  const loadImage = async () => {
    try {
      setIsLoading(true)
      const imageData = await apiService.getImage(imageId)
      setImage(imageData)
    } catch (error) {
      addToast("Failed to load image", "error")
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary">Loading image...</p>
        </div>
      </div>
    )
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary mb-4">Image not found</p>
          <Link href="/" className="text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/editor/${imageId}`} className="text-primary hover:underline text-sm font-medium">
              ← Back to Editor
            </Link>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm transition-colors"
            >
              {showPreview ? "View Processed" : "View Original"}
            </button>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Histogram Analysis</h1>
          <p className="text-secondary text-sm mt-1">{image.filename}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Original Image and Histogram Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Original Image</h2>
                <p className="text-xs text-secondary mt-1">Unprocessed source image</p>
              </div>
              <div className="p-4 flex items-center justify-center bg-background" style={{ minHeight: "350px" }}>
                <img
                  src={image.url || "/placeholder.svg"}
                  alt="Original"
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Original Histogram</h2>
                <p className="text-xs text-secondary mt-1">Color channel distribution</p>
              </div>
              <div className="p-4">
                <HistogramViewer imageId={imageId} type="original" />
              </div>
            </div>
          </div>

          {/* Processed Image and Histogram Section */}
          {showPreview && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Edited Image</h2>
                  <p className="text-xs text-secondary mt-1">With applied transformations</p>
                </div>
                <div className="p-4 flex items-center justify-center bg-background" style={{ minHeight: "350px" }}>
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt="Processed"
                    className="max-w-full max-h-full object-contain rounded"
                  />
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Edited Histogram</h2>
                  <p className="text-xs text-secondary mt-1">Updates with transformations</p>
                </div>
                <div className="p-4 space-y-4">
                  <HistogramViewer imageId={imageId} type="processed" />
                  <div className="border-t border-border pt-4">
                    <ParametersDisplay imageId={imageId} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notifications */}
      <NotificationToast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
