export type ElementType = 
  'heading' | 'text' | 'button' | 'image' | 
  'spacer' | 'divider' | 'icon' | 'buttonGroup'

export type SectionType =
  'hero' | 'about' | 'services' | 'cta' | 
  'testimonials' | 'features' | 'contact' | 'custom'

export interface HeadingElement {
  id: string
  type: 'heading'
  settings: {
    text: string
    tag: 'h1'|'h2'|'h3'|'h4'|'p'
    fontSize: number
    fontWeight: '400'|'500'|'600'|'700'|'800'
    fontFamily: string
    color: string
    align: 'left'|'center'|'right'
    marginBottom: number
  }
}

export interface TextElement {
  id: string
  type: 'text'
  settings: {
    text: string
    fontSize: number
    color: string
    align: 'left'|'center'|'right'
    marginBottom: number
    lineHeight: number
  }
}

export interface ButtonElement {
  id: string
  type: 'button'
  settings: {
    text: string
    url: string
    backgroundColor: string
    color: string
    borderRadius: number
    align: 'left'|'center'|'right'
    marginBottom: number
    variant: 'solid'|'outline'
    size: 'sm'|'md'|'lg'
  }
}

export interface ButtonGroupElement {
  id: string
  type: 'buttonGroup'
  settings: {
    align: 'left'|'center'|'right'
    gap: number
    marginBottom: number
    direction: 'row'|'column'
  }
  buttons: ButtonElement[]
}

export interface ImageElement {
  id: string
  type: 'image'
  settings: {
    url: string
    alt: string
    width: string
    borderRadius: number
    marginBottom: number
    objectFit: 'cover'|'contain'|'fill'
  }
}

export interface SpacerElement {
  id: string
  type: 'spacer'
  settings: {
    height: number
    backgroundColor: string
    width: string
  }
}

export interface DividerElement {
  id: string
  type: 'divider'
  settings: {
    style: 'line'|'wave'|'angle'
    color: string
    height: number
    marginBottom: number
  }
}

export interface IconElement {
  id: string
  type: 'icon'
  settings: {
    name: string
    size: number
    color: string
    align: 'left'|'center'|'right'
    marginBottom: number
  }
}

export type Element = 
  HeadingElement | TextElement | ButtonElement | 
  ButtonGroupElement | ImageElement | SpacerElement |
  DividerElement | IconElement

export interface Column {
  id: string
  width: number
  elements: Element[]
}

export interface Section {
  id: string
  type: SectionType
  settings: {
    background: string
    backgroundType: 'color'|'image'|'gradient'
    backgroundOverlay: string
    padding: {
      top: number
      bottom: number
    }
    fullHeight: boolean
    maxWidth: number
    contentAlign: 'left'|'center'|'right'
  }
  columns: Column[]
}

export interface PageData {
  title: string
  sections: Section[]
}

export type SelectionType = 'section' | 'element'

export interface Selection {
  type: SelectionType
  sectionId: string
  columnId?: string
  elementId?: string
}
