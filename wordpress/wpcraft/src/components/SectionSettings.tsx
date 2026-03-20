import { Section } from '../types/schema'

interface Props {
  section: Section
  onUpdate: (updates: Partial<Section>) => void
}

export default function SectionSettings({
  section, onUpdate
}: Props) {
  const s = section.settings

  return (
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
          className="w-full bg-[#F8F9FA] 
            border border-[#E2E8F0] rounded 
            px-2 py-1.5 text-xs text-[#64748B]"
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
          className="w-full bg-[#F8F9FA] 
            border border-[#E2E8F0] rounded 
            px-2 py-1.5 text-xs text-[#64748B]"
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
            className="w-full bg-[#F8F9FA] 
              border border-[#E2E8F0] rounded 
              px-2 py-1.5 text-xs text-[#64748B]"
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
                  top: parseInt(e.target.value) || 0
                }
              }
            })}
            className="w-full bg-[#F8F9FA] 
              border border-[#E2E8F0] rounded 
              px-2 py-1.5 text-xs text-[#64748B]"
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
                  bottom: parseInt(e.target.value) || 0
                }
              }
            })}
            className="w-full bg-[#F8F9FA] 
              border border-[#E2E8F0] rounded 
              px-2 py-1.5 text-xs text-[#64748B]"
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
  )
}
