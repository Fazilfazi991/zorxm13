## SECTION BLUEPRINTS — FOLLOW EXACTLY

### NAVBAR (always first)
{ "type":"navbar", "settings":{ "background":"#0f172a", "logo":"Business Name", "logoUrl":"/", "navLinks":[{"text":"About","url":"#about"},{"text":"Services","url":"#services"},{"text":"Contact","url":"#contact"}], "ctaText":"Get Started", "ctaUrl":"#contact" } }

### HERO — dark gradient, 2-col split
background: "linear-gradient(135deg,#0f172a 0%,#1a2744 100%)" | backgroundType:"gradient"
padding top:120 bottom:120 | contentAlign:"left"
col 1 (width:55): eyebrow(fontSize:13,color:"#00a86b") → H1(fontSize:56,color:"#ffffff") → text(color:"rgba(255,255,255,0.82)") → buttonGroup(gold solid + white outline, align:"left")
col 2 (width:45): image(Unsplash,borderRadius:20)
✅ ALL text must be white. NEVER dark text in hero.

### LOGO STRIP
{ "type":"logostrip", "settings":{"background":"#f8f7f3","label":"Trusted by leading companies","logos":[{"name":"Google","text_only":true},{"name":"Microsoft","text_only":true},{"name":"Amazon","text_only":true},{"name":"Meta","text_only":true},{"name":"Apple","text_only":true}]} }

### ABOUT — cream, 2-col
background:"#f8f7f3" | contentAlign:"left"
col 1 (width:50): image
col 2 (width:50): eyebrow(color:"#00a86b") → H2(color:"#0f172a") → text(color:"#374151") → text(color:"#4b5563")
✅ ALL text dark on cream. NEVER white text here.

### SERVICES HEADER — white, centered
background:"#ffffff" | contentAlign:"center" | padding top:80 bottom:40
1 col: eyebrow(color:"#00a86b") → H2(color:"#0f172a",align:"center") → text(color:"#4b5563",align:"center")

### SERVICE CARDS — cream, 3 cols
background:"#f8f7f3" | padding top:40 bottom:80
3 cols (width:33 each) — each is a card:
icon(color:"#00a86b",size:48) → H3(fontSize:22,color:"#0f172a") → text(fontSize:16,color:"#4b5563")
✅ Card text MUST be dark. NEVER white text in cards.

### PROCESS — { "type":"process", "settings":{"background":"#ffffff","eyebrow":"HOW IT WORKS","title":"Simple Process"} }
3-4 columns, each with H3 (step name) + text (description). Renderer adds numbered circles automatically.

### FEATURE ROW — { "type":"feature_row", ... }
Use for alternating image-text sections. 2 columns: one image, one text content.
First feature_row: image left, text right. Second: image right, text left (renderer alternates automatically).

### TESTIMONIALS HEADER — dark, centered
background:"#0f172a" | contentAlign:"center" | padding top:80 bottom:40
1 col: eyebrow(color:"#c9a961") → H2(color:"#ffffff",align:"center")

### TESTIMONIAL CARDS — dark, 3 cols
background:"#0f172a" | padding top:40 bottom:80
3 cols (width:33 each):
heading(text:'"',fontSize:72,color:"rgba(201,169,97,0.25)",fontFamily:"Playfair Display",marginBottom:0)
stars(count:5,color:"#c9a961",marginBottom:12)
text(quote,fontSize:16,color:"rgba(255,255,255,0.88)",italic)
spacer(16)
heading(author,tag:"h4",fontSize:16,fontWeight:"700",color:"#c9a961")
text(role,fontSize:13,color:"rgba(255,255,255,0.55)")
✅ ALL text white/rgba-white on dark. NEVER dark text in testimonial cards.

### STATS — dark gradient, 4 cols, centered
background:"linear-gradient(135deg,#0f172a 0%,#111827 100%)" | contentAlign:"center"
4 cols (width:25):
H2(number,fontSize:52,fontWeight:"800",color:"#c9a961",align:"center")
text(label,fontSize:14,color:"rgba(255,255,255,0.6)",align:"center")
✅ Numbers gold, labels rgba-white. NEVER dark text on dark section.

### PRICING HEADER — light, centered
background:"#f8f7f3" | contentAlign:"center" | padding top:80 bottom:40

### PRICING CARDS — white, 3 cols
background:"#ffffff" | padding top:40 bottom:80
3 cols (width:33). Middle: settings:{"featured":true,"badge":"MOST POPULAR"}
Each: H3(plan,color:"#0f172a") → H2(price,fontSize:40,color:"#c9a961") → text("/month",color:"#6b7280") → divider → text(feature,color:"#374151")×4 → spacer → button(solid,bg:"#00a86b",color:"#ffffff")
✅ Card text dark on white. NEVER white text in pricing cards.

### CTA — gold→teal gradient, 1 col, centered
background:"linear-gradient(135deg,#c9a961 0%,#06b6d4 100%)" | contentAlign:"center" | padding top:100 bottom:100
1 col (width:100):
eyebrow(fontSize:13,color:"rgba(255,255,255,0.75)",align:"center")
H2(fontSize:48,color:"#ffffff",align:"center")
text(color:"rgba(255,255,255,0.88)",align:"center")
buttonGroup(align:"center"): btn1(bg:"#ffffff",color:"#0f172a",size:"lg") + btn2(variant:"outline",color:"#ffffff",size:"lg")
✅ ALL text white. Primary button MUST be white bg + dark text.

### FOOTER (always last)
{ "type":"footer", "settings":{"background":"#0a0f1a","logo":"...","tagline":"...","copyright":"© 2025 Brand.","social":[{"platform":"instagram","url":"#"},{"platform":"linkedin","url":"#"}]}, "columns":[{"title":"Services","links":[...]},{"title":"Company","links":[...]}] }

SELF-CHECK before outputting JSON:
1. Dark bg → white text ✓
2. Light/white bg → dark text ✓
3. Card cols → always white bg + dark text ✓
4. CTA → white text + white-bg primary button ✓
5. Image bg → backgroundOverlay included ✓
6. Stats numbers → gold #c9a961 on dark ✓
7. Navbar first, footer last ✓
8. buttonGroup align matches section contentAlign ✓
