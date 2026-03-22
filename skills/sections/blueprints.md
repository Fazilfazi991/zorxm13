## SECTION BLUEPRINTS — FOLLOW THESE EXACT PATTERNS

### NAVBAR (always first section)
{ "type":"navbar", "settings":{ "background":"#0f172a", "logo":"[BusinessName]", "logoUrl":"/", "navLinks":[{"text":"About","url":"#about"},{"text":"Services","url":"#services"},{"text":"Testimonials","url":"#testimonials"},{"text":"Contact","url":"#contact"}], "ctaText":"Get Started", "ctaUrl":"#contact" } }

### HERO — dark gradient, 2-col split, text always white
background: "linear-gradient(135deg,#0f172a 0%,#1a2744 100%)" | backgroundType:"gradient"
padding top:120, bottom:120 | contentAlign:"left"
col 1 (width:55): eyebrow(fontSize:13,color:"#c9a961",text:"[INDUSTRY] IN [LOCATION]") → H1(fontSize:56,fontWeight:"800",color:"#ffffff") → text(color:"rgba(255,255,255,0.82)",fontSize:18) → buttonGroup(gold solid + white outline, align:"left")
col 2 (width:45): image(Unsplash URL, borderRadius:20, objectFit:"cover")
✅ ALL text must be #ffffff or rgba(255,255,255,x). NEVER dark text in hero.
✅ buttonGroup align:"left" to match contentAlign

### LOGO STRIP (after hero)
{ "type":"logostrip", "settings":{"background":"#f8f7f3","label":"Trusted by leading businesses","logos":[{"name":"Company 1","text_only":true},{"name":"Company 2","text_only":true},{"name":"Company 3","text_only":true},{"name":"Company 4","text_only":true},{"name":"Company 5","text_only":true}]} }

