export function elementorToHtml(
  data: any, 
  primaryColor: string,
  businessName: string
): string {
  
  function renderWidget(widget: any): string {
    const s = widget.settings || {}
    switch (widget.widgetType) {
      case 'heading':
        const tag = s.header_size || 'h2'
        const align = s.align || 'left'
        return `<${tag} style="text-align:${align};
          margin:0 0 16px;line-height:1.2;
          font-weight:700;">
          ${s.title || ''}
        </${tag}>`
      
      case 'text-editor':
        return `<div style="font-size:16px;
          line-height:1.7;margin:0 0 20px;
          color:#555;">
          ${s.editor || s.text || ''}
        </div>`
      
      case 'button':
        const btnColor = s.background_color || 
          primaryColor
        return `<div style="text-align:${s.align || 'center'};
          margin:24px 0;">
          <a href="${s.link?.url || '#'}" 
            style="display:inline-block;
            background:${btnColor};
            color:#fff;padding:14px 32px;
            border-radius:${s.border_radius || 6}px;
            font-size:15px;font-weight:600;
            text-decoration:none;">
            ${s.text || 'Get Started'}
          </a>
        </div>`
      
      case 'icon-box':
        return `<div style="padding:24px;
          background:#f9f9f9;border-radius:12px;
          height:100%;">
          <div style="width:40px;height:40px;
            background:${primaryColor};
            border-radius:8px;margin:0 0 16px;
            opacity:0.15;">
          </div>
          <h4 style="margin:0 0 8px;font-size:17px;
            font-weight:600;">
            ${s.title_text || ''}
          </h4>
          <p style="margin:0;color:#666;
            font-size:14px;line-height:1.6;">
            ${s.description_text || ''}
          </p>
        </div>`
      
      case 'image':
        return `<img 
          src="${s.image?.url || 
            'https://placehold.co/800x400/eee/999?text=Image'}" 
          style="width:100%;border-radius:8px;" />`
      
      case 'spacer':
        const h = s.space?.size || 40
        return `<div style="height:${h}px;"></div>`
      
      default:
        return ''
    }
  }

  function renderColumn(col: any): string {
    const size = col.settings?._column_size || 100
    const widgets = (col.elements || [])
      .map(renderWidget).join('')
    return `<div style="flex:${size};
      min-width:0;padding:0 12px;
      box-sizing:border-box;">
      ${widgets}
    </div>`
  }

  function renderSection(section: any): string {
    const s = section.settings || {}
    const bg = s.background_color || '#ffffff'
    const pt = s.padding?.top || '60'
    const pb = s.padding?.bottom || '60'
    
    // Check if columns are equal width 
    // (features section pattern)
    const cols = section.elements || []
    const columnsHtml = cols
      .map(renderColumn).join('')
    
    return `<section style="background:${bg};
      padding:${pt}px 40px ${pb}px;
      box-sizing:border-box;">
      <div style="max-width:1100px;margin:0 auto;">
        <div style="display:flex;
          flex-wrap:wrap;margin:0 -12px;
          align-items:flex-start;">
          ${columnsHtml}
        </div>
      </div>
    </section>`
  }

  const sectionsHtml = (data.content || [])
    .map(renderSection).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" 
  content="width=device-width,initial-scale=1">
<title>${businessName}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: 'Inter', sans-serif; 
    color: #1a1a1a;
    line-height: 1.6;
  }
  img { max-width: 100%; }
  @media (max-width: 768px) {
    section > div > div { flex-direction: column !important; }
    section > div > div > div { flex: 100% !important; margin-bottom: 20px; }
  }
</style>
</head>
<body>
${sectionsHtml}
</body>
</html>`
}
