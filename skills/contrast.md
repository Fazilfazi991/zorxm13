## COLOR CONTRAST SKILL — MANDATORY, APPLY TO EVERY ELEMENT

Before setting any color, check the background and pick the correct text color.

BACKGROUND → REQUIRED TEXT COLORS:
Dark navy (#0f172a, #1a2744, dark gradient) → headings:#ffffff  body:rgba(255,255,255,0.82)  button-text:#ffffff
Light (white #ffffff, cream #f8f7f3, gray #f3f4f6)  → headings:#0f172a  body:#4b5563  button-text:#ffffff
Image background (always add overlay rgba(10,15,30,0.68)) → headings:#ffffff  body:rgba(255,255,255,0.85)
CTA gradient (gold→teal) → headings:#ffffff  body:rgba(255,255,255,0.88)  primary-button: bg=#ffffff text=#0f172a

CARD COLUMNS: Always white (#ffffff) background. Always dark text (#0f172a headings, #4b5563 body). Never inherit parent dark.

BUTTON RULES:
- Green bg (#00a86b) → text #ffffff
- Gold bg (#c9a961) → text #ffffff
- White bg (#ffffff) → text #0f172a (NEVER white text on white button)
- Outline dark section → border #ffffff, text #ffffff
- Outline light section → border accent color, text accent color

CTA SECTION: contentAlign MUST be "center". buttonGroup align MUST be "center". Primary button MUST be backgroundColor:#ffffff color:#0f172a.

IMAGE BG RULE: ALWAYS include "backgroundOverlay":"rgba(10,15,30,0.68)" when backgroundType is "image".

EYEBROW LABELS (fontSize:13): color #00a86b on any background — always visible.

FORBIDDEN (causes invisible text):
× #ffffff text on #ffffff bg
× #ffffff text on #f8f7f3 bg
× #0f172a text on #0f172a bg
× Any light text on light bg
× Any dark text on dark bg
× White text on a white CTA button
