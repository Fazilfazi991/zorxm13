import { Section, Selection } from '../types/schema'

interface Props {
  sections: Section[]
  selection: Selection | null
  onSelectSection: (id: string) => void
  onSelectElement: (sectionId: string, columnId: string, elementId: string) => void
  onReorder: (sections: Section[]) => void
  onOpenAI: () => void
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
  sections, selection, onSelectSection, onSelectElement, onOpenAI, expandedSections, onToggleExpand
}: Props) {
  return (
    <div className="w-52 bg-[#141414] 
      border-r border-white/10 
      flex flex-col flex-shrink-0 
      overflow-y-auto">
      
      <div className="px-3 py-2 border-b 
        border-white/10 flex items-center justify-between">
        <span className="text-xs font-medium 
          text-white/40 uppercase tracking-wider">
          Layers
        </span>
      </div>

      <div className="flex-1 py-1">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center 
            justify-center h-full gap-3 p-4">
            <div className="text-3xl opacity-20">⬛</div>
            <p className="text-xs text-white/30 
              text-center">
              No sections yet
            </p>
            <button
              onClick={onOpenAI}
              className="text-xs px-3 py-1.5 
                rounded-lg bg-green-900/40 
                text-green-400 border border-green-800/60
                hover:bg-green-900/70">
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
                  className={`w-full flex items-center 
                    gap-2 px-2 py-2 text-left 
                    text-xs transition-colors cursor-pointer group
                    ${isSectionSelected
                      ? 'bg-green-900/40 text-green-400'
                      : 'text-white/60 hover:bg-white/5'
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
                      className="w-2.5 h-2.5 rounded-full border border-white/20"
                      style={{ background: bgType === 'image' ? `url(${section.settings.background}) center/cover` : bgColor }}
                    />
                    <span className="text-base leading-none opacity-50">
                      {sectionIcons[section.type] ?? sectionIcons.default}
                    </span>
                    <span className="flex-1 truncate capitalize">
                      {section.type}
                    </span>
                    <span className="text-white/20 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                      {i + 1}
                    </span>
                  </div>
                </div>

                {isExpanded && section.columns.map(col => (
                  col.elements.map(el => {
                    const isElSelected = selection?.type === 'element' && selection.elementId === el.id
                    const elText = el.settings.text 
                      ? el.settings.text.substring(0, 30) + (el.settings.text.length > 30 ? '...' : '')
                      : el.type
                    
                    return (
                      <button
                        key={el.id}
                        onClick={() => onSelectElement(section.id, col.id, el.id)}
                        className={`w-full flex items-center 
                          gap-2 pl-8 pr-3 py-1.5 text-left 
                          text-[11px] transition-colors
                          ${isElSelected
                            ? 'bg-green-900/40 text-green-300'
                            : 'text-white/40 hover:bg-white/5 hover:text-white/60'
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
