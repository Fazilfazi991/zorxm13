## SECTION BLUEPRINTS — FOLLOW THESE EXACT PATTERNS

### NAVBAR (always first section)
{ "type":"navbar", "settings":{ "background":"#ffffff", "logo":"[BusinessName]", "logoUrl":"/", "navLinks":[{"text":"About","url":"#about"},{"text":"Services","url":"#services"},{"text":"Testimonials","url":"#testimonials"},{"text":"Contact","url":"#contact"}], "ctaText":"Get Started", "ctaUrl":"#contact" } }

### HERO — 2 columns, text left, image right (image fills right half edge-to-edge)
ALWAYS use backgroundType:"color" — the background color applies to the text half only.
Col 1 (text, width:50): eyebrow → H1 (fontSize:64, fontWeight:800) → text → buttonGroup
Col 2 (image, width:50): ONE image element with a real Unsplash URL
image element: { "type":"image", "settings":{ "url":"https://images.unsplash.com/photo-XXXX?w=1200&q=85", "alt":"...", "borderRadius":0, "objectFit":"cover" } }

DARK hero example:
{ "type":"hero", "settings":{ "background":"#0a0f1e", "backgroundType":"color", "padding":{"top":0,"bottom":0}, "maxWidth":1280 }, "columns":[
  {"id":"col_h1","width":50,"elements":[
    {"id":"el_h1","type":"heading","settings":{"text":"DUBAI'S #1 SEO AGENCY","tag":"h6","fontSize":13,"fontWeight":"700","color":"#c9a961","align":"left","marginBottom":20}},
    {"id":"el_h2","type":"heading","settings":{"text":"Rank Higher. Convert Faster.","tag":"h1","fontSize":64,"fontWeight":"800","fontFamily":"Playfair Display","color":"#ffffff","align":"left","marginBottom":24}},
    {"id":"el_h3","type":"text","settings":{"text":"We deliver 300%+ ROI for Dubai businesses through data-driven SEO and performance marketing.","fontSize":17,"color":"rgba(255,255,255,0.78)","align":"left","marginBottom":40,"lineHeight":1.75}},
    {"id":"el_h4","type":"buttonGroup","settings":{"align":"left","gap":16,"marginBottom":0,"direction":"row"},"buttons":[
      {"id":"btn_h1","type":"button","settings":{"text":"Get Your Free Audit","url":"#contact","backgroundColor":"#c9a961","color":"#ffffff","borderRadius":8,"size":"lg","variant":"solid"}},
      {"id":"btn_h2","type":"button","settings":{"text":"See Our Work","url":"#services","backgroundColor":"transparent","color":"#ffffff","borderRadius":8,"size":"lg","variant":"outline"}}
    ]}
  ]},
  {"id":"col_h2","width":50,"elements":[
    {"id":"el_img","type":"image","settings":{"url":"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=85","alt":"Digital marketing team","borderRadius":0,"objectFit":"cover"}}
  ]}
]}

LIGHT hero example:
{ "type":"hero", "settings":{ "background":"#faf9f6", "backgroundType":"color", "padding":{"top":0,"bottom":0}, "maxWidth":1280 }, "columns":[
  {"id":"col_h1","width":50,"elements":[
    {"id":"el_h1","type":"heading","settings":{"text":"INDUSTRY · LOCATION","tag":"h6","fontSize":13,"fontWeight":"700","color":"#c9a961","align":"left","marginBottom":20}},
    {"id":"el_h2","type":"heading","settings":{"text":"Headline That Converts","tag":"h1","fontSize":64,"fontWeight":"800","fontFamily":"Playfair Display","color":"#0a0f1e","align":"left","marginBottom":24}},
    {"id":"el_h3","type":"text","settings":{"text":"Supporting description that explains the value proposition clearly.","fontSize":17,"color":"#4b5563","align":"left","marginBottom":40,"lineHeight":1.75}},
    {"id":"el_h4","type":"buttonGroup","settings":{"align":"left","gap":16,"marginBottom":0},"buttons":[
      {"id":"btn_h1","type":"button","settings":{"text":"Get Started","url":"#contact","backgroundColor":"#0a0f1e","color":"#ffffff","borderRadius":8,"size":"lg","variant":"solid"}},
      {"id":"btn_h2","type":"button","settings":{"text":"Learn More","url":"#about","backgroundColor":"transparent","color":"#0a0f1e","borderRadius":8,"size":"lg","variant":"outline"}}
    ]}
  ]},
  {"id":"col_h2","width":50,"elements":[
    {"id":"el_img","type":"image","settings":{"url":"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=85","alt":"Professional team","borderRadius":0,"objectFit":"cover"}}
  ]}
]}