### ABOUT — cream bg, 2-col, text always dark
background:"#f8f7f3" | contentAlign:"left" | padding top:80 bottom:80
col 1 (width:50): image(Unsplash, borderRadius:16)
col 2 (width:50): eyebrow(fontSize:13,color:"#00a86b") → H2(fontSize:42,color:"#0f172a") → text(color:"#374151",fontSize:17) → text(color:"#4b5563",fontSize:16) → button(solid,backgroundColor:"#00a86b",color:"#ffffff",text:"Learn More")
✅ ALL text must be dark (#0f172a or #374151). NEVER white text on cream.

### SERVICES HEADER — white bg, centered, dark text
background:"#ffffff" | contentAlign:"center" | padding top:80 bottom:40
1 col (width:100): eyebrow(fontSize:13,color:"#00a86b",align:"center") → H2(fontSize:42,color:"#0f172a",align:"center") → text(color:"#4b5563",align:"center",fontSize:17)

### SERVICE CARDS — cream bg, 3 cols, cards always white+dark text
background:"#f8f7f3" | padding top:40 bottom:80
3 cols (width:33 each) — EACH IS A CARD with white background:
  icon(name:"mdi:...",color:"#c9a961",size:48,align:"left") → H3(fontSize:22,color:"#0f172a") → text(fontSize:16,color:"#4b5563",lineHeight:1.7) → button(variant:"outline",backgroundColor:"transparent",color:"#00a86b",text:"Learn More",size:"sm")
✅ Card heading: #0f172a. Card body: #4b5563. NEVER white text in service cards.
✅ Exactly 3 columns — never 4

### PROCESS — white bg, numbered steps
{ "type":"process", "settings":{"background":"#ffffff","eyebrow":"HOW IT WORKS","title":"Simple [N]-Step Process","paddingTop":80,"paddingBottom":80}, "columns":[
  {"elements":[{"type":"heading","settings":{"text":"Step Name","tag":"h3","fontSize":20,"fontWeight":"600","color":"#0f172a","marginBottom":10}},{"type":"text","settings":{"text":"Step description.","fontSize":15,"color":"#4b5563"}}]},
  ...repeat for each step
]}

### FEATURE ROW — alternating image+text
{ "type":"feature_row", "settings":{"background":"#ffffff","paddingTop":80,"paddingBottom":80}, "columns":[
  {"width":50,"elements":[{"type":"image","settings":{"url":"[Unsplash URL]","alt":"...","width":"100%","borderRadius":16,"objectFit":"cover"}}]},
  {"width":50,"elements":[eyebrow,H2(color:#0f172a),text(color:#374151),text(color:#4b5563),button(solid,green)]}
]}

### TESTIMONIALS HEADER — dark bg, centered, white text
background:"#0f172a" | contentAlign:"center" | padding top:80 bottom:40
1 col: eyebrow(color:"#c9a961",align:"center") → H2(color:"#ffffff",align:"center")
✅ All text white on dark

### TESTIMONIAL CARDS — dark bg, 3 cols, white text
background:"#0f172a" | padding top:40 bottom:80
3 cols (width:33 each):
  heading(text:'"',fontSize:72,color:"rgba(201,169,97,0.25)",fontFamily:"Playfair Display",marginBottom:0)
  stars(count:5,color:"#c9a961",marginBottom:12)
  text(quote,fontSize:16,color:"rgba(255,255,255,0.88)",lineHeight:1.7)
  spacer(height:16)
  heading(author name,tag:"h4",fontSize:16,fontWeight:"700",color:"#c9a961")
  text(role/company,fontSize:13,color:"rgba(255,255,255,0.55)")
✅ ALL text must be white/rgba-white on dark. NEVER dark text in testimonials.

### STATS — dark gradient, 4 cols, gold numbers
background:"linear-gradient(135deg,#0f172a 0%,#111827 100%)" | backgroundType:"gradient" | contentAlign:"center"
4 cols (width:25 each):
  H2(number e.g."500+",fontSize:52,fontWeight:"800",color:"#c9a961",align:"center")
  text(label e.g."Clients Served",fontSize:14,color:"rgba(255,255,255,0.6)",align:"center")
✅ Numbers MUST be gold #c9a961. Labels rgba-white. NEVER dark text on dark section.
✅ Exactly 4 columns

### PRICING HEADER — cream bg, centered, dark text
background:"#f8f7f3" | contentAlign:"center" | padding top:80 bottom:40
1 col: eyebrow(color:"#00a86b") → H2(color:"#0f172a")

### PRICING CARDS — white bg, 3 cols, dark text in cards
background:"#ffffff" | padding top:40 bottom:80
3 cols (width:33). Middle col settings: {"featured":true,"badge":"MOST POPULAR"}
Each card:
  H3(plan name,color:"#0f172a") → H2(price,fontSize:40,color:"#c9a961") → text("/month",color:"#6b7280",fontSize:14) → divider(color:"#e5e7eb") → text(feature×4,color:"#374151",fontSize:15) → spacer(24) → button(solid,backgroundColor:"#00a86b",color:"#ffffff",size:"lg")
✅ Card text dark on white. NEVER white text in pricing cards.

### CTA — gold→teal gradient, 1 col, centered, ALL white text
background:"linear-gradient(135deg,#c9a961 0%,#06b6d4 100%)" | backgroundType:"gradient"
contentAlign:"center" | padding top:100 bottom:100
1 col (width:100):
  eyebrow(fontSize:13,color:"rgba(255,255,255,0.75)",align:"center")
  H2(fontSize:48,fontWeight:"700",color:"#ffffff",align:"center")
  text(color:"rgba(255,255,255,0.88)",align:"center",fontSize:17)
  buttonGroup(align:"center",gap:16):
    btn1: backgroundColor:"#ffffff", color:"#0f172a", size:"lg" — WHITE button, DARK text
    btn2: variant:"outline", backgroundColor:"transparent", color:"#ffffff", size:"lg"
✅ ALL text white. Primary button MUST be white bg (#ffffff) with dark text (#0f172a). CTA align MUST be center.

### FAQ — cream bg, dark text
background:"#f8f7f3" | padding top:80 bottom:80
1 col (width:100):
  eyebrow(color:"#00a86b",align:"center") → H2(color:"#0f172a",align:"center") → spacer(32)
  For each Q&A pair:
    H4(question,color:"#0f172a",fontSize:20,fontWeight:"600") → text(answer,color:"#4b5563",fontSize:16) → divider(color:"#e5e7eb",marginBottom:32)

### CONTACT — dark bg, 2 cols, white text
background:"#0f172a" | padding top:80 bottom:80
col 1 (width:50): eyebrow(color:"#c9a961") → H2(color:"#ffffff") → text(color:"rgba(255,255,255,0.8)") → spacer(24) → text("📞 +971...",color:"rgba(255,255,255,0.75)") → text("✉ email@...",color:"rgba(255,255,255,0.75)")
col 2 (width:50): H3(color:"#ffffff") → text(color:"rgba(255,255,255,0.78)") → spacer(16) → buttonGroup(gold solid CTA + whatsapp outline, align:"left")
✅ ALL text white on dark navy

### FOOTER (always last section)
{ "type":"footer", "settings":{ "background":"#0a0f1a", "logo":"[BusinessName]", "tagline":"[One line brand description]", "copyright":"© 2025 [BusinessName]. All rights reserved.", "social":[{"platform":"instagram","url":"#"},{"platform":"linkedin","url":"#"},{"platform":"whatsapp","url":"#"}] }, "columns":[{"title":"Services","links":[{"text":"[Service 1]","url":"#"},{"text":"[Service 2]","url":"#"},{"text":"[Service 3]","url":"#"}]},{"title":"Company","links":[{"text":"About Us","url":"#about"},{"text":"Contact","url":"#contact"},{"text":"Privacy Policy","url":"#"}]}] }

CONTRAST SELF-CHECK (run before outputting):
1. Dark bg → heading:#ffffff, body:rgba(255,255,255,0.82) ✓
2. Light/cream bg → heading:#0f172a, body:#374151 or #4b5563 ✓
3. White card cols → heading:#0f172a, body:#4b5563 ✓
4. CTA section → all text white, primary button: bg:#ffffff text:#0f172a, align:center ✓
5. Stats → numbers gold #c9a961, labels rgba-white, dark bg ✓
6. Image bg → backgroundOverlay:"rgba(10,15,30,0.68)", text:#ffffff ✓
7. Navbar first → footer last ✓
8. buttonGroup align matches contentAlign ✓
9. Exactly 3 service card columns ✓
10. Exactly 4 stat columns ✓
