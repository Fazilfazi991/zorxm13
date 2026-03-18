import { useState, useEffect } from 'react'
import TopBar from './components/TopBar'
import LeftPanel from './components/LeftPanel'
import Canvas from './components/Canvas'
import RightPanel from './components/RightPanel'
import AIPrompt from './components/AIPrompt'
import { PageData, Section } from './types/schema'
import { savePage, publishPage } from './lib/api'

export default function App() {
  const config = window.WPCRAFT_CONFIG
  
  // Load existing data if available
  const initialData = config.pageData?.sections?.length > 0
    ? config.pageData
    : null

  const [pageData, setPageData] = 
    useState<PageData | null>(initialData)
  
  const [selectedId, setSelectedId] = 
    useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Only show AI prompt if NO existing content
  const [showAI, setShowAI] = useState(
    !initialData
  )

  const handleSave = async () => {
    if (!pageData) return
    setSaving(true)
    try {
      await savePage(
        config.postId, 
        pageData,
        config.nonce,
        config.apiBase
      )
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!pageData) return
    setSaving(true)
    try {
      await handleSave()
      const result = await publishPage(
        config.postId,
        config.nonce,
        config.apiBase
      )
      if (result.url) {
        window.open(result.url, '_blank')
      }
    } finally {
      setSaving(false)
    }
  }

  const selectedSection = pageData?.sections
    .find(s => s.id === selectedId) ?? null

  const updateSection = (
    id: string, 
    updates: Partial<Section>
  ) => {
    if (!pageData) return
    setPageData({
      ...pageData,
      sections: pageData.sections.map(s =>
        s.id === id ? { ...s, ...updates } : s
      )
    })
  }

  return (
    <div className="flex flex-col h-screen 
      bg-[#111] text-white overflow-hidden">
      
      {/* TOP BAR - minimal */}
      <TopBar
        title={config.postTitle}
        saving={saving}
        hasData={!!pageData}
        onSave={handleSave}
        onPublish={handlePublish}
        onToggleAI={() => setShowAI(!showAI)}
      />

      {/* MAIN AREA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT - just section list */}
        <LeftPanel
          sections={pageData?.sections ?? []}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onReorder={(sections) => 
            setPageData(prev => 
              prev ? {...prev, sections} : prev
            )
          }
          onOpenAI={() => setShowAI(true)}
        />

        {/* CENTER - full canvas */}
        <Canvas
          pageData={pageData}
          selectedId={selectedId}
          onSelect={setSelectedId}
          siteUrl={config.siteUrl}
        />

        {/* RIGHT - context settings */}
        <RightPanel
          section={selectedSection}
          onUpdate={(updates) => {
            if (selectedId) {
              updateSection(selectedId, updates)
            }
          }}
        />

      </div>

      {/* AI PROMPT - bottom overlay */}
      {showAI && (
        <AIPrompt
          postId={config.postId}
          nonce={config.nonce}
          apiBase={config.apiBase}
          onGenerate={(data) => {
            setPageData(data)
            setShowAI(false)
          }}
          onClose={() => {
            if (pageData) setShowAI(false)
          }}
        />
      )}

    </div>
  )
}