HERO RULES:
✅ ALWAYS 2 columns: text col (width:50) + image col (width:50)
✅ Image element ALWAYS has borderRadius:0 (edge-to-edge fill)
✅ H1 ALWAYS fontSize:56-72, fontWeight:800
✅ ButtonGroup ALWAYS align:"left" in hero
✅ Buttons: first = solid (gold or dark), second = outline
✅ NEVER center-align hero text
✅ NEVER use backgroundType:"image" for hero — use 2-col with image element instead

### LOGO STRIP (after hero)
{ "type":"logostrip", "settings":{"background":"#ffffff","label":"Trusted by leading businesses","logos":[{"name":"Company 1","text_only":true},{"name":"Company 2","text_only":true},{"name":"Company 3","text_only":true},{"name":"Company 4","text_only":true},{"name":"Company 5","text_only":true}]} }

### ABOUT — cream bg, 2-col (image left, text right)
background:"#faf9f6" | padding top:96 bottom:96
col 1 (width:50): image (good Unsplash, borderRadius:16)
col 2 (width:50): eyebrow(color:"#c9a961") → H2(color:"#0a0f1e") → text(color:"#374151") → text(color:"#4b5563") → button(solid,backgroundColor:"#0a0f1e",color:"#ffffff")
✅ ALL text dark on cream

### SERVICES — cream header + cream 3-col cards
HEADER section: background:"#ffffff", 1 col, contentAlign:"center"
  eyebrow → H2(align:"center",color:"#0a0f1e") → text(align:"center",color:"#6b7280")
CARDS section: background:"#faf9f6", 3 cols (width:33 each)
  icon(color:"#c9a961",size:48) → H3(color:"#0a0f1e") → text(color:"#4b5563") → button(variant:"outline",color:"#c9a961",backgroundColor:"transparent",size:"sm")
✅ Card text ALWAYS dark. NEVER white text in cards.

### PROCESS
{ "type":"process", "settings":{"background":"#ffffff","eyebrow":"HOW IT WORKS","title":"Simple Process"} }
3-4 columns, H3 + text per step.

### TESTIMONIALS — dark bg + dark cards
HEADER: background:"#0a0f1e", 1 col, centered
  eyebrow(color:"#c9a961") → H2(color:"#ffffff")
CARDS: background:"#0a0f1e", 3 cols
  stars(count:5) → text(quote,color:"rgba(255,255,255,0.85)",fontStyle:italic) → spacer → heading(author,tag:"h4",color:"#c9a961") → text(role,fontSize:13,color:"rgba(255,255,255,0.45)")
✅ ALL text white/rgba on dark

### STATS — dark gradient, 4 cols
background:"linear-gradient(135deg,#0a0f1e 0%,#1a2744 100%)" | backgroundType:"gradient"
4 cols (width:25): H2(number,fontSize:52,fontWeight:"800",color:"#c9a961",align:"center") → text(label,fontSize:13,color:"rgba(255,255,255,0.55)",align:"center")
✅ Gold numbers, rgba-white labels, dark bg

### CTA — gold-to-teal gradient, centered, ALL white
background:"linear-gradient(135deg,#c9a961 0%,#06b6d4 100%)" | backgroundType:"gradient"
contentAlign:"center" | padding top:100 bottom:100
1 col:
  eyebrow(color:"rgba(255,255,255,0.75)",align:"center")
  H2(fontSize:48,color:"#ffffff",align:"center")
  text(color:"rgba(255,255,255,0.88)",align:"center")
  buttonGroup(align:"center",gap:16):
    btn1: backgroundColor:"#ffffff", color:"#0a0f1e", size:"lg" ← WHITE button, DARK text
    btn2: variant:"outline", color:"#ffffff", size:"lg"
✅ Primary CTA button MUST be white bg + dark text
✅ ALL alignment center

### FOOTER (always last)
{ "type":"footer", "settings":{ "background":"#0a0f1e", "logo":"[BusinessName]", "tagline":"[brand tagline]", "copyright":"© 2025 [Business]. All rights reserved.", "social":[{"platform":"instagram","url":"#"},{"platform":"linkedin","url":"#"},{"platform":"whatsapp","url":"#"}] }, "columns":[{"title":"Services","links":[{"text":"[Service]","url":"#"}]},{"title":"Company","links":[{"text":"About","url":"#about"},{"text":"Contact","url":"#contact"}]}] }

FINAL SELF-CHECK:
1. Hero: 2 cols, text left, image right, borderRadius:0 on image ✓
2. H1 in hero: fontSize 56-72, fontWeight 800 ✓
3. Hero buttons: left-aligned, solid + outline pair ✓
4. Dark bg → white text / Light bg → dark text ✓
5. Cards always white bg + dark text ✓
6. CTA: center align, white button with dark text ✓
7. Navbar first → footer last ✓
8. Stats: gold numbers, dark bg ✓
