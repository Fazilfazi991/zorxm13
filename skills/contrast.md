## COLOR CONTRAST SKILL — MANDATORY, RUN THIS CHECK FOR EVERY SINGLE ELEMENT

BACKGROUND → REQUIRED TEXT COLORS (follow exactly):

| Section background                          | Heading color  | Body text color            | Button text |
|---------------------------------------------|---------------|----------------------------|-------------|
| #0f172a / #1a2744 (dark navy)               | #ffffff       | rgba(255,255,255,0.82)     | #ffffff     |
| #111827 / #1f2937 (dark gray)               | #ffffff       | rgba(255,255,255,0.82)     | #ffffff     |
| Any dark gradient (contains #0f172a etc)    | #ffffff       | rgba(255,255,255,0.82)     | #ffffff     |
| Image background (always add overlay)       | #ffffff       | rgba(255,255,255,0.85)     | #ffffff     |
| #f8f7f3 (cream)                             | #0f172a       | #374151                    | #ffffff     |
| #ffffff (white)                             | #0f172a       | #4b5563                    | #ffffff     |
| #f3f4f6 (light gray)                        | #0f172a       | #374151                    | #ffffff     |
| Gold→teal gradient CTA                      | #ffffff       | rgba(255,255,255,0.9)      | #0f172a     |

CARD COLUMNS — ALWAYS white (#ffffff) background, ALWAYS dark text:
- Card heading: #0f172a
- Card body: #4b5563
- Card icon: #c9a961 (gold) or #00a86b (green)
- NEVER put white or light text on white card columns
- NEVER inherit parent dark section color for card elements

BUTTON CONTRAST RULES:
- backgroundColor: #c9a961 (gold) → color: #ffffff
- backgroundColor: #00a86b (green) → color: #ffffff
- backgroundColor: #0f172a (dark) → color: #ffffff
- backgroundColor: #ffffff (white) → color: #0f172a (NEVER white text on white button)
- variant: outline on dark section → backgroundColor: transparent, color: #ffffff
- variant: outline on light section → backgroundColor: transparent, color: accent color

CTA SECTION SPECIAL:
- contentAlign: "center" ALWAYS
- buttonGroup align: "center" ALWAYS
- H2 color: #ffffff ALWAYS
- body text: rgba(255,255,255,0.88) ALWAYS
- Primary button: backgroundColor: "#ffffff", color: "#0f172a" (white button, dark text)
- Secondary button: variant: "outline", color: "#ffffff"

IMAGE BACKGROUND RULE:
- ALWAYS include "backgroundOverlay": "rgba(10,15,30,0.68)"
- Text over images ALWAYS color: #ffffff

EYEBROW LABELS (fontSize: 13, uppercase):
- On ANY background: color: "#c9a961" or "#00a86b" — both visible on dark and light
- NEVER white eyebrows on light backgrounds
- NEVER dark eyebrows on dark backgrounds

STAT NUMBERS:
- ALWAYS color: "#c9a961" (gold)
- ALWAYS on dark section background
- ALWAYS fontSize: 52, fontWeight: "800"
- Label below: color: "rgba(255,255,255,0.65)"

TESTIMONIAL CARDS (on dark section):
- Quote text: color: "rgba(255,255,255,0.88)", font-style italic
- Author name: color: "#c9a961"
- Role: color: "rgba(255,255,255,0.55)"
- Big quote mark: color: "rgba(201,169,97,0.25)"
- NEVER dark text in testimonial cards

FORBIDDEN — CAUSES INVISIBLE TEXT (never generate these):
× #ffffff text on #ffffff background
× #ffffff text on #f8f7f3 background
× #0f172a text on #0f172a background
× #374151 or #4b5563 text on dark navy
× #6b7280 text on dark background
× #c9a961 body text on light background (icons ok, body text no)
× White text on a white button (backgroundColor:#ffffff with color:#ffffff)
× Dark text in testimonial card columns
× Light text on light card columns

SELF-CHECK before outputting JSON — for every element ask:
1. What is the section background? Dark → white text. Light → dark text. Image → white + overlay.
2. Is it a card column? → always #ffffff bg + #0f172a heading + #4b5563 body
3. Is it a button? solid colored bg → #ffffff text. White bg → #0f172a text.
4. Is it a CTA section? → all white text, center align, white-bg primary button with dark text
5. Is it a stats number? → gold #c9a961, large, on dark bg
