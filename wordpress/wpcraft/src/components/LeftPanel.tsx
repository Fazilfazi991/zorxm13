import { useState } from 'react'
import { Section, Selection } from '../types/schema'

interface Props {
  sections: Section[]
  selection: Selection | null
  onSelectSection: (id: string) => void
  onSelectElement: (sectionId: string, columnId: string, elementId: string) => void
  onReorder: (sections: Section[]) => void
  onOpenAI: () => void
  onAddBlankSection?: () => void
  onDeleteSection?: (id: string) => void
  expandedSections: string[]
  onToggleExpand: (sectionId: string) => void
}

const sectionIcons: Record<string, string> = {
  hero: '⬛',
  features: '⊞',
  about: '◧',
  cta: '▶',
  footer: '▬',
  default: '▭'
}

const elementIcons: Record<string, string> = {
  heading: 'T',
  text: '≣',
  button: '▭',
  image: '▨',
  spacer: '⬚',
  default: '◈'
}

export default function LeftPanel({
  sections, selection, onSelectSection, onSelectElement, onReorder, onOpenAI, onAddBlankSection, onDeleteSection, expandedSections, onToggleExpand
}: Props) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIdx !== null && draggedIdx !== index) {
      setDragOverIdx(index)
    }
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIdx === null) return
    const newSections = [...sections]
    const draggedItem = newSections[draggedIdx]
    newSections.splice(draggedIdx, 1)
    newSections.splice(index, 0, draggedItem)
    onReorder(newSections)
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  return (
    <div className="w-52 bg-white 
      border-r border-[#E2E8F0] 
      flex flex-col flex-shrink-0 
      overflow-y-auto">
      
      <div className="px-3 py-2 border-b 
        border-[#E2E8F0] flex items-center justify-between">
        <span className="text-xs font-medium 
          text-[#94A3B8] uppercase tracking-wider">
          Layers
        </span>
        <div className="relative">
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-6 h-6 rounded hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">
            +
          </button>
          {showAddMenu && (
            <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-[#E2E8F0] shadow-lg rounded py-1 z-50 text-xs text-left">
              <button 
                onClick={() => { onAddBlankSection?.(); setShowAddMenu(false) }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#F8F9FA] text-[#1A1A1A]">
                Blank Section
              </button>
              <button 
                onClick={() => { onOpenAI(); setShowAddMenu(false) }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#F0FDF4] text-[#166534]">
                ✦ Generate with AI
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 py-1">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center 
            justify-center h-full gap-3 p-4">
            <div className="text-3xl opacity-20 text-[#64748B]">⬛</div>
            <p className="text-xs text-[#94A3B8] 
              text-center">
              No sections yet
            </p>
            <button
              onClick={onOpenAI}
              className="text-xs px-3 py-1.5 
                rounded-lg bg-[#F0FDF4] 
                text-[#166534] border border-[#BBF7D0]
                hover:bg-[#DCFCE7]">
              ✦ Generate page
            </button>
          </div>
        ) : (
          sections.map((section, i) => {
            const bgType = section.settings.backgroundType || 'color';
            const bgColor = bgType === 'image' && section.settings.backgroundOverlay 
              ? section.settings.backgroundOverlay 
              : section.settings.background || '#ffffff';
            
            const isSectionSelected = selection?.type === 'section' && selection.sectionId === section.id
            const isExpanded = expandedSections.includes(section.id)

            return (
              <div key={section.id}>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragLeave={() => setDragOverIdx(null)}
                  onDrop={(e) => handleDrop(e, i)}
                  className={`w-full flex items-center 
                    gap-2 px-2 py-2 text-left 
                    text-xs transition-colors cursor-pointer group
                    ${dragOverIdx === i ? 'border-t-[2px] border-[#166534]' : ''}
                    ${isSectionSelected
                      ? 'bg-[#F0FDF4] text-[#166534]'
                      : 'text-[#64748B] hover:bg-[#F8F9FA]'
                    }`}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleExpand(section.id)
                    }}
                    className="w-4 flex items-center justify-center opacity-50 hover:opacity-100"
                  >
                    {isExpanded ? '▾' : '▸'}
                  </button>
                  <div 
                    onClick={() => onSelectSection(section.id)}
                    className="flex flex-1 items-center gap-2"
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full border border-[#CBD5E1]"
                      style={{ background: bgType === 'image' ? `url(${section.settings.background}) center/cover` : bgColor }}
                    />
                    <span className="text-base leading-none opacity-50">
                      {sectionIcons[section.type] ?? sectionIcons.default}
                    </span>
                    <span className="flex-1 truncate capitalize">
                      {section.type}
                    </span>
                    <span className="text-[#94A3B8] text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                      {i + 1}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteSection?.(section.id) }}
                      className="opacity-0 group-hover:opacity-100 text-[#94A3B8] hover:text-[#DC2626] ml-1 pt-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </div>

                {isExpanded && section.columns.map(col => (
                  col.elements.map(el => {
                    const isElSelected = selection?.type === 'element' && selection.elementId === el.id
                    let textStr = ''
                    if (el.type === 'heading' || el.type === 'text' || el.type === 'button') {
                      textStr = el.settings.text || ''
                    }
                    const elText = textStr
                      ? textStr.substring(0, 30) + (textStr.length > 30 ? '...' : '')
                      : el.type
                    
                    return (
                      <button
                        key={el.id}
                        onClick={() => onSelectElement(section.id, col.id, el.id)}
                        className={`w-full flex items-center 
                          gap-2 pl-8 pr-3 py-1.5 text-left 
                          text-[11px] transition-colors
                          ${isElSelected
                            ? 'bg-[#F0FDF4] text-[#166534]'
                            : 'text-[#94A3B8] hover:bg-[#F8F9FA] hover:text-[#64748B]'
                          }`}
                      >
                        <span className="text-xs opacity-40">
                          {elementIcons[el.type] ?? elementIcons.default}
                        </span>
                        <span className="flex-1 truncate capitalize">
                          {elText}
                        </span>
                      </button>
                    )
                  })
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
