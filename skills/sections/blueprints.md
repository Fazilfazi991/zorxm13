## SECTION BLUEPRINTS v2 — KIMI MUST FOLLOW THESE EXACTLY

### DESIGN RULES (MANDATORY)
1. Hero backgrounds: ALWAYS use backgroundType:"mesh" — never flat color for dark sections
2. H1 headlines: ALWAYS use gradientFrom/gradientTo for a gold-to-white gradient
3. Stats section: ALWAYS set overlapPrev:60 and clipAngle:true
4. Testimonial cards: ALWAYS set glass:true on each column settings
5. Use dotGrid:true on all dark mesh sections
6. Buttons always inline-width, never full-width

---

### NAVBAR
{ "type":"navbar", "settings":{ "background":"#ffffff", "logo":"[BusinessName]", "navLinks":[{"text":"About","url":"#about"},{"text":"Services","url":"#services"},{"text":"Testimonials","url":"#testimonials"},{"text":"Contact","url":"#contact"}], "ctaText":"Get Started", "ctaUrl":"#contact" } }

---

### HERO — mesh gradient left, edge-to-edge image right
{ "type":"hero", "settings":{ "background":"#0a0f1e", "backgroundType":"mesh", "meshColor1":"#0a0f1e", "meshColor2":"#1a2744", "meshColor3":"#080c18", "meshAccent":"rgba(201,169,97,0.1)", "dotGrid":true, "padding":{"top":0,"bottom":0}, "maxWidth":1280 },
"columns":[
  {"id":"col_h1","width":50,"elements":[
    {"id":"el_ey","type":"heading","settings":{"text":"INDUSTRY · LOCATION","tag":"h6","fontSize":12,"fontWeight":"700","color":"#c9a961","align":"left","marginBottom":20}},
    {"id":"el_h1","type":"heading","settings":{"text":"Headline That","tag":"h1","fontSize":68,"fontWeight":"800","fontFamily":"Playfair Display","gradientFrom":"#ffffff","gradientTo":"#c9a961","gradientAngle":135,"align":"left","marginBottom":8}},
    {"id":"el_h1b","type":"heading","settings":{"text":"Converts","tag":"h1","fontSize":68,"fontWeight":"800","fontFamily":"Playfair Display","gradientFrom":"#c9a961","gradientTo":"#e8c97e","gradientAngle":135,"align":"left","marginBottom":28}},
    {"id":"el_bd","type":"text","settings":{"text":"Supporting description with specific value proposition.","fontSize":17,"color":"rgba(255,255,255,0.72)","align":"left","marginBottom":44,"lineHeight":1.75}},
    {"id":"el_bt","type":"buttonGroup","settings":{"align":"left","gap":16,"marginBottom":0},"buttons":[
      {"id":"btn1","type":"button","settings":{"text":"Primary CTA","url":"#contact","backgroundColor":"#c9a961","color":"#0a0f1e","borderRadius":4,"size":"lg"}},
      {"id":"btn2","type":"button","settings":{"text":"Learn More","url":"#services","variant":"outline","color":"#ffffff","borderRadius":4,"size":"lg"}}
    ]}
  ]},
  {"id":"col_h2","width":50,"elements":[
    {"id":"el_img","type":"image","settings":{"url":"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=85","alt":"","borderRadius":0,"objectFit":"cover","marginBottom":0}}
  ]}
]}

HERO RULES:
✅ backgroundType MUST be "mesh" — never "color" for dark heroes
✅ H1 MUST use gradientFrom + gradientTo (white-to-gold or gold-to-light)
✅ dotGrid:true adds dot pattern texture
✅ Image col borderRadius:0 always (edge-to-edge fill)
✅ Buttons left-aligned always in hero

---

### LOGO STRIP
{ "type":"logostrip", "settings":{"background":"#ffffff","label":"Trusted by leading businesses in the UAE","logos":[{"name":"Company A","text_only":true},{"name":"Company B","text_only":true},{"name":"Company C","text_only":true},{"name":"Company D","text_only":true},{"name":"Company E","text_only":true}]} }

---

### SERVICES — bento layout (first card wider)
Header: { "type":"services_header", "settings":{"background":"#ffffff","padding":{"top":80,"bottom":16},"maxWidth":1280},
"columns":[{"width":100,"elements":[
  {"type":"heading","settings":{"text":"WHAT WE DO","tag":"h6","fontSize":12,"fontWeight":"700","color":"#c9a961","align":"center","marginBottom":16}},
  {"type":"heading","settings":{"text":"Our Services","tag":"h2","fontSize":48,"fontWeight":"700","fontFamily":"Playfair Display","color":"#0a0f1e","align":"center","marginBottom":16}},
  {"type":"text","settings":{"text":"Comprehensive solutions tailored for your business.","fontSize":17,"color":"#6b7280","align":"center","marginBottom":0}}
]}]}

Cards: { "type":"services", "settings":{"background":"#f9fafb","padding":{"top":40,"bottom":96},"maxWidth":1280},
"columns":[
  {"id":"c1","elements":[icon, H3, text, button]},  ← first col is wider in bento
  {"id":"c2","elements":[icon, H3, text, button]},
  {"id":"c3","elements":[icon, H3, text, button]}
]}

