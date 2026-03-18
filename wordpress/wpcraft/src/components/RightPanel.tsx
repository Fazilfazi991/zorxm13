import { Section } from '../types/schema'

interface Props {
  section: Section | null
  onUpdate: (updates: Partial<Section>) => void
}

export default function RightPanel({
  section, onUpdate
}: Props) {
  if (!section) {
    return (
      <div className="w-64 bg-[#141414] 
        border-l border-white/10 
        flex items-center justify-center 
        flex-shrink-0">
        <p className="text-xs text-white/30 
          text-center px-4">
          Click a section to edit its settings
        </p>
      </div>
    )
  }

  const s = section.settings

  return (
    <div className="w-64 bg-[#141414] 
      border-l border-white/10 
      flex flex-col flex-shrink-0 
      overflow-y-auto">
      
      <div className="px-3 py-2 border-b 
        border-white/10 flex-shrink-0">
        <span className="text-xs font-medium 
          text-white/40 uppercase tracking-wider">
          Section Settings
        </span>
        <p className="text-xs text-white/60 
          mt-0.5 capitalize">
          {section.type} section
        </p>
      </div>

      <div className="p-3 space-y-4">
        
        <div>
          <label className="text-xs 
            text-white/40 block mb-1">
            Background type
          </label>
          <select
            value={s.backgroundType || 'color'}
            onChange={e => onUpdate({
              settings: {
                ...s,
                backgroundType: e.target.value as any
              }
            })}
            className="w-full bg-white/5 
              border border-white/10 rounded 
              px-2 py-1.5 text-xs text-white/80"
          >
            <option value="color">Color</option>
            <option value="image">Image</option>
          </select>
        </div>

        <div>
          <label className="text-xs 
            text-white/40 block mb-1">
            Background
          </label>
          <input
            type="text"
            value={s.background || ''}
            onChange={e => onUpdate({
              settings: {
                ...s, 
                background: e.target.value
              }
            })}
            placeholder={
              s.backgroundType === 'image' 
                ? 'Image URL' 
                : '#ffffff'
            }
            className="w-full bg-white/5 
              border border-white/10 rounded 
              px-2 py-1.5 text-xs text-white/80"
          />
        </div>

        {s.backgroundType === 'image' && (
          <div>
            <label className="text-xs 
              text-white/40 block mb-1">
              Overlay color
            </label>
            <input
              type="text"
              value={s.backgroundOverlay || ''}
              onChange={e => onUpdate({
                settings: {
                  ...s,
                  backgroundOverlay: e.target.value
                }
              })}
              placeholder="rgba(0,0,0,0.7)"
              className="w-full bg-white/5 
                border border-white/10 rounded 
                px-2 py-1.5 text-xs text-white/80"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs 
              text-white/40 block mb-1">
              Padding top
            </label>
            <input
              type="number"
              value={s.padding?.top ?? 80}
              onChange={e => onUpdate({
                settings: {
                  ...s,
                  padding: {
                    ...s.padding,
                    top: parseInt(e.target.value)
                  }
                }
              })}
              className="w-full bg-white/5 
                border border-white/10 rounded 
                px-2 py-1.5 text-xs text-white/80"
            />
          </div>
          <div>
            <label className="text-xs 
              text-white/40 block mb-1">
              Padding bottom
            </label>
            <input
              type="number"
              value={s.padding?.bottom ?? 80}
              onChange={e => onUpdate({
                settings: {
                  ...s,
                  padding: {
                    ...s.padding,
                    bottom: parseInt(e.target.value)
                  }
                }
              })}
              className="w-full bg-white/5 
                border border-white/10 rounded 
                px-2 py-1.5 text-xs text-white/80"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="fullHeight"
            checked={s.fullHeight || false}
            onChange={e => onUpdate({
              settings: {
                ...s,
                fullHeight: e.target.checked
              }
            })}
            className="rounded"
          />
          <label htmlFor="fullHeight"
            className="text-xs text-white/60">
            Full viewport height
          </label>
        </div>

      </div>
    </div>
  )
}
