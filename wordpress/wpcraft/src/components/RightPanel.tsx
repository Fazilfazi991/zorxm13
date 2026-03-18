import { Section, Element, Selection } from '../types/schema'
import ElementSettings from './ElementSettings'
import SectionSettings from './SectionSettings'

interface Props {
  selection: Selection | null
  selectedSection: Section | null
  selectedElement: Element | null
  onUpdateSection: (
    updates: Partial<Section>
  ) => void
  onUpdateElement: (
    updates: Partial<Element>
  ) => void
}

export default function RightPanel({
  selection,
  selectedSection,
  selectedElement,
  onUpdateSection,
  onUpdateElement
}: Props) {

  // Nothing selected
  if (!selection) {
    return (
      <div className="w-64 bg-[#141414] 
        border-l border-white/10 
        flex items-center justify-center 
        flex-shrink-0">
        <p className="text-xs text-white/30 
          text-center px-6 leading-relaxed">
          Click any section or element
          to edit its settings
        </p>
      </div>
    )
  }

  return (
    <div className="w-64 bg-[#141414] 
      border-l border-white/10 
      flex flex-col flex-shrink-0">
      
      {/* Header */}
      <div className="px-3 py-2.5 
        border-b border-white/10 flex-shrink-0">
        <div className="flex items-center 
          gap-2">
          <span className="text-xs 
            text-white/30">
            {selection.type === 'element' 
              ? '◈ Element' 
              : '▭ Section'}
          </span>
          <span className="text-xs 
            font-medium text-white/70 
            capitalize">
            {selection.type === 'element'
              ? selectedElement?.type || ''
              : selectedSection?.type || ''}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selection.type === 'element' && 
         selectedElement ? (
          <ElementSettings
            element={selectedElement}
            onUpdate={onUpdateElement}
          />
        ) : selectedSection ? (
          <SectionSettings
            section={selectedSection}
            onUpdate={onUpdateSection}
          />
        ) : null}
      </div>
    </div>
  )
}
