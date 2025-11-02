"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ImageUploader } from "@/components/image-uploader"
import { ImageGallery } from "@/components/image-gallery"
import { NotificationToast, useToast } from "@/components/notification-toast"
import { apiService, type ImageData } from "@/lib/api-service"

export default function Dashboard() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [images, setImages] = useState<ImageData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGallery, setIsLoadingGallery] = useState(true)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      setIsLoadingGallery(true)
      const data = await apiService.listImages()
      setImages(data)
    } catch (error) {
      addToast("Failed to load images", "error")
    } finally {
      setIsLoadingGallery(false)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      setIsLoading(true)
      const uploadedImage = await apiService.uploadImage(file)
      setImages((prev) => [uploadedImage, ...prev])
      addToast("Image uploaded successfully", "success")
      // Redirect to editor after a short delay
      setTimeout(() => {
        router.push(`/editor/${uploadedImage.id}`)
      }, 500)
    } catch (error) {
      addToast("Failed to upload image", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectImage = (image: ImageData) => {
    router.push(`/editor/${image.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Image Preprocessing</h1>
              <p className="text-secondary text-sm mt-1">Transform and enhance your images</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Upload Image</h2>
          <ImageUploader onUpload={handleUpload} isLoading={isLoading} />
        </div>

        {/* Gallery Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Images</h2>
          <ImageGallery images={images} onSelect={handleSelectImage} isLoading={isLoadingGallery} />
        </div>
      </main>

      {/* Toast Notifications */}
      <NotificationToast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
