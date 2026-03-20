interface Props {
  title: string
  saving: boolean
  hasData: boolean
  canUndo: boolean
  onUndo: () => void
  onSave: () => void
  onPublish: () => void
  onToggleAI: () => void
  onExit: () => void
  viewMode?: 'desktop' | 'mobile'
  onViewModeChange?: (mode: 'desktop' | 'mobile') => void
}

export default function TopBar({
  title, saving, hasData, canUndo,
  onUndo, onSave, onPublish, onToggleAI, onExit, viewMode, onViewModeChange
}: Props) {
  return (
    <div className="flex items-center 
      justify-between px-4 h-11
      bg-white border-b border-[#E2E8F0] 
      flex-shrink-0">
      
      {/* Left: Logo + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onExit}
          className="text-[#94A3B8] hover:text-[#1A1A1A] 
            transition-colors p-1"
          title="Exit to WordPress"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <span className="text-[#E2E8F0]">|</span>
        <span className="text-[#166534] 
          font-bold text-sm">
          ✦ WPCraft
        </span>
        <span className="text-[#E2E8F0]">|</span>
        <span className="text-[#1A1A1A] 
          text-sm truncate max-w-xs">
          {title}
        </span>
      </div>

      {/* Center: Viewport Toggle */}
      {onViewModeChange && (
        <div className="flex bg-[#F1F5F9] rounded-lg p-0.5 mx-auto absolute left-1/2 -translate-x-1/2">
          <button 
            onClick={() => onViewModeChange('desktop')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow-sm font-medium text-[#1A1A1A]' : 'text-[#64748B] hover:text-[#1A1A1A]'}`}>
            Desktop
          </button>
          <button 
            onClick={() => onViewModeChange('mobile')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm font-medium text-[#1A1A1A]' : 'text-[#64748B] hover:text-[#1A1A1A]'}`}>
            Mobile
          </button>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        
        {/* AI button - always visible */}
        <button
          onClick={onToggleAI}
          className="flex items-center gap-1.5 
            px-3 py-1.5 text-xs font-medium 
            rounded-lg bg-[#F0FDF4] 
            text-[#166534] 
            border border-[#BBF7D0]
            hover:bg-[#DCFCE7] 
            transition-colors">
          ✦ Generate with AI
        </button>

        {/* Undo AI Change */}
        {canUndo && (
          <button
            onClick={onUndo}
            className="flex items-center gap-1.5 
              px-3 py-1.5 text-xs font-medium 
              rounded-lg bg-[#FEF2F2] 
              text-[#DC2626] 
              border border-[#FECACA]
              hover:bg-[#FEE2E2] 
              transition-colors"
            title="Undo last AI change (Ctrl+Z)"
          >
            ↩ Undo last AI change
          </button>
        )}

        {/* Save - only when has content */}
        {hasData && (
          <button
            onClick={onSave}
            disabled={saving}
            className="px-3 py-1.5 text-xs 
              font-medium rounded-lg
              bg-white text-[#64748B]
              border border-[#E2E8F0]
              hover:bg-[#F8F9FA] 
              transition-colors
              disabled:opacity-40">
            {saving ? 'Saving...' : 'Save draft'}
          </button>
        )}

        {/* Publish */}
        {hasData && (
          <button
            onClick={onPublish}
            disabled={saving}
            className="px-3 py-1.5 text-xs 
              font-medium rounded-lg
              bg-[#166534] text-white
              hover:bg-[#145228]
              transition-colors
              disabled:opacity-40">
            Publish
          </button>
        )}

      </div>
    </div>
  )
}
