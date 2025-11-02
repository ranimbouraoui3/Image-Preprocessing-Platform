const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface ImageData {
  id: string
  filename: string
  url: string
  created_at: string
}

export interface HistogramData {
  red: number[]
  green: number[]
  blue: number[]
  grayscale?: number[]
}

export interface TransformationParams {
  grayscale?: boolean
  blur?: number
  brightness?: number
  contrast?: number
  saturation?: number
  threshold?: number
  rotate?: number
  flip_horizontal?: boolean
  flip_vertical?: boolean
  resize?: [number, number]
  normalize?: boolean
  histogram_equalization?: boolean
  channel_split?: string
}

export interface TransformationHistory {
  transformation: TransformationParams
  timestamp: string
}

export interface DetectionResult {
  id: string
  data: string
  rois: Array<{ x: number; y: number; width: number; height: number }>
  mask?: string
}

export interface PreviewTransformationResponse {
  id: string
  data: string
  size: [number, number]
  applied_params: TransformationParams
}

class APIService {
  private handleError(error: unknown, context: string): never {
    console.error(`[API Error] ${context}:`, error)
    throw new Error(`${context}: ${error instanceof Error ? error.message : "Unknown error"}`)
  }

  private constructImageUrl(imageData: any): string {
    if (imageData.data && imageData.data.startsWith("data:image")) {
      return imageData.data
    }
    if (imageData.url && imageData.url.startsWith("http")) {
      return imageData.url
    }
    if (imageData.url && imageData.url.startsWith("data:image")) {
      return imageData.url
    }
    const imageId = imageData.id || imageData.filename
    return `${API_BASE_URL}/images/${imageId}`
  }

  private normalizeImageData(data: any): ImageData {
    let imageId = data.id
    const filename = data.filename || "image.png"

    if (imageId && imageId.includes(".")) {
      imageId = imageId.split(".")[0]
    }

    if (!imageId && filename && filename.includes(".")) {
      imageId = filename.split(".")[0]
    }

    return {
      id: imageId || "unknown",
      filename: filename,
      url: this.constructImageUrl(data),
      created_at: data.created_at || new Date().toISOString(),
    }
  }

