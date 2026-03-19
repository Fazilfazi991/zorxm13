import { useState, useEffect } from 'react'
import TopBar from './components/TopBar'
import LeftPanel from './components/LeftPanel'
import Canvas from './components/Canvas'
import RightPanel from './components/RightPanel'
import AIPrompt from './components/AIPrompt'
import { PageData, Section, Selection, Element } from './types/schema'
import { savePage, publishPage, generatePage } from './lib/api'

export default function App() {
  const config = window.WPCRAFT_CONFIG
  
  // Load existing data if available
  const initialData = config.pageData?.sections?.length > 0
    ? config.pageData
    : null

  const [pageData, setPageData] = 
    useState<PageData | null>(initialData)
  
  const [selection, setSelection] = 
    useState<Selection | null>(null)
  
  const [expandedSections, setExpandedSections] = 
    useState<string[]>([])

  const [saving, setSaving] = useState(false)
  
  // Only show AI prompt if NO existing content
  const [showAI, setShowAI] = useState(
    !initialData && !config.hasExistingContent
  )
  
  const [undoStack, setUndoStack] = useState<PageData[]>([])
  const [hasPreview, setHasPreview] = useState(false)
  const [previewSnapshot, setPreviewSnapshot] = useState<PageData | null>(null)

  const pushUndoSnapshot = () => {
    if (pageData) {
      setUndoStack(prev => {
        const next = [...prev, pageData]
        if (next.length > 20) return next.slice(next.length - 20)
        return next
      })
    }
  }

  const handlePreviewChange = (previewActive: boolean, pendingData?: any) => {
    setHasPreview(previewActive)
    if (previewActive && pendingData) {
      setPreviewSnapshot(pageData)
      if (selection?.type === 'element' && selection.sectionId && selection.columnId && selection.elementId) {
        updateElement(selection.sectionId, selection.columnId, selection.elementId, pendingData)
      } else if (selection?.type === 'section' && selection.sectionId) {
        updateSection(selection.sectionId, pendingData)
      }
    }
  }

  const handleApplyAI = () => {
    if (previewSnapshot) {
      setUndoStack(prev => {
        const next = [...prev, previewSnapshot]
        if (next.length > 20) return next.slice(next.length - 20)
        return next
      })
      setPreviewSnapshot(null)
    } else {
      pushUndoSnapshot()
    }
  }

  const handleDiscardAI = () => {
    if (previewSnapshot) {
      setPageData(previewSnapshot)
      setPreviewSnapshot(null)
    }
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    setUndoStack(s => s.slice(0, -1))
    setPageData(prev)
    
    const el = document.createElement('div')
    el.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-lg text-sm backdrop-blur border border-white/20 z-50 shadow-lg transition-opacity duration-300'
    el.innerText = 'Undid last AI change'
    document.body.appendChild(el)
    setTimeout(() => {
      el.style.opacity = '0'
      setTimeout(() => el.remove(), 300)
    }, 2000)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        // Prevent default browser undo
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undoStack, pageData])

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

  // Helper to get selected section
  const getSelectedSection = () => {
    if (!selection || !pageData) return null
    return pageData.sections.find(
      s => s.id === selection.sectionId
    ) ?? null
  }

  // Helper to get selected element
  const getSelectedElement = () => {
    if (!selection || 
        selection.type !== 'element' || 
        !pageData) return null
    
    const section = pageData.sections.find(
      s => s.id === selection.sectionId
    )
    if (!section) return null
    
    const column = section.columns.find(
      c => c.id === selection.columnId
    )
    if (!column) return null
    
    return column.elements.find(
      e => e.id === selection.elementId
    ) ?? null
  }

  // Helper to update a specific element
  const updateElement = (
    sectionId: string,
    columnId: string, 
    elementId: string,
    updates: Partial<Element>
  ) => {
    if (!pageData) return
    setPageData({
      ...pageData,
      sections: pageData.sections.map(s => 
        s.id !== sectionId ? s : {
          ...s,
          columns: s.columns.map(c =>
            c.id !== columnId ? c : {
              ...c,
              elements: c.elements.map(e =>
                e.id !== elementId ? e : {
                  ...e,
                  ...updates,
                  settings: {
                    ...e.settings,
                    ...(updates.settings || {})
                  }
                }
              )
            }
          )
        }
      )
    })
  }

  const handleRefine = async (prompt: string) => {
    if (!selection || !pageData) return null
    
    const isSection = selection.type === 'section'
    const contextObj = isSection 
      ? getSelectedSection() 
      : getSelectedElement()
      
    if (!contextObj) return null
    
    const result = await generatePage(
      config.postId,
      prompt,
      config.nonce,
      config.apiBase,
      'refine',
      JSON.stringify(contextObj)
    )
    
    if (result.success && result.data) {
      return result.data
    }
    
    console.error('WP Refine Failed Payload:', result);
    throw new Error('AI returned an unexpected result. Please try a different prompt.')
  }

  return (
    <div className="flex flex-col h-screen 
      bg-[#111] text-white overflow-hidden">
      
      {/* TOP BAR - minimal */}
      <TopBar
        title={config.postTitle}
        saving={saving}
        hasData={!!pageData}
        canUndo={undoStack.length > 0}
        onUndo={handleUndo}
        onSave={handleSave}
        onPublish={handlePublish}
        onToggleAI={() => setShowAI(!showAI)}
        onExit={() => {
          if (confirm('Exit to WordPress? Any unsaved changes will be lost.')) {
            window.location.href = config.adminUrl + 'admin.php?page=wpcraft-editor'
          }
        }}
      />

      {/* MAIN AREA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT - section/element tree */}
        <LeftPanel
          sections={pageData?.sections ?? []}
          selection={selection}
          onSelectSection={(sectionId) => setSelection({
            type: 'section',
            sectionId
          })}
          onSelectElement={(sectionId, columnId, elementId) => setSelection({
            type: 'element',
            sectionId,
            columnId,
            elementId
          })}
          expandedSections={expandedSections}
          onToggleExpand={(id) => setExpandedSections(prev => 
            prev.includes(id) 
              ? prev.filter(x => x !== id)
              : [...prev, id]
          )}
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
          selection={selection}
          hasPreview={hasPreview}
          onSelectSection={(sectionId) => setSelection({
            type: 'section',
            sectionId
          })}
          onSelectElement={(
            sectionId, columnId, elementId
          ) => setSelection({
            type: 'element',
            sectionId,
            columnId,
            elementId
          })}
          siteUrl={config.siteUrl}
        />

        {/* RIGHT - context settings */}
        <RightPanel
          selection={selection}
          selectedSection={
            selection?.type === 'section'
              ? pageData?.sections.find(
                  s => s.id === selection.sectionId
                ) ?? null
              : null
          }
          selectedElement={getSelectedElement()}
          onUpdateSection={(updates) => {
            if (selection?.sectionId) {
              updateSection(selection.sectionId, updates)
            }
          }}
          onUpdateElement={(updates) => {
            if (selection?.type === 'element' &&
                selection.sectionId &&
                selection.columnId &&
                selection.elementId) {
              updateElement(
                selection.sectionId,
                selection.columnId,
                selection.elementId,
                updates
              )
            }
          }}
          onRefine={handleRefine}
          onPreviewChange={handlePreviewChange}
          onApplyAI={handleApplyAI}
          onDiscardAI={handleDiscardAI}
        />

      </div>

      {/* AI PROMPT - bottom overlay */}
      {showAI && (
        <AIPrompt
          postId={config.postId}
          nonce={config.nonce}
          apiBase={config.apiBase}
          hasExistingContent={!!pageData?.sections?.length}
          onGenerate={(data, mode) => {
            if (mode === 'replace' || !pageData) {
              // Replace entire page
              setPageData(data)
            } else {
              // Append new sections to existing
              setPageData(prev => prev ? {
                ...prev,
                sections: [
                  ...prev.sections,
                  ...data.sections
                ]
              } : data)
            }
            setShowAI(false)
          }}
          onClose={() => {
            if (pageData?.sections?.length) {
              setShowAI(false)
            }
          }}
        />
      )}

    </div>
  )
}
