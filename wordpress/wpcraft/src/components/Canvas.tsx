import { useEffect, useRef } from 'react'
import { PageData } from '../types/schema'

interface Props {
  pageData: PageData | null
  selectedId: string | null
  onSelect: (id: string) => void
  siteUrl: string
}

export default function Canvas({
  pageData, selectedId, onSelect, siteUrl
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!iframeRef.current) return
    const iframe = iframeRef.current
    const doc = iframe.contentDocument
    if (!doc) return

    const html = renderPageToHtml(
      pageData, selectedId, siteUrl
    )
    doc.open()
    doc.write(html)
    doc.close()

    // Listen for section clicks from iframe
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'wpcraft-select') {
        onSelect(e.data.id)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener(
        'message', handleMessage
      )
    }
  }, [pageData, selectedId])

  return (
    <div className="flex-1 bg-[#1a1a1a] flex flex-col overflow-hidden">
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
  selectedId: string | null,
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
      const isSelected = section.id === selectedId
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
            .map(el => renderElement(el))
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
          "></div>` : ''
      
      return `<section 
        data-id="${section.id}"
        onclick="window.parent.postMessage(
          {type:'wpcraft-select',id:'${section.id}'},
          '*'
        )"
        style="position:relative;
          cursor:pointer;
          box-sizing:border-box;
          ${bgStyle}
          padding:${pt}px 40px ${pb}px;
          ${minH}
          ${isSelected ? 
            'outline:2px solid #166534;' : 
            'outline:none;'}
          transition:outline 0.15s;">
        ${overlay}
        <div style="position:relative;z-index:1;
          max-width:1200px;margin:0 auto;
          display:flex;flex-wrap:wrap;">
          ${columnsHtml}
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
section:hover { outline: 1px solid rgba(22,101,52,0.3) !important; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.wpcraft-animate { 
  animation: fadeInUp 0.6s ease forwards; 
}
</style>
</head>
<body>
${sectionsHtml}
</body>
</html>`
}

function renderElement(el: any): string {
  const s = el.settings
  const style = [
    s.fontSize ? `font-size:${s.fontSize}px` : '',
    s.fontWeight ? `font-weight:${s.fontWeight}` : '',
    s.fontFamily ? 
      `font-family:'${s.fontFamily}',sans-serif` : '',
    s.color ? `color:${s.color}` : '',
    s.align ? `text-align:${s.align}` : '',
    s.marginBottom ? 
      `margin-bottom:${s.marginBottom}px` : '',
    s.lineHeight ? 
      `line-height:${s.lineHeight}` : '',
  ].filter(Boolean).join(';')

  switch (el.type) {
    case 'heading':
      const tag = s.tag || 'h2'
      return `<${tag} style="${style}" 
        class="wpcraft-animate">
        ${s.text || ''}
      </${tag}>`
    
    case 'text':
      return `<p style="${style};line-height:1.7;
        class="wpcraft-animate">
        ${s.text || ''}
      </p>`
    
    case 'button':
      return `<div style="margin-bottom:${
        s.marginBottom || 0}px;
        text-align:${s.align || 'left'}">
        <a href="${s.url || '#'}" 
          style="display:inline-block;
          background:${s.backgroundColor || '#166534'};
          color:${s.color || '#fff'};
          padding:14px 32px;
          border-radius:${s.borderRadius || 8}px;
          font-weight:600;font-size:15px;
          font-family:'Inter',sans-serif;
          transition:all 0.3s ease;">
          ${s.text || 'Click Here'}
        </a>
      </div>`
    
    case 'image':
      return `<img src="${s.url || ''}" 
        alt="${s.alt || ''}"
        style="width:100%;
        ${s.height ? `height:${s.height}px;` : ''}
        object-fit:cover;display:block;
        border-radius:${s.borderRadius || 0}px;
        margin-bottom:${s.marginBottom || 0}px;">`
    
    case 'spacer':
      return `<div style="height:${s.height||40}px;
        ${s.backgroundColor ? 
          `background:${s.backgroundColor};` : ''}
        ${s.width ? `width:${s.width};` : ''}">
      </div>`
    
    default:
      return ''
  }
}
