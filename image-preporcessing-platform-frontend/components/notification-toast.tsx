"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
  duration?: number
}

interface NotificationToastProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function NotificationToast({ toasts, onRemove }: NotificationToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium ${
              toast.type === "success" ? "bg-success" : toast.type === "error" ? "bg-error" : "bg-primary"
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: "success" | "error" | "info" = "info", duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = { id, message, type, duration }

    setToasts((prev) => [...prev, toast])

    if (duration) {
      setTimeout(() => removeToast(id), duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}