  async uploadImage(file: File): Promise<ImageData> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_BASE_URL}/images`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      return this.normalizeImageData(data)
    } catch (error) {
      this.handleError(error, "Upload failed")
    }
  }

  async listImages(): Promise<ImageData[]> {
    try {
      console.log("[v0] Fetching images from:", `${API_BASE_URL}/images`)
      const response = await fetch(`${API_BASE_URL}/images`)

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        console.error("[v0] Response status:", response.status, "Content-Type:", contentType)
        throw new Error(`HTTP ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        console.error("[v0] Expected JSON but got:", contentType)
        throw new Error(`Invalid response format. Expected JSON but got ${contentType}`)
      }

      const data = await response.json()
      const imagesList = Array.isArray(data) ? data : data.images || []
      return imagesList.map((img: any) => this.normalizeImageData(img))
    } catch (error) {
      this.handleError(error, "Failed to fetch images")
    }
  }

  async getImage(id: string): Promise<ImageData> {
    try {
      const cleanId = id.includes(".") ? id.split(".")[0] : id
      console.log("[v0] Fetching image:", cleanId)
      const response = await fetch(`${API_BASE_URL}/images/${cleanId}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      return this.normalizeImageData(data)
    } catch (error) {
      this.handleError(error, "Failed to fetch image")
    }
  }

  async previewTransformation(
    id: string,
    params: TransformationParams,
  ): Promise<{ url: string; appliedParams: TransformationParams }> {
    try {
      const cleanId = id.includes(".") ? id.split(".")[0] : id
      const backendParams = this.normalizeTransformationParams(params)
      console.log("[v0] Preview transformation with params:", backendParams)
      const response = await fetch(`${API_BASE_URL}/images/${cleanId}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendParams),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      return {
        url: this.constructImageUrl(data),
        appliedParams: data.applied_params || backendParams,
      }
    } catch (error) {
      this.handleError(error, "Preview failed")
    }
  }

  async applyTransformation(
    id: string,
    params: TransformationParams,
  ): Promise<{ url: string; appliedParams: TransformationParams }> {
    try {
      const cleanId = id.includes(".") ? id.split(".")[0] : id
      const backendParams = this.normalizeTransformationParams(params)
      console.log("[v0] Applying transformation with params:", backendParams)
      const response = await fetch(`${API_BASE_URL}/images/${cleanId}/transform`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendParams),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      return {
        url: this.constructImageUrl(data),
        appliedParams: data.applied_params || backendParams,
      }
    } catch (error) {
      this.handleError(error, "Transformation failed")
    }
  }

  private normalizeTransformationParams(params: TransformationParams): any {
    const normalized: any = {}

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return

      if (key === "resize" && Array.isArray(value)) {
        normalized.resize = [Number.parseInt(String(value[0])), Number.parseInt(String(value[1]))]
      } else if (key === "channel_split" && value) {
        normalized.channel_split = value
      } else if (key === "flip_horizontal" && value) {
        normalized.flip_horizontal = true
      } else if (key === "flip_vertical" && value) {
        normalized.flip_vertical = true
      } else if (value !== false) {
        normalized[key] = value
      }
    })

    return normalized
  }

  async undo(id: string): Promise<{ url: string }> {
    try {
      const cleanId = id.includes(".") ? id.split(".")[0] : id
      const response = await fetch(`${API_BASE_URL}/images/${cleanId}/undo`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      return {
        url: this.constructImageUrl(data),
      }
    } catch (error) {
      this.handleError(error, "Undo failed")
    }
  }

  async redo(id: string): Promise<{ url: string }> {
    try {
      const cleanId = id.includes(".") ? id.split(".")[0] : id
      const response = await fetch(`${API_BASE_URL}/images/${cleanId}/redo`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      return {
        url: this.constructImageUrl(data),
      }
    } catch (error) {
      this.handleError(error, "Redo failed")
    }
  }

  async getHistogram(id: string, type: "original" | "processed" = "processed"): Promise<HistogramData> {
    try {
      const cleanId = id.includes(".") ? id.split(".")[0] : id
      console.log("[v0] Fetching", type, "histogram for:", cleanId)
      const response = await fetch(`${API_BASE_URL}/images/${cleanId}/histograms`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()

      const histograms = data.histograms || data
      const histogram = type === "original" ? histograms.original : histograms.processed

      return {
        red: histogram.red || [],
        green: histogram.green || [],
        blue: histogram.blue || [],
        grayscale: histogram.grayscale || [],
      }
    } catch (error) {
      this.handleError(error, `Failed to fetch ${type} histogram`)
    }
  }

  async getImageHistory(id: string): Promise<TransformationHistory[]> {
    try {
      const cleanId = id.includes(".") ? id.split(".")[0] : id
      console.log("[v0] Fetching history for:", cleanId)
      const response = await fetch(`${API_BASE_URL}/images/${cleanId}/history`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      return data.history || []
    } catch (error) {
      this.handleError(error, "Failed to fetch history")
    }
  }

  async detectROI(id: string, method = "contour"): Promise<DetectionResult> {
    try {
      const cleanId = id.includes(".") ? id.split(".")[0] : id
      console.log("[v0] Detecting ROI for:", cleanId, "method:", method)
      const response = await fetch(`${API_BASE_URL}/images/${cleanId}/detect?method=${method}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      return {
        id: data.id || cleanId,
        data: data.data || this.constructImageUrl(data),
        rois: data.rois || [],
        mask: data.mask,
      }
    } catch (error) {
      this.handleError(error, "ROI detection failed")
    }
  }

  async downloadImage(imageUrl: string, filename: string): Promise<void> {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      this.handleError(error, "Download failed")
    }
  }
}

export const apiService = new APIService()
