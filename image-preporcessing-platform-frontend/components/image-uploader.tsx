"use client"

import type React from "react"

import { useRef, useState } from "react"
import { motion } from "framer-motion"

interface ImageUploaderProps {
  onUpload: (file: File) => void
  isLoading?: boolean
}

export function ImageUploader({ onUpload, isLoading = false }: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      onUpload(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0])
    }
  }

  return (
    <motion.div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      animate={{ scale: isDragActive ? 1.02 : 1 }}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? "border-primary bg-blue-50" : "border-border bg-card hover:border-primary"
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
      />

      <div className="space-y-2">
        <div className="text-4xl">📸</div>
        <h3 className="font-semibold text-lg">Drag and drop your image</h3>
        <p className="text-secondary text-sm">or click to browse</p>
        {isLoading && <p className="text-primary text-sm font-medium">Uploading...</p>}
      </div>
    </motion.div>
  )
}
