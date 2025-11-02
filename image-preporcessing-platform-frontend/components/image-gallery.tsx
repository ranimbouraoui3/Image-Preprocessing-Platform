"use client"

import { motion } from "framer-motion"
import type { ImageData } from "@/lib/api-service"

interface ImageGalleryProps {
  images: ImageData[]
  onSelect: (image: ImageData) => void
  isLoading?: boolean
}

export function ImageGallery({ images, onSelect, isLoading = false }: ImageGalleryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-border rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">No images yet. Upload one to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: Math.random() * 0.2 }}
          onClick={() => onSelect(image)}
          className="group cursor-pointer"
        >
          <div className="relative aspect-square rounded-lg overflow-hidden bg-border hover:shadow-lg transition-shadow">
            <img
              src={image.url || "/placeholder.svg"}
              alt={image.filename || "Image"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
          <p className="text-xs text-secondary mt-2 truncate">{image.filename || "Untitled"}</p>
        </motion.div>
      ))}
    </div>
  )
}
