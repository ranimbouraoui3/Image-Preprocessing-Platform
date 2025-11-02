"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { HistogramViewer } from "@/components/histogram-viewer"
import { ParametersDisplay } from "@/components/parameters-display"
import { TransformationControls } from "@/components/transformation-controls"
import { NotificationToast, useToast } from "@/components/notification-toast"
import { apiService, type ImageData, type TransformationParams } from "@/lib/api-service"
import { useHistory } from "@/hooks/use-history"
import Link from "next/link"

interface EditorState {
  imageUrl: string
  transformations: TransformationParams
}

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const imageId = params.id as string
  const { toasts, addToast, removeToast } = useToast()

  const [image, setImage] = useState<ImageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplyingTransform, setIsApplyingTransform] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  const {
    state: editorState,
    setState: setEditorState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<EditorState>({
    imageUrl: "",
    transformations: {},
  })

  useEffect(() => {
    loadImage()
  }, [imageId])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        if (canRedo) handleRedo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canUndo, canRedo])

  const loadImage = async () => {
    try {
      setIsLoading(true)
      const imageData = await apiService.getImage(imageId)
      setImage(imageData)
      setEditorState({
        imageUrl: imageData.url,
        transformations: {},
      })
    } catch (error) {
      addToast("Failed to load image", "error")
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUndo = () => {
    undo()
    addToast("Undo applied", "info")
  }

  const handleRedo = () => {
    redo()
    addToast("Redo applied", "info")
  }

  const handleTransform = async (params: TransformationParams) => {
    try {
      setIsApplyingTransform(true)
      const result = await apiService.previewTransformation(imageId, params)

      setEditorState({
        imageUrl: result.url,
        transformations: params,
      })
    } catch (error) {
      addToast("Failed to apply transformation", "error")
    } finally {
      setIsApplyingTransform(false)
    }
  }

  const handleApplyTransform = async () => {
    try {
      setIsApplyingTransform(true)
      const result = await apiService.applyTransformation(imageId, editorState.transformations)
      setEditorState({
        imageUrl: result.url,
        transformations: {},
      })
      addToast("Transformation saved permanently", "success")
    } catch (error) {
      addToast("Failed to save transformation", "error")
    } finally {
      setIsApplyingTransform(false)
    }
  }

  const handleDownload = async () => {
    try {
      setIsApplyingTransform(true)
      const filename = `processed-${image?.filename || "image.png"}`
      await apiService.downloadImage(editorState.imageUrl, filename)
      addToast("Image downloaded successfully", "success")
    } catch (error) {
      addToast("Failed to download image", "error")
    } finally {
      setIsApplyingTransform(false)
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
            <Link href="/" className="text-primary hover:underline text-sm font-medium">
              ← Back to Dashboard
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm transition-colors"
              >
                {showPreview ? "Back to Editor" : "Preview Layout"}
              </button>
              <Link
                href={`/histogram/${imageId}`}
                className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
              >
                Analysis
              </Link>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{image.filename}</h1>
          <p className="text-secondary text-sm mt-1">Image Editor with Real-time Transformations</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {!showPreview ? (
          <div className="space-y-8">
            {/* Section 1: Editor (Edited Image + Controls) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Edited Image with Preview Button */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg border border-border overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {showOriginal ? "Original Image" : "Edited Image"}
                      </h2>
                      <p className="text-xs text-secondary mt-1">
                        {showOriginal ? "Unprocessed source" : "With applied transformations"}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowOriginal(!showOriginal)}
                      className="px-3 py-1.5 rounded text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {showOriginal ? "Show Edited" : "Preview Original"}
                    </button>
                  </div>
                  <div
                    className="p-4 flex items-center justify-center bg-background flex-1"
                    style={{ minHeight: "400px" }}
                  >
                    <img
                      src={showOriginal ? image.url : editorState.imageUrl || image.url}
                      alt={showOriginal ? "Original" : "Edited"}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>

                  {/* Action Buttons Below Image */}
                  <div className="p-4 border-t border-border">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={handleApplyTransform}
                        disabled={isApplyingTransform || Object.keys(editorState.transformations).length === 0}
                        className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                      >
                        Apply & Save
                      </button>
                      <button
                        onClick={handleDownload}
                        disabled={isApplyingTransform}
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                      >
                        Download
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={handleUndo}
                          disabled={!canUndo || isApplyingTransform}
                          className="flex-1 px-2 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                          title="Undo (Ctrl+Z)"
                        >
                          Undo
                        </button>
                        <button
                          onClick={handleRedo}
                          disabled={!canRedo || isApplyingTransform}
                          className="flex-1 px-2 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                          title="Redo (Ctrl+Y)"
                        >
                          Redo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transformation Controls on Right */}
              <div>
                <TransformationControls onTransform={handleTransform} isLoading={isApplyingTransform} />
              </div>
            </div>

            {/* Section 2: Histogram Analysis Section (Original + Processed) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Original Histogram */}
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Original Histogram</h2>
                  <p className="text-xs text-secondary mt-1">Color channel distribution</p>
                </div>
                <div className="p-4">
                  <HistogramViewer imageId={imageId} type="original" />
                </div>
              </div>

              {/* Edited Histogram with Parameters */}
              <div className="bg-card rounded-lg border border-border overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Edited Histogram</h2>
                  <p className="text-xs text-secondary mt-1">Updates with transformations</p>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  <HistogramViewer key={editorState.imageUrl} imageId={imageId} type="processed" />
                  <div className="border-t border-border pt-4">
                    <ParametersDisplay imageId={imageId} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Description Section */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">

              <div className="p-4 space-y-4">

                <div >
                  <h3 className="text-sm font-semibold text-foreground mb-3">Current Parameters</h3>
                  <ParametersDisplay imageId={imageId} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Preview Mode:</strong> Viewing original and edited images side-by-side. Click "Back to Editor"
                to return to editing.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Original Image</h2>
                </div>
                <div className="p-4 flex items-center justify-center bg-background" style={{ minHeight: "500px" }}>
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt="Original"
                    className="max-w-full max-h-full object-contain rounded"
                  />
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Edited Image</h2>
                </div>
                <div className="p-4 flex items-center justify-center bg-background" style={{ minHeight: "500px" }}>
                  <img
                    src={editorState.imageUrl || image.url || "/placeholder.svg"}
                    alt="Edited"
                    className="max-w-full max-h-full object-contain rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notifications */}
      <NotificationToast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
