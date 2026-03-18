import { Section } from '../types/schema'

interface Props {
  sections: Section[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (sections: Section[]) => void
  onOpenAI: () => void
}

const sectionIcons: Record<string, string> = {
  hero: '⬛',
  features: '⊞',
  about: '◧',
  cta: '▶',
  footer: '▬',
  default: '▭'
}

export default function LeftPanel({
  sections, selectedId, onSelect, onOpenAI
}: Props) {
  return (
    <div className="w-52 bg-[#141414] 
      border-r border-white/10 
      flex flex-col flex-shrink-0 
      overflow-y-auto">
      
      <div className="px-3 py-2 border-b 
        border-white/10">
        <span className="text-xs font-medium 
          text-white/40 uppercase tracking-wider">
          Sections
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
            
            return (
              <button
                key={section.id}
                onClick={() => onSelect(section.id)}
                className={`w-full flex items-center 
                  gap-3 px-3 py-2.5 text-left 
                  text-xs transition-colors
                  ${selectedId === section.id
                    ? 'bg-green-900/40 text-green-400'
                    : 'text-white/60 hover:bg-white/5'
                  }`}
              >
                <div 
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ background: bgType === 'image' ? 'url(' + section.settings.background + ') center/cover' : bgColor }}
                />
                <span className="text-base leading-none opacity-50">
                  {sectionIcons[section.type] ?? 
                    sectionIcons.default}
                </span>
                <span className="flex-1 truncate 
                  capitalize">
                  {section.type}
                </span>
                <span className="text-white/20 
                  text-xs">
                  {i + 1}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
