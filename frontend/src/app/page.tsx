"use client"

import { useState } from "react"
import { Brain, Zap, Search } from "lucide-react"

export default function MinimalConceptVisualizer() {
  const [concept, setConcept] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasVisualization, setHasVisualization] = useState(false)
  const [visualizationText, setVisualizationText] = useState("")

  const handleGenerate = async () => {
    if (!concept) return
  
    setIsGenerating(true)
    setHasVisualization(true)
    setVisualizationText("")
  
    try {
      const res = await fetch("http://localhost:8000/visualize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ concept }),
      })
  
      if (!res.ok) throw new Error("Failed to generate visualization")
  
      const data = await res.json()
      setVisualizationText(data.visualization)
    } catch (err) {
      console.error("Error:", err)
      setVisualizationText("⚠️ Failed to generate visualization. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }
  

  const handleReset = () => {
    setConcept("")
    setHasVisualization(false)
    setIsGenerating(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button onClick={handleReset} className="flex items-center space-x-2 hover:opacity-70 transition-opacity">
            <Brain className="w-6 h-6 text-gray-800" />
            <span className="text-lg font-medium text-gray-800">Concept Visualizer</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6">
        {!hasVisualization ? (
          // Initial Simple State
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-lg space-y-6">
              <div className="text-center space-y-3">
                <h1 className="text-2xl font-light text-gray-900">What would you like to understand?</h1>
                <p className="text-gray-500">Enter any concept and get an interactive visualization</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g., binary search, photosynthesis, supply and demand..."
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!concept}
                  className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Zap className="w-5 h-5" />
                  <span>Visualize</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Expanded State with Visualization
          <div className="py-8 space-y-6">
            {/* Compact Input */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={!concept || isGenerating}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Regenerate</span>
                  </>
                )}
              </button>
            </div>

            {/* Visualization Area */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                {isGenerating ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 border-3 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-gray-700 font-medium">Creating visualization...</p>
                        <p className="text-sm text-gray-500">Analyzing &quot;{concept}&quot;</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center space-y-3">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-gray-700 font-medium">Visualization: {concept}</p>
                        <p className="text-sm text-gray-500">{visualizationText || "Interactive content will appear here"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
