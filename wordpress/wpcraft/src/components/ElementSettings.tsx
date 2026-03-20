import { Element, ElementSettings as ES } from '../types/schema'

interface Props {
  element: Element
  onUpdate: (updates: Partial<Element>) => void
}

function updateSettings(
  element: Element,
  onUpdate: (updates: Partial<Element>) => void,
  key: keyof ES,
  value: any
) {
  onUpdate({
    settings: {
      ...element.settings,
      [key]: value
    }
  } as Partial<Element>)
}

export default function ElementSettings({ 
  element, onUpdate 
}: Props) {
  const s = element.settings
  const upd = (key: keyof ES, val: any) =>
    updateSettings(element, onUpdate, key, val)

  return (
    <div className="p-3 space-y-3">

      {/* TEXT CONTENT — for heading, text, button */}
      {['heading','text','button'].includes(
        element.type
      ) && (
        <Field label="Text">
          <textarea
            value={(s as any).text || ''}
            onChange={(e: any) => upd('text', e.target.value)}
            rows={element.type === 'text' ? 4 : 2}
            className="w-full bg-[#F8F9FA] 
              border border-[#E2E8F0] rounded-lg
              px-2.5 py-2 text-xs text-[#1A1A1A]
              resize-none focus:outline-none
              focus:border-[#166534]"
          />
        </Field>
      )}

      {/* HEADING TAG */}
      {element.type === 'heading' && (
        <Field label="Tag">
          <select
            value={(s as any).tag || 'h2'}
            onChange={(e: any) => upd('tag', e.target.value)}
            className="w-full bg-[#F8F9FA] 
              border border-[#E2E8F0] rounded-lg
              px-2.5 py-1.5 text-xs text-[#64748B]
              focus:outline-none">
            {['h1','h2','h3','h4','h5','p']
              .map(t => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </Field>
      )}

      {/* FONT SIZE */}
      {['heading','text'].includes(
        element.type
      ) && (
        <Field label="Font size">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={10} max={120}
              value={(s as any).fontSize || 16}
              onChange={(e: any) => upd('fontSize', 
                parseInt(e.target.value))}
              className="flex-1 accent-[#166534]"
            />
            <span className="text-xs 
              text-[#64748B] w-8 text-right">
              {(s as Record<string, any>).fontSize || 16}
            </span>
          </div>
        </Field>
      )}

      {/* FONT WEIGHT */}
      {['heading','text'].includes(
        element.type
      ) && (
        <Field label="Weight">
          <select
            value={(s as any).fontWeight || '400'}
            onChange={(e: any) => upd('fontWeight', 
              e.target.value)}
            className="w-full bg-[#F8F9FA] 
              border border-[#E2E8F0] rounded-lg
              px-2.5 py-1.5 text-xs text-[#64748B]
              focus:outline-none">
            <option value="300">Light</option>
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semibold</option>
            <option value="700">Bold</option>
            <option value="800">Extrabold</option>
          </select>
        </Field>
      )}

      {/* FONT FAMILY */}
      {['heading','text'].includes(
        element.type
      ) && (
        <Field label="Font">
          <select
            value={(s as any).fontFamily || 'Inter'}
            onChange={(e: any) => upd('fontFamily', 
              e.target.value)}
            className="w-full bg-[#F8F9FA] 
              border border-[#E2E8F0] rounded-lg
              px-2.5 py-1.5 text-xs text-[#64748B]
              focus:outline-none">
            {['Inter','DM Sans','Barlow',
              'Roboto','Poppins','Montserrat',
              'Playfair Display','Lato']
              .map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>
      )}

      {/* TEXT COLOR */}
      {['heading','text','button'].includes(
        element.type
      ) && (
        <Field label="Text color">
          <ColorInput
            value={(s as any).color || '#ffffff'}
            onChange={(v: any) => upd('color', v)}
          />
        </Field>
      )}

      {/* TEXT ALIGN */}
      {['heading','text','button'].includes(
        element.type
      ) && (
        <Field label="Align">
          <div className="flex gap-1">
            {['left','center','right'].map(a => (
              <button
                key={a}
                onClick={() => upd('align', a)}
                className={`flex-1 py-1 text-xs 
                  rounded-md transition-colors
                  ${(s as Record<string, any>).align === a
                    ? 'bg-[#166534] text-white'
                    : 'bg-[#F8F9FA] text-[#64748B] hover:bg-[#E2E8F0]'
                  }`}>
                {a === 'left' ? '⬤' : 
                 a === 'center' ? '⬤' : '⬤'}
                {a.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* BUTTON SPECIFIC */}
      {element.type === 'button' && (
        <>
          <Field label="Button color">
            <ColorInput
              value={(s as any).backgroundColor || '#166534'}
              onChange={(v: any) => upd(
                'backgroundColor', v
              )}
            />
          </Field>
          <Field label="URL">
            <input
              type="text"
              value={(s as any).url || ''}
              onChange={(e: any) => upd('url', 
                e.target.value)}
              placeholder="https://"
              className="w-full bg-[#F8F9FA] 
                border border-[#E2E8F0] rounded-lg
                px-2.5 py-1.5 text-xs 
                text-[#64748B] focus:outline-none"
            />
          </Field>
          <Field label="Border radius">
            <div className="flex items-center 
              gap-2">
              <input
                type="range"
                min={0} max={50}
                value={(s as any).borderRadius || 8}
                onChange={(e: any) => upd('borderRadius',
                  parseInt(e.target.value))}
                className="flex-1 accent-[#166534]"
              />
              <span className="text-xs 
                text-[#64748B] w-8 text-right">
                {(s as Record<string, any>).borderRadius || 8}px
              </span>
            </div>
          </Field>
        </>
      )}

      {/* IMAGE SPECIFIC */}
      {element.type === 'image' && (
        <>
          <Field label="Image URL">
            <input
              type="text"
              value={(s as any).url || ''}
              onChange={(e: any) => upd('url', 
                e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#F8F9FA] 
                border border-[#E2E8F0] rounded-lg
                px-2.5 py-2 text-xs 
                text-[#64748B] focus:outline-none"
            />
          </Field>
          {(s as any).url && (
            <img 
              src={(s as any).url} 
              alt="" 
              className="w-full rounded-lg 
                object-cover"
              style={{ height: '80px' }}
            />
          )}
          <Field label="Alt text">
            <input
              type="text"
              value={(s as any).alt || ''}
              onChange={(e: any) => upd('alt', 
                e.target.value)}
              className="w-full bg-[#F8F9FA] 
                border border-[#E2E8F0] rounded-lg
                px-2.5 py-1.5 text-xs 
                text-[#64748B] focus:outline-none"
            />
          </Field>
          <Field label="Height (px)">
            <input
              type="number"
              value={(s as any).height || ''}
              onChange={(e: any) => upd('height',
                parseInt(e.target.value) || undefined
              )}
              placeholder="Auto"
              className="w-full bg-[#F8F9FA] 
                border border-[#E2E8F0] rounded-lg
                px-2.5 py-1.5 text-xs 
                text-[#64748B] focus:outline-none"
            />
          </Field>
        </>
      )}

      {/* SPACER SPECIFIC */}
      {element.type === 'spacer' && (
        <>
          <Field label="Height">
            <div className="flex items-center 
              gap-2">
              <input
                type="range"
                min={4} max={200}
                value={(s as Record<string, any>).height || 40}
                onChange={(e: any) => upd('height',
                  parseInt(e.target.value))}
                className="flex-1 accent-[#166534]"
              />
              <span className="text-xs 
                text-[#64748B] w-10 text-right">
                {(s as Record<string, any>).height || 40}px
              </span>
            </div>
          </Field>
          <Field label="Color">
            <ColorInput
              value={(s as any).backgroundColor || ''}
              onChange={(v: any) => upd(
                'backgroundColor', v
              )}
              placeholder="transparent"
            />
          </Field>
        </>
      )}

      {/* MARGIN BOTTOM — all elements */}
      <Field label="Margin bottom">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0} max={100}
            value={(s as any).marginBottom || 0}
            onChange={(e: any) => upd('marginBottom',
              parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs 
            text-[#94A3B8] w-8 text-right">
            {(s as any).marginBottom || 0}
          </span>
        </div>
      </Field>

    </div>
  )
}

// Reusable field wrapper
function Field({ 
  label, children 
}: { 
  label: string
  children: React.ReactNode 
}) {
  return (
    <div>
      <label className="text-xs 
        text-[#94A3B8] block mb-1.5 
        font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}

// Color input with swatch
function ColorInput({ 
  value, 
  onChange,
  placeholder
}: { 
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={value.startsWith('#') 
            ? value : '#ffffff'}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 
            opacity-0 w-full h-full cursor-pointer"
        />
        <div
          className="w-7 h-7 rounded-md 
            border border-[#E2E8F0] flex-shrink-0"
          style={{ 
            background: value || '#ffffff' 
          }}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || '#000000'}
        className="flex-1 bg-[#F8F9FA] 
          border border-[#E2E8F0] rounded-lg
          px-2 py-1.5 text-xs text-[#1A1A1A]
          font-mono focus:outline-none
          focus:border-[#166534]"
      />
    </div>
  )
}
