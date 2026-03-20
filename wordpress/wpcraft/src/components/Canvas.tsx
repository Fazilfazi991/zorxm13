import { useEffect, useRef } from 'react'
import { PageData, Selection } from '../types/schema'

interface Props {
  pageData: PageData | null
  selection: Selection | null
  hasPreview?: boolean
  viewMode?: 'desktop' | 'mobile'
  onSelectSection: (id: string) => void
  onSelectElement: (sectionId: string, columnId: string, elementId: string) => void
  siteUrl: string
}

export default function Canvas({
  pageData, selection, hasPreview = false, onSelectSection, onSelectElement, siteUrl
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const scrollYRef = useRef(0)
  const prevSelectionRef = useRef<Selection | null>(null)

  useEffect(() => {
    if (!iframeRef.current) return
    const iframe = iframeRef.current
    const win = iframe.contentWindow
    const doc = iframe.contentDocument
    if (!doc) return

    if (win) {
      scrollYRef.current = win.scrollY
    }

    const html = renderPageToHtml(
      pageData, selection, hasPreview, siteUrl
    )
    doc.open()
    doc.write(html)
    doc.close()

    setTimeout(() => {
      const newWin = iframe.contentWindow
      const newDoc = iframe.contentDocument
      if (!newWin || !newDoc) return
      
      const prevSectionId = prevSelectionRef.current?.sectionId
      const curSectionId = selection?.sectionId
      
      if (curSectionId && curSectionId !== prevSectionId) {
        const el = newDoc.querySelector(`[data-id="${curSectionId}"]`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } else {
        newWin.scrollTo(0, scrollYRef.current)
      }
      prevSelectionRef.current = selection
    }, 50)

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'wpcraft-select') {
        onSelectSection(e.data.id)
      }
      if (e.data?.type === 'wpcraft-select-element') {
        onSelectElement(
          e.data.sectionId,
          e.data.columnId,
          e.data.elementId
        )
      }
      if (e.data?.type === 'wpcraft-deselect') {
        onSelectSection('')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener(
        'message', handleMessage
      )
    }
  }, [pageData, selection, hasPreview])

  return (
    <div className="flex-1 bg-[#F1F3F4] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto bg-white 
          rounded-lg overflow-hidden shadow-2xl"
          style={{ maxWidth: '1200px' }}>
          <iframe
            ref={iframeRef}
            className="w-full border-0"
            style={{ 
              minHeight: '800px',
              height: '100%'
            }}
            title="WPCraft Canvas"
          />
        </div>
      </div>
    </div>
  )
}

function renderPageToHtml(
  pageData: PageData | null,
  selection: Selection | null,
  hasPreview: boolean,
  siteUrl: string
): string {
  if (!pageData || !pageData.sections?.length) {
    return `<!DOCTYPE html><html>
    <head>
      <style>
        body { 
          font-family: sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background: #fafafa;
          flex-direction: column;
          gap: 12px;
          color: #999;
        }
        .icon { font-size: 32px; opacity: 0.3; }
        p { font-size: 14px; margin: 0; }
        small { font-size: 12px; opacity: 0.6; }
      </style>
    </head>
    <body>
      <div class="icon">✦</div>
      <p>Your page will appear here</p>
      <small>Click "Generate with AI" to start</small>
    </body>
    </html>`
  }

  const sectionsHtml = pageData.sections
    .map(section => {
      const isSelected = selection?.type === 'section' && selection.sectionId === section.id
      const isSectionActive = selection?.sectionId === section.id
      const settings = section.settings
      
      let bgStyle = ''
      if (settings.backgroundType === 'image' 
          && settings.background) {
        bgStyle = `background-image:url(${settings.background});
          background-size:cover;
          background-position:center;`
      } else if (settings.background) {
        bgStyle = `background-color:${settings.background};`
      }
      
      const pt = settings.padding?.top ?? 80
      const pb = settings.padding?.bottom ?? 80
      const minH = settings.fullHeight ? 
        'min-height:100vh;' : ''
      
      const columnsHtml = section.columns
        .map(col => {
          const flex = col.width === 100 ? 
            '1 1 100%' : `0 0 ${col.width}%`
          
          const elementsHtml = col.elements
            .map(el => {
              const isElSelected = selection?.type === 'element' && selection.elementId === el.id
              return renderElement(el, section.id, col.id, isElSelected, hasPreview, isSectionActive)
            })
            .join('')
          
          return `<div style="flex:${flex};
            padding:0 12px;
            box-sizing:border-box;">
            ${elementsHtml}
          </div>`
        }).join('')
      
      const overlay = settings.backgroundOverlay ?
        `<div style="position:absolute;inset:0;
          background:${settings.backgroundOverlay};
          pointer-events:none;"></div>` : ''
      
      const sectionClass = `wpcraft-section ${isSelected ? 'is-active' : ''} ${selection?.type === 'element' && isSectionActive ? 'has-element-active' : ''}`;
          
      return `<section 
        data-id="${section.id}"
        class="${sectionClass}"
        onclick="event.stopPropagation(); window.parent.postMessage(
          {type:'wpcraft-select',id:'${section.id}'},
          '*'
        )"
        style="position:relative;
          border-bottom: 1px solid #e2e8f0;
          cursor:pointer;
          box-sizing:border-box;
          ${bgStyle}
          padding:${pt}px 40px ${pb}px;
          ${minH}
          ${isSelected ? 
            `outline:2px ${hasPreview ? 'dashed' : 'solid'} ${hasPreview ? '#eab308' : '#166534'} !important; outline-offset: -2px;` : 
            (selection?.type === 'element' && isSectionActive ? 
              `outline:2px solid rgba(22,101,52,0.3) !important; outline-offset: -2px;` : 'outline:none;')}
          transition:outline 0.15s;">
        ${overlay}
        <div style="position:relative;z-index:1;
          max-width:1200px;margin:0 auto;
          display:flex;flex-wrap:wrap;pointer-events:none;">
          <div style="width:100%;display:flex;flex-wrap:wrap;pointer-events:auto;">
            ${columnsHtml}
          </div>
        </div>
      </section>`
    }).join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" 
  content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; }
img { max-width: 100%; }
a { text-decoration: none; }
section:hover { outline: 1px dashed rgba(22,101,52,0.4) !important; }
.wpcraft-element:hover {
  outline: 1px dashed rgba(22,101,52,0.4) !important;
  outline-offset: 2px;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.wpcraft-animate { 
  animation: fadeInUp 0.6s ease forwards; 
}
.wpcraft-element.is-selected::before {
  content: attr(data-el-type);
  position: absolute;
  top: -24px; left: -2px;
  background: #22c55e;
  color: white;
  font-size: 10px;
  text-transform: capitalize;
  padding: 2px 8px;
  border-radius: 4px 4px 0 0;
  pointer-events: none;
  z-index: 20;
}
</style>
<style>
.wpcraft-section::before {
  content: "Click to select section";
  position: absolute;
  top: 0; left: 0;
  background: rgba(22,101,52,0.9);
  color: white;
  font-size: 11px;
  padding: 4px 10px;
  border-bottom-right-radius: 6px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
  pointer-events: none;
  font-weight: 500;
}
.wpcraft-section:hover::before { opacity: 1; }
.wpcraft-section.is-active::before { 
  opacity: 1; 
  content: "Section selected — click element to edit individually"; 
}
.wpcraft-section.has-element-active::before { opacity: 0 !important; }
</style>
</head>
<body onclick="window.parent.postMessage({type:'wpcraft-deselect'}, '*')">
${sectionsHtml}
</body>
</html>`
}

function buildElementStyle(s: any): string {
  return [
    s.fontSize ? `font-size:${s.fontSize}px` : '',
    s.fontWeight ? `font-weight:${s.fontWeight}` : '',
    s.fontFamily ? 
      `font-family:'${s.fontFamily}',sans-serif` : '',
    s.color ? `color:${s.color}` : '',
    s.align ? `text-align:${s.align}` : '',
    s.lineHeight ? `line-height:${s.lineHeight}` : '',
  ].filter(Boolean).join(';')
}

function renderElement(
  el: any,
  sectionId: string,
  columnId: string,
  isSelected: boolean,
  hasPreview: boolean,
  isSectionActive: boolean
): string {
  const s = el.settings
  const dataAttrs = 
    `data-section-id="${sectionId}" 
     data-column-id="${columnId}"
     data-element-id="${el.id}"
     data-el-type="${el.type}"`
  
  const clickHandler = 
    `onclick="
      if (!${isSectionActive}) {
        return; 
      }
      event.stopPropagation();
      window.parent.postMessage({
        type:'wpcraft-select-element',
        sectionId:'${sectionId}',
        columnId:'${columnId}',
        elementId:'${el.id}',
        elType:'${el.type}'
      },'*')"` 
  
  const selectedStyle = isSelected
    ? `outline: 2px ${hasPreview ? 'dashed' : 'solid'} ${hasPreview ? '#eab308' : '#22c55e'} !important; outline-offset: 2px;`
    : ''
  
  const hoverClass = 'wpcraft-element' + (isSelected ? ' is-selected' : '')
  
  const baseStyle = `cursor: pointer; position: relative; ${selectedStyle}`

  const style = buildElementStyle(s)

  switch (el.type) {
    case 'heading':
      const tag = s.tag || 'h2'
      return `<${tag} 
        ${dataAttrs} ${clickHandler}
        class="${hoverClass}"
        style="${style};${baseStyle}">
        ${s.text || 'Click to edit'}
      </${tag}>`
    
    case 'text':
      return `<p 
        ${dataAttrs} ${clickHandler}
        class="${hoverClass}"
        style="${style};line-height:1.7;${baseStyle}">
        ${s.text || 'Click to edit'}
      </p>`
    
    case 'button':
      return `<div 
        ${dataAttrs} ${clickHandler}
        class="${hoverClass}"
        style="margin-bottom:${
          s.marginBottom||0}px;
        text-align:${s.align||'left'};
        ${selectedStyle}">
        <a href="#" 
          onclick="return false"
          style="display:inline-block;
          background:${s.backgroundColor||'#166534'};
          color:${s.color||'#fff'};
          padding:14px 32px;
          border-radius:${s.borderRadius||8}px;
          font-weight:600;font-size:15px;
          cursor:pointer;
          transition:all 0.2s ease;">
          ${s.text || 'Button'}
        </a>
      </div>`
    
    case 'image':
      return `<div
        ${dataAttrs} ${clickHandler}
        class="${hoverClass}"
        style="${selectedStyle}">
        <img src="${s.url||''}" 
          alt="${s.alt||''}"
          style="width:100%;
          ${s.height ? 
            `height:${s.height}px;` : ''}
          object-fit:cover;display:block;
          border-radius:${s.borderRadius||0}px;
          margin-bottom:${s.marginBottom||0}px;
          pointer-events:none;">
      </div>`
    
    case 'spacer':
      return `<div 
        ${dataAttrs} ${clickHandler}
        class="${hoverClass}"
        style="height:${s.height||40}px;
        ${s.backgroundColor ? 
          `background:${s.backgroundColor};` : ''}
        ${s.width ? `width:${s.width};` : ''}
        ${baseStyle}">
      </div>`
    
    case 'buttonGroup':
      const dir = s.direction || 'row'
      const gap = s.gap || 16
      const justify = s.align === 'left' ? 'flex-start' : (s.align === 'right' ? 'flex-end' : 'center')
      const buttonsHtml = (el.buttons || []).map((btn: any) => 
        renderElement(btn, sectionId, columnId, false, hasPreview, isSectionActive)
      ).join('')
      
      return `<div 
        ${dataAttrs} ${clickHandler}
        class="${hoverClass}"
        style="display:flex; flex-direction:${dir}; gap:${gap}px; justify-content:${justify};
        margin-bottom:${s.marginBottom||0}px; ${baseStyle}">
        ${buttonsHtml}
      </div>`

    case 'divider':
      const dColor = s.color || '#e2e8f0'
      const dHeight = s.height || 0
      const dMb = s.marginBottom || 0
      if (s.style === 'wave') {
        return `<div ${dataAttrs} ${clickHandler} class="${hoverClass}" style="${baseStyle}; height:${dHeight||60}px; margin-bottom:${dMb}px;">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="display:block;width:100%;height:100%;">
            <path d="M321.4,56.4c58-10.8,114.2-30.1,172-41.9,82.4-16.7,168.2-17.7,250.5-.4,242.9,50.8,325.8,91.8,404.7,112.7,70.1,18.5,146.5,26.1,214.3,3V0H0v27.4A600.2,600.2,0,0,0,321.4,56.4Z" fill="${dColor}"></path>
          </svg>
        </div>`
      }
      return `<div ${dataAttrs} ${clickHandler} class="${hoverClass}" style="${baseStyle}; margin:${dMb}px 0;">
        <hr style="border:none; border-top:1px solid ${dColor}; margin:0;">
      </div>`

    case 'icon':
      const name = s.name || 'mdi:check'
      const size = s.size || 24
      const iconColor = encodeURIComponent(s.color || '#000000')
      const alignStyle = s.align === 'center' ? 'margin:0 auto;' : (s.align === 'right' ? 'margin-left:auto;' : '')
      const iconUrl = `https://api.iconify.design/${name}.svg?color=${iconColor}`
      
      return `<div ${dataAttrs} ${clickHandler} class="${hoverClass}" style="${baseStyle}; ${alignStyle}">
        <img src="${iconUrl}" width="${size}" height="${size}" style="display:block;">
      </div>`

    default:
      return ''
  }
}
