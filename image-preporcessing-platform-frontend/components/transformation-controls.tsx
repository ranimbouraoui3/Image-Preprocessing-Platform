"use client"

import type React from "react"

import { useState } from "react"
import type { TransformationParams } from "@/lib/api-service"

interface TransformationControlsProps {
  onTransform: (params: TransformationParams) => void
  isLoading?: boolean
}

export function TransformationControls({ onTransform, isLoading = false }: TransformationControlsProps) {
  const [params, setParams] = useState<TransformationParams>({})
  const [expandedSection, setExpandedSection] = useState<string | null>("basic")
  const [selectedChannel, setSelectedChannel] = useState<"red" | "green" | "blue" | null>(null)
  const [resizeWidth, setResizeWidth] = useState("")
  const [resizeHeight, setResizeHeight] = useState("")
  const [resizeError, setResizeError] = useState("")

  const handleToggle = (key: keyof TransformationParams, value: boolean) => {
    const newParams = { ...params, [key]: value }
    setParams(newParams)
    onTransform(newParams)
  }

  const handleSliderChange = (key: keyof TransformationParams, value: number) => {
    const newParams = { ...params, [key]: value }
    setParams(newParams)
    onTransform(newParams)
  }

  const handleResizeChange = (type: "width" | "height", value: string) => {
    if (type === "width") {
      setResizeWidth(value)
    } else {
      setResizeHeight(value)
    }
    setResizeError("")
  }

  const applyResize = () => {
    const w = Number(resizeWidth)
    const h = Number(resizeHeight)

    if (w <= 0 || h <= 0 || !resizeWidth || !resizeHeight) {
      setResizeError("Both width and height must be positive numbers")
      return
    }

    setResizeError("")
    const resizeTuple: [number, number] = [w, h]
    const newParams = { ...params, resize: resizeTuple }
    setParams(newParams)
    onTransform(newParams)
  }

  const handleResizeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyResize()
    }
  }

  const handleFlip = (direction: "horizontal" | "vertical") => {
    const key = direction === "horizontal" ? "flip_horizontal" : "flip_vertical"
    const newValue = !(params[key as keyof TransformationParams] as boolean)
    const newParams = { ...params, [key]: newValue }
    setParams(newParams)
    onTransform(newParams)
  }

  const handleChannelSplit = (channel: "red" | "green" | "blue") => {
    if (selectedChannel === channel) {
      setSelectedChannel(null)
      const newParams = { ...params, channel_split: undefined }
      setParams(newParams)
      onTransform(newParams)
    } else {
      setSelectedChannel(channel)
      const newParams = { ...params, channel_split: channel }
      setParams(newParams)
      onTransform(newParams)
    }
  }

  const Section = ({
    title,
    id,
    children,
  }: {
    title: string
    id: string
    children: React.ReactNode
  }) => (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <h3 className="font-semibold text-foreground">{title}</h3>
        <svg
          className={`w-4 h-4 transition-transform ${expandedSection === id ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
      {expandedSection === id && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  )

  const SliderControl = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
  }: {
    label: string
    value: number
    min: number
    max: number
    step: number
    onChange: (value: number) => void
  }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={isLoading}
        className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
      />
    </div>
  )

  const ToggleButton = ({
    label,
    checked,
    onChange,
  }: {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
  }) => (
    <button
      onClick={() => onChange(!checked)}
      disabled={isLoading}
      className={`w-full px-3 py-2 rounded-lg font-medium transition-colors ${
        checked ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      } disabled:opacity-50`}
    >
      {label}
    </button>
  )

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Transformations</h2>
      </div>

      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {/* Basic Transformations */}
        <Section title="Basic" id="basic">
          <div className="space-y-4">
            <ToggleButton
              label={params.grayscale ? "Grayscale: ON" : "Grayscale: OFF"}
              checked={params.grayscale || false}
              onChange={(checked) => handleToggle("grayscale", checked)}
            />
            <ToggleButton
              label={params.normalize ? "Normalize: ON" : "Normalize: OFF"}
              checked={params.normalize || false}
              onChange={(checked) => handleToggle("normalize", checked)}
            />
          </div>
        </Section>

        {/* Color Adjustments */}
        <Section title="Color Adjustments" id="color">
          <div className="space-y-4">
            <SliderControl
              label="Brightness"
              value={params.brightness || 1}
              min={0.5}
              max={2}
              step={0.1}
              onChange={(value) => handleSliderChange("brightness", value)}
            />
            <SliderControl
              label="Contrast"
              value={params.contrast || 1}
              min={0.5}
              max={2}
              step={0.1}
              onChange={(value) => handleSliderChange("contrast", value)}
            />
            <SliderControl
              label="Saturation"
              value={params.saturation || 1}
              min={0}
              max={2}
              step={0.1}
              onChange={(value) => handleSliderChange("saturation", value)}
            />
          </div>
        </Section>

        {/* Blur & Threshold */}
        <Section title="Filters" id="filters">
          <div className="space-y-4">
            <SliderControl
              label="Blur Intensity"
              value={params.blur || 0}
              min={0}
              max={50}
              step={1}
              onChange={(value) => handleSliderChange("blur", value)}
            />
            <SliderControl
              label="Threshold"
              value={params.threshold || 128}
              min={0}
              max={255}
              step={1}
              onChange={(value) => handleSliderChange("threshold", value)}
            />
          </div>
        </Section>

        {/* Rotation & Flip */}
        <Section title="Rotation & Flip" id="rotation">
          <div className="space-y-4">
            <SliderControl
              label="Rotate (degrees)"
              value={params.rotate || 0}
              min={-180}
              max={180}
              step={1}
              onChange={(value) => handleSliderChange("rotate", value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleFlip("horizontal")}
                disabled={isLoading}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                  params.flip_horizontal
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                } disabled:opacity-50`}
              >
                Flip H
              </button>
              <button
                onClick={() => handleFlip("vertical")}
                disabled={isLoading}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                  params.flip_vertical
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                } disabled:opacity-50`}
              >
                Flip V
              </button>
            </div>
          </div>
        </Section>

        {/* Resize */}
        <Section title="Resize" id="resize">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Width (px)</label>
              <input
                type="number"
                value={resizeWidth}
                onChange={(e) => handleResizeChange("width", e.target.value)}
                onKeyDown={handleResizeKeyDown}
                disabled={isLoading}
                placeholder="Enter width"
                min="1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-secondary disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Height (px)</label>
              <input
                type="number"
                value={resizeHeight}
                onChange={(e) => handleResizeChange("height", e.target.value)}
                onKeyDown={handleResizeKeyDown}
                disabled={isLoading}
                placeholder="Enter height"
                min="1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-secondary disabled:opacity-50"
              />
            </div>
            {resizeError && <p className="text-xs text-red-500">{resizeError}</p>}
            <button
              onClick={applyResize}
              disabled={isLoading || !resizeWidth || !resizeHeight}
              className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-medium text-sm transition-colors"
            >
              Apply Resize
            </button>
            {params.resize && (
              <p className="text-xs text-green-600">
                Ready: {params.resize[0]}x{params.resize[1]}
              </p>
            )}
          </div>
        </Section>

        {/* Channel Split */}
        <Section title="Channel Split" id="channel">
          <div className="space-y-3">
            <p className="text-xs text-secondary">Extract individual color channels as grayscale</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleChannelSplit("red")}
                disabled={isLoading}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors text-white ${
                  selectedChannel === "red" ? "bg-red-600 ring-2 ring-red-400" : "bg-red-500 hover:bg-red-600"
                } disabled:opacity-50`}
              >
                Red
              </button>
              <button
                onClick={() => handleChannelSplit("green")}
                disabled={isLoading}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors text-white ${
                  selectedChannel === "green" ? "bg-green-600 ring-2 ring-green-400" : "bg-green-500 hover:bg-green-600"
                } disabled:opacity-50`}
              >
                Green
              </button>
              <button
                onClick={() => handleChannelSplit("blue")}
                disabled={isLoading}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors text-white ${
                  selectedChannel === "blue" ? "bg-blue-600 ring-2 ring-blue-400" : "bg-blue-500 hover:bg-blue-600"
                } disabled:opacity-50`}
              >
                Blue
              </button>
            </div>
          </div>
        </Section>

        {/* Advanced */}
        <Section title="Advanced" id="advanced">
          <div className="space-y-4">
            <ToggleButton
              label={params.histogram_equalization ? "Histogram EQ: ON" : "Histogram EQ: OFF"}
              checked={params.histogram_equalization || false}
              onChange={(checked) => handleToggle("histogram_equalization", checked)}
            />
          </div>
        </Section>
      </div>
    </div>
  )
}
