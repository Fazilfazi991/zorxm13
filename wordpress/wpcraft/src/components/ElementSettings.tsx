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
  })
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
            value={s.text || ''}
            onChange={e => upd('text', e.target.value)}
            rows={element.type === 'text' ? 4 : 2}
            className="w-full bg-white/5 
              border border-white/10 rounded-lg
              px-2.5 py-2 text-xs text-white/80
              resize-none focus:outline-none
              focus:border-green-600/50"
          />
        </Field>
      )}

      {/* HEADING TAG */}
      {element.type === 'heading' && (
        <Field label="Tag">
          <select
            value={s.tag || 'h2'}
            onChange={e => upd('tag', e.target.value)}
            className="w-full bg-white/5 
              border border-white/10 rounded-lg
              px-2.5 py-1.5 text-xs text-white/80
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
              value={s.fontSize || 16}
              onChange={e => upd('fontSize', 
                parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs 
              text-white/50 w-8 text-right">
              {s.fontSize || 16}
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
            value={s.fontWeight || '400'}
            onChange={e => upd('fontWeight', 
              e.target.value)}
            className="w-full bg-white/5 
              border border-white/10 rounded-lg
              px-2.5 py-1.5 text-xs text-white/80
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
            value={s.fontFamily || 'Inter'}
            onChange={e => upd('fontFamily', 
              e.target.value)}
            className="w-full bg-white/5 
              border border-white/10 rounded-lg
              px-2.5 py-1.5 text-xs text-white/80
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
            value={s.color || '#ffffff'}
            onChange={v => upd('color', v)}
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
                  ${s.align === a
                    ? 'bg-green-700 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
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
              value={s.backgroundColor || '#166534'}
              onChange={v => upd(
                'backgroundColor', v
              )}
            />
          </Field>
          <Field label="URL">
            <input
              type="text"
              value={s.url || ''}
              onChange={e => upd('url', 
                e.target.value)}
              placeholder="https://"
              className="w-full bg-white/5 
                border border-white/10 rounded-lg
                px-2.5 py-1.5 text-xs 
                text-white/80 focus:outline-none"
            />
          </Field>
          <Field label="Border radius">
            <div className="flex items-center 
              gap-2">
              <input
                type="range"
                min={0} max={50}
                value={s.borderRadius || 8}
                onChange={e => upd('borderRadius',
                  parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs 
                text-white/50 w-8 text-right">
                {s.borderRadius || 8}px
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
              value={s.url || ''}
              onChange={e => upd('url', 
                e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/5 
                border border-white/10 rounded-lg
                px-2.5 py-2 text-xs 
                text-white/80 focus:outline-none"
            />
          </Field>
          {s.url && (
            <img 
              src={s.url} 
              alt="" 
              className="w-full rounded-lg 
                object-cover"
              style={{ height: '80px' }}
            />
          )}
          <Field label="Alt text">
            <input
              type="text"
              value={s.alt || ''}
              onChange={e => upd('alt', 
                e.target.value)}
              className="w-full bg-white/5 
                border border-white/10 rounded-lg
                px-2.5 py-1.5 text-xs 
                text-white/80 focus:outline-none"
            />
          </Field>
          <Field label="Height (px)">
            <input
              type="number"
              value={s.height || ''}
              onChange={e => upd('height',
                parseInt(e.target.value) || undefined
              )}
              placeholder="Auto"
              className="w-full bg-white/5 
                border border-white/10 rounded-lg
                px-2.5 py-1.5 text-xs 
                text-white/80 focus:outline-none"
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
                value={s.height || 40}
                onChange={e => upd('height',
                  parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs 
                text-white/50 w-10 text-right">
                {s.height || 40}px
              </span>
            </div>
          </Field>
          <Field label="Color">
            <ColorInput
              value={s.backgroundColor || ''}
              onChange={v => upd(
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
            value={s.marginBottom || 0}
            onChange={e => upd('marginBottom',
              parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs 
            text-white/50 w-8 text-right">
            {s.marginBottom || 0}
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
        text-white/30 block mb-1.5 
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
            border border-white/20 flex-shrink-0"
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
        className="flex-1 bg-white/5 
          border border-white/10 rounded-lg
          px-2 py-1.5 text-xs text-white/80
          font-mono focus:outline-none
          focus:border-green-600/50"
      />
    </div>
  )
}
