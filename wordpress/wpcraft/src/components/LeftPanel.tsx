import { Section } from '../types/schema'

interface Props {
  sections: Section[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (sections: Section[]) => void
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
  sections, selectedId, onSelect
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
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-white/30">
              No sections yet.
            </p>
            <p className="text-xs text-white/20 
              mt-1">
              Use AI Generate to start.
            </p>
          </div>
        ) : (
          sections.map((section, i) => (
            <button
              key={section.id}
              onClick={() => onSelect(section.id)}
              className={`w-full flex items-center 
                gap-2 px-3 py-2 text-left 
                text-xs transition-colors
                ${selectedId === section.id
                  ? 'bg-green-900/40 text-green-400'
                  : 'text-white/60 hover:bg-white/5'
                }`}
            >
              <span className="text-base leading-none">
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
          ))
        )}
      </div>
    </div>
  )
}
