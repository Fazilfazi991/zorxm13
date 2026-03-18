export type SelectionType = 'section' | 'element'

export interface Selection {
  type: SelectionType
  sectionId: string
  columnId?: string
  elementId?: string
}

export interface PageData {
  title: string
  sections: Section[]
}

export interface Section {
  id: string
  type: string
  settings: SectionSettings
  columns: Column[]
}

export interface SectionSettings {
  background?: string
  backgroundType?: 'color' | 'image'
  backgroundOverlay?: string
  padding?: { top: number; bottom: number }
  fullHeight?: boolean
}

export interface Column {
  id: string
  width: number
  elements: Element[]
}

export interface Element {
  id: string
  type: 'heading' | 'text' | 'button' | 
        'image' | 'spacer'
  settings: ElementSettings
}

export interface ElementSettings {
  text?: string
  tag?: string
  fontSize?: number
  fontWeight?: string
  fontFamily?: string
  color?: string
  align?: string
  marginBottom?: number
  lineHeight?: number
  url?: string
  alt?: string
  backgroundColor?: string
  borderRadius?: number
  height?: number
  width?: string
}
