"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { apiService, type HistogramData } from "@/lib/api-service"

interface HistogramViewerProps {
  imageId: string
  isLoading?: boolean
  type?: "original" | "processed" | "both"
}

export function HistogramViewer({ imageId, isLoading = false, type = "both" }: HistogramViewerProps) {
  const [originalHistogram, setOriginalHistogram] = useState<HistogramData | null>(null)
  const [processedHistogram, setProcessedHistogram] = useState<HistogramData | null>(null)
  const [chartData, setChartData] = useState<{ original: any[]; processed: any[] }>({
    original: [],
    processed: [],
  })
  const [mode, setMode] = useState<"rgb" | "grayscale">("rgb")
  const [chartType, setChartType] = useState<"bar" | "line">("bar")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHistograms()
  }, [imageId, type])

  useEffect(() => {
    if (originalHistogram || processedHistogram) {
      generateChartData()
    }
  }, [originalHistogram, processedHistogram, mode])

  const loadHistograms = async () => {
    try {
      setLoading(true)
      const promises = []

      if (type === "original" || type === "both") {
        promises.push(apiService.getHistogram(imageId, "original").then((data) => ({ type: "original", data })))
      }

      if (type === "processed" || type === "both") {
        promises.push(
          apiService
            .getHistogram(imageId, "processed")
            .then((data) => ({ type: "processed", data }))
            .catch((error) => {
              console.error("[v0] Error fetching processed histogram:", error)
              return { type: "processed", data: { red: [], green: [], blue: [], grayscale: [] } }
            }),
        )
      }

      const results = await Promise.all(promises)

      results.forEach(({ type: histType, data }) => {
        if (histType === "original") setOriginalHistogram(data)
        if (histType === "processed") setProcessedHistogram(data)
      })
    } catch (error) {
      console.error("Failed to load histograms:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = () => {
    const originalData = []
    const processedData = []

    const getMaxLength = (hist: HistogramData | null) => {
      if (!hist) return 0
      return Math.max(
        hist.red?.length || 0,
        hist.green?.length || 0,
        hist.blue?.length || 0,
        hist.grayscale?.length || 0,
      )
    }

    const maxLength = Math.max(getMaxLength(originalHistogram), getMaxLength(processedHistogram))

    if (mode === "rgb") {
      for (let i = 0; i < maxLength; i += 4) {
        originalData.push({
          bin: i,
          red: originalHistogram?.red?.[i] || 0,
          green: originalHistogram?.green?.[i] || 0,
          blue: originalHistogram?.blue?.[i] || 0,
        })
        processedData.push({
          bin: i,
          red: processedHistogram?.red?.[i] || 0,
          green: processedHistogram?.green?.[i] || 0,
          blue: processedHistogram?.blue?.[i] || 0,
        })
      }
    } else {
      for (let i = 0; i < maxLength; i += 4) {
        originalData.push({
          bin: i,
          grayscale: originalHistogram?.grayscale?.[i] || 0,
        })
        processedData.push({
          bin: i,
          grayscale: processedHistogram?.grayscale?.[i] || 0,
        })
      }
    }

    setChartData({ original: originalData, processed: processedData })
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <p className="text-secondary text-sm">Loading histogram...</p>
        </div>
      </div>
    )
  }

  if (!originalHistogram && !processedHistogram) {
    return (
      <div className="p-6">
        <p className="text-secondary text-center">Failed to load histogram</p>
      </div>
    )
  }

  if (type === "original") {
    return (
      <div>
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setMode("rgb")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              mode === "rgb"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            RGB
          </button>
          <button
            onClick={() => setMode("grayscale")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              mode === "grayscale"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Grayscale
          </button>
          <button
            onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
            className="px-3 py-1 rounded text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {chartType === "bar" ? "Line" : "Bar"}
          </button>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          {chartType === "bar" ? (
            <BarChart data={chartData.original}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="bin" stroke="var(--color-secondary)" />
              <YAxis stroke="var(--color-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: `1px solid var(--color-border)`,
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              {mode === "rgb" ? (
                <>
                  <Bar dataKey="red" fill="#ef4444" isAnimationActive={false} />
                  <Bar dataKey="green" fill="#10b981" isAnimationActive={false} />
                  <Bar dataKey="blue" fill="#3b82f6" isAnimationActive={false} />
                </>
              ) : (
                <Bar dataKey="grayscale" fill="#6b7280" isAnimationActive={false} />
              )}
            </BarChart>
          ) : (
            <LineChart data={chartData.original}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="bin" stroke="var(--color-secondary)" />
              <YAxis stroke="var(--color-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: `1px solid var(--color-border)`,
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              {mode === "rgb" ? (
                <>
                  <Line type="monotone" dataKey="red" stroke="#ef4444" isAnimationActive={false} dot={false} />
                  <Line type="monotone" dataKey="green" stroke="#10b981" isAnimationActive={false} dot={false} />
                  <Line type="monotone" dataKey="blue" stroke="#3b82f6" isAnimationActive={false} dot={false} />
                </>
              ) : (
                <Line type="monotone" dataKey="grayscale" stroke="#6b7280" isAnimationActive={false} dot={false} />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "processed") {
    return (
      <div>
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setMode("rgb")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              mode === "rgb"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            RGB
          </button>
          <button
            onClick={() => setMode("grayscale")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              mode === "grayscale"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Grayscale
          </button>
          <button
            onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
            className="px-3 py-1 rounded text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {chartType === "bar" ? "Line" : "Bar"}
          </button>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          {chartType === "bar" ? (
            <BarChart data={chartData.processed}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="bin" stroke="var(--color-secondary)" />
              <YAxis stroke="var(--color-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: `1px solid var(--color-border)`,
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              {mode === "rgb" ? (
                <>
                  <Bar dataKey="red" fill="#ef4444" isAnimationActive={false} />
                  <Bar dataKey="green" fill="#10b981" isAnimationActive={false} />
                  <Bar dataKey="blue" fill="#3b82f6" isAnimationActive={false} />
                </>
              ) : (
                <Bar dataKey="grayscale" fill="#6b7280" isAnimationActive={false} />
              )}
            </BarChart>
          ) : (
            <LineChart data={chartData.processed}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="bin" stroke="var(--color-secondary)" />
              <YAxis stroke="var(--color-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: `1px solid var(--color-border)`,
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              {mode === "rgb" ? (
                <>
                  <Line type="monotone" dataKey="red" stroke="#ef4444" isAnimationActive={false} dot={false} />
                  <Line type="monotone" dataKey="green" stroke="#10b981" isAnimationActive={false} dot={false} />
                  <Line type="monotone" dataKey="blue" stroke="#3b82f6" isAnimationActive={false} dot={false} />
                </>
              ) : (
                <Line type="monotone" dataKey="grayscale" stroke="#6b7280" isAnimationActive={false} dot={false} />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-foreground">Histogram Comparison</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setMode("rgb")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              mode === "rgb"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            RGB
          </button>
          <button
            onClick={() => setMode("grayscale")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              mode === "grayscale"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Grayscale
          </button>
          <button
            onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
            className="px-3 py-1 rounded text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {chartType === "bar" ? "Line Chart" : "Bar Chart"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Original Image</h3>
          <ResponsiveContainer width="100%" height={250}>
            {chartType === "bar" ? (
              <BarChart data={chartData.original}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="bin" stroke="var(--color-secondary)" />
                <YAxis stroke="var(--color-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: `1px solid var(--color-border)`,
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                {mode === "rgb" ? (
                  <>
                    <Bar dataKey="red" fill="#ef4444" isAnimationActive={false} />
                    <Bar dataKey="green" fill="#10b981" isAnimationActive={false} />
                    <Bar dataKey="blue" fill="#3b82f6" isAnimationActive={false} />
                  </>
                ) : (
                  <Bar dataKey="grayscale" fill="#6b7280" isAnimationActive={false} />
                )}
              </BarChart>
            ) : (
              <LineChart data={chartData.original}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="bin" stroke="var(--color-secondary)" />
                <YAxis stroke="var(--color-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: `1px solid var(--color-border)`,
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                {mode === "rgb" ? (
                  <>
                    <Line type="monotone" dataKey="red" stroke="#ef4444" isAnimationActive={false} dot={false} />
                    <Line type="monotone" dataKey="green" stroke="#10b981" isAnimationActive={false} dot={false} />
                    <Line type="monotone" dataKey="blue" stroke="#3b82f6" isAnimationActive={false} dot={false} />
                  </>
                ) : (
                  <Line type="monotone" dataKey="grayscale" stroke="#6b7280" isAnimationActive={false} dot={false} />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Processed Image</h3>
          <ResponsiveContainer width="100%" height={250}>
            {chartType === "bar" ? (
              <BarChart data={chartData.processed}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="bin" stroke="var(--color-secondary)" />
                <YAxis stroke="var(--color-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: `1px solid var(--color-border)`,
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                {mode === "rgb" ? (
                  <>
                    <Bar dataKey="red" fill="#ef4444" isAnimationActive={false} />
                    <Bar dataKey="green" fill="#10b981" isAnimationActive={false} />
                    <Bar dataKey="blue" fill="#3b82f6" isAnimationActive={false} />
                  </>
                ) : (
                  <Bar dataKey="grayscale" fill="#6b7280" isAnimationActive={false} />
                )}
              </BarChart>
            ) : (
              <LineChart data={chartData.processed}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="bin" stroke="var(--color-secondary)" />
                <YAxis stroke="var(--color-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: `1px solid var(--color-border)`,
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                {mode === "rgb" ? (
                  <>
                    <Line type="monotone" dataKey="red" stroke="#ef4444" isAnimationActive={false} dot={false} />
                    <Line type="monotone" dataKey="green" stroke="#10b981" isAnimationActive={false} dot={false} />
                    <Line type="monotone" dataKey="blue" stroke="#3b82f6" isAnimationActive={false} dot={false} />
                  </>
                ) : (
                  <Line type="monotone" dataKey="grayscale" stroke="#6b7280" isAnimationActive={false} dot={false} />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