---

### STATS — overlaps previous section with angled clip
{ "type":"stats", "settings":{
  "background":"linear-gradient(135deg,#0a0f1e 0%,#1a2744 100%)",
  "backgroundType":"gradient",
  "dotGrid":true,
  "overlapPrev":60,
  "clipAngle":true,
  "padding":{"top":100,"bottom":80},
  "maxWidth":1280
},
"columns":[
  {"elements":[{"type":"heading","settings":{"text":"200+","fontSize":56,"fontWeight":"800","gradientFrom":"#c9a961","gradientTo":"#e8d5a3","gradientAngle":135}},{"type":"text","settings":{"text":"Clients Served","fontSize":13,"color":"rgba(255,255,255,0.45)","align":"center"}}]},
  ... × 4 cols
]}

STATS RULES:
✅ ALWAYS overlapPrev:60 + clipAngle:true
✅ Numbers MUST use gradientFrom:"#c9a961" gradientTo:"#e8d5a3"
✅ backgroundType:"gradient" with dark gradient
✅ dotGrid:true

---

### TESTIMONIALS — dark bg + glass cards
Header: dark background, centered eyebrow + H2

Cards section: { "type":"testimonials", "settings":{"background":"#0a0f1e","backgroundType":"mesh","meshColor1":"#0a0f1e","dotGrid":true,"padding":{"top":48,"bottom":96}},
"columns":[
  {"settings":{"glass":true}, "elements":[stars, text(quote), spacer, heading(author,fontSize:16,color:"#c9a961"), text(role,fontSize:13,color:"rgba(255,255,255,0.4)")]},
  {"settings":{"glass":true}, "elements":[...]},
  {"settings":{"glass":true}, "elements":[...]}
]}

TESTIMONIAL RULES:
✅ ALWAYS glass:true on each column settings
✅ ALWAYS dark background with mesh/dot texture
✅ Author name in gold, role in muted white

---

### ABOUT (FEATURE ROW)
{ "type":"feature_row", "settings":{"background":"#faf9f6","padding":{"top":96,"bottom":96}},
"columns":[
  {"elements":[image(borderRadius:16)]},
  {"elements":[eyebrow(gold), H2(color:"#0a0f1e"), text, check-list items, button]}
]}
✅ Light bg → dark text always
✅ Image col first (left), text col second (right)

---

### CTA SECTION — always centered, gold gradient, white button
{ "type":"cta", "settings":{
  "background":"linear-gradient(135deg,#c9a961 0%,#a8863c 50%,#e8c97e 100%)",
  "backgroundType":"gradient",
  "padding":{"top":100,"bottom":100},
  "maxWidth":720
},
"columns":[{"elements":[
  {"type":"heading","settings":{"text":"READY TO GET STARTED?","tag":"h6","fontSize":12,"color":"rgba(8,12,24,0.5)","align":"center"}},
  {"type":"heading","settings":{"text":"Let's Build Something Great","tag":"h2","fontSize":52,"fontWeight":"300","fontFamily":"Playfair Display","color":"#0a0f1e","align":"center","marginBottom":20}},
  {"type":"text","settings":{"text":"CTA description with urgency.","fontSize":17,"color":"rgba(8,12,24,0.65)","align":"center","marginBottom":40}},
  {"type":"buttonGroup","settings":{"align":"center","gap":16},"buttons":[
    {"type":"button","settings":{"text":"Book Free Consultation","url":"#contact","backgroundColor":"#0a0f1e","color":"#c9a961","borderRadius":4,"size":"lg"}},
    {"type":"button","settings":{"text":"WhatsApp Us","url":"https://wa.me/971500000000","variant":"outline","color":"#0a0f1e","borderRadius":4,"size":"lg"}}
  ]}
]}]}

CTA RULES:
✅ ALWAYS gold gradient background
✅ ALWAYS dark ink primary button with gold text
✅ ALWAYS center align everything
✅ ALWAYS outline button as second option

---

### FOOTER
{ "type":"footer", "settings":{ "background":"#040710", "logo":"[Business]", "tagline":"[short brand promise]", "copyright":"© 2025 [Business]. All rights reserved.", "social":[{"platform":"instagram","url":"#"},{"platform":"linkedin","url":"#"},{"platform":"whatsapp","url":"#"}] }, "columns":[{"title":"Services","links":[...]},{"title":"Company","links":[...]}] }

---

### FINAL SELF-CHECK BEFORE RETURNING JSON:
1. ✅ Hero: backgroundType:"mesh" + dotGrid:true + H1 gradientFrom/gradientTo
2. ✅ Stats: overlapPrev:60 + clipAngle:true + gradient numbers
3. ✅ Testimonials: glass:true on every column + dark mesh bg
4. ✅ CTA: gold gradient bg + ink button + centered
5. ✅ Images: borderRadius:0 in hero, 16 in about
6. ✅ Navbar first → Footer last
7. ✅ NO flat dark backgrounds — always mesh or gradient
