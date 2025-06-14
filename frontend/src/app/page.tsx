"use client"

import { useState } from "react"
import { Brain, Zap, Search } from "lucide-react"

export default function MinimalConceptVisualizer() {
  const [concept, setConcept] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasVisualization, setHasVisualization] = useState(false)
  const [iframeContent, setIframeContent] = useState("")

  const extractHtmlOnly = (raw: string): string => {
    // Remove markdown code blocks if present
    const cleaned = raw.replace(/```html\n?/gi, "").replace(/```\n?/g, "").trim()
    
    // Try to find complete HTML document
    let match = cleaned.match(/<!DOCTYPE html>[\s\S]*<\/html>/i)
    if (match) return match[0]
    
    // Fallback: look for html tags
    match = cleaned.match(/<html[\s\S]*<\/html>/i)
    if (match) return match[0]
    
    // If no proper HTML found, check if it's already HTML content
    if (cleaned.includes('<') && cleaned.includes('>')) {
      // Wrap in basic HTML structure
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Concept Visualization</title>
</head>
<body>
    ${cleaned}
</body>
</html>`
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
</head>
<body>
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h2>⚠️ Could not extract HTML content</h2>
        <p>The AI response could not be parsed as HTML.</p>
        <details>
            <summary>Raw Response</summary>
            <pre style="text-align: left; background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px;">${raw}</pre>
        </details>
    </div>
</body>
</html>`
  }

  const handleGenerate = async () => {
    if (!concept) return

    setIsGenerating(true)
    setHasVisualization(true)
    setIframeContent("")

    try {
      const res = await fetch("https://concept-visualizer-z8xl.onrender.com:8000/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept }),
      })

      if (!res.ok) throw new Error("Failed to generate visualization structure")
      const data = await res.json()

      const structuredJson = JSON.stringify(data.visualization, null, 2)

      const geminiRes = await fetch("", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert educational content creator and frontend developer. Create a comprehensive, interactive HTML visualization that teaches the given concept effectively.

CRITICAL REQUIREMENTS:
1. Create a COMPLETE, standalone HTML document with embedded CSS and JavaScript
2. The visualization must be genuinely educational and detailed - not just decorative
3. Use rich SVG graphics with proper diagrams, flowcharts, or process illustrations
4. Include multiple interactive elements: clickable areas, hover effects, animations
5. Add informational tooltips, pop-ups, or detail panels that appear on interaction
6. Use a professional color scheme with good contrast (blues, greens, oranges for educational content)
7. Include step-by-step processes, labeled components, and clear visual hierarchy
8. Add smooth CSS transitions and micro-animations to enhance engagement
9. Make it responsive and visually appealing on different screen sizes
10. Include a proper title, description, and interactive instructions

EDUCATIONAL FOCUS:
- Break down complex concepts into visual components
- Show processes, relationships, and cause-and-effect
- Use analogies and visual metaphors where helpful
- Include key terms, definitions, and explanations
- Make abstract concepts concrete through visualization

OUTPUT FORMAT:
Provide ONLY the complete HTML code starting with <!DOCTYPE html> and ending with </html>. Do not include any markdown formatting, explanations, or code blocks.

CREATE AN INTERACTIVE EDUCATIONAL VISUALIZATION FOR: ${concept}

Based on this structured plan: ${structuredJson}

Make it comprehensive, engaging, and truly educational. Include multiple interactive elements and detailed explanations.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
          }
        })
      });

      const aiData = await geminiRes.json()
      
      if (!aiData.candidates || aiData.candidates.length === 0) {
        throw new Error("No response from Gemini API")
      }
      
      const rawHtml = aiData.candidates[0]?.content?.parts?.[0]?.text || ""
      console.log("Raw Gemini Response:", rawHtml.substring(0, 500) + "...")
      
      if (!rawHtml) {
        throw new Error("Empty response from Gemini API")
      }
      
      const cleanedHtml = extractHtmlOnly(rawHtml)
      console.log("Cleaned HTML length:", cleanedHtml.length)
      
      setIframeContent(cleanedHtml)
    } catch (err) {
      console.error("Error:", err)
      setIframeContent(`<!DOCTYPE html>
<html>
<head>
    <title>Error</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
        .error { color: #dc3545; margin: 20px 0; }
        .retry { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h2 class="error">⚠️ Error generating visualization</h2>
    <p>Error: ${err instanceof Error ? err.message : "An unknown error occurred"}</p>
    <p>Please try again with a different concept or check the console for details.</p>
    <button class="retry" onclick="window.parent.location.reload()">Try Again</button>
</body>
</html>`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setConcept("")
    setHasVisualization(false)
    setIframeContent("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b border-white/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button onClick={handleReset} className="flex items-center space-x-2 hover:opacity-70 transition-opacity">
            <Brain className="w-6 h-6 text-slate-800" />
            <span className="text-lg font-medium text-slate-800">Concept Visualizer</span>
          </button>
        </div>
      </header>

      {!hasVisualization ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-2xl mx-auto px-6 space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-light text-slate-900">What would you like to understand?</h1>
              <p className="text-xl text-slate-600">Enter any concept and get an interactive visualization</p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g., binary search, photosynthesis, supply and demand..."
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  className="w-full pl-12 pr-4 py-5 text-lg border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-slate-900 placeholder-slate-400 bg-white shadow-sm"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!concept}
                className="w-full flex items-center justify-center space-x-3 py-5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Zap className="w-5 h-5" />
                <span>Generate Visualization</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {/* Search Bar - Fixed at top when visualization is showing */}
          <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative max-w-2xl">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                    placeholder="Enter a new concept to visualize..."
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!concept || isGenerating}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
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
            </div>
          </div>

          {/* Visualization Container - Full width and height */}
          <div className="w-full h-[calc(100vh-140px)]">
            {isGenerating ? (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl text-slate-700">Creating interactive visualization</p>
                    <p className="text-lg text-slate-500">for <strong className="text-blue-600">{concept}</strong></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-white border-t border-slate-200">
                <iframe
                  srcDoc={iframeContent}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin"
                  title="Concept Visualization"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
