export function toElementorClipboard(data: any): string {
  const exportData = {
    type: "elementor",
    elements: data.content || data.elements || []
  }
  return JSON.stringify(exportData)
}

export function downloadElementorJSON(
  data: any, 
  businessName: string,
  pageType: string
): void {
  const exportData = {
    version: "0.4",
    title: data.title || businessName,
    content: data.content || []
  }
  const blob = new Blob(
    [JSON.stringify(exportData, null, 2)], 
    { type: 'application/json' }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `elementor-${pageType}-${businessName
    .toLowerCase()
    .replace(/\s+/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
}
