interface Props {
  title: string
  saving: boolean
  hasData: boolean
  onSave: () => void
  onPublish: () => void
  onToggleAI: () => void
  onExit: () => void
}

export default function TopBar({
  title, saving, hasData,
  onSave, onPublish, onToggleAI, onExit
}: Props) {
  return (
    <div className="flex items-center 
      justify-between px-4 h-11
      bg-[#1a1a1a] border-b border-white/10 
      flex-shrink-0">
      
      {/* Left: Logo + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onExit}
          className="text-white/40 hover:text-white 
            transition-colors p-1"
          title="Exit to WordPress"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <span className="text-white/20">|</span>
        <span className="text-green-400 
          font-semibold text-sm">
          ✦ WPCraft
        </span>
        <span className="text-white/20">|</span>
        <span className="text-white/60 
          text-sm truncate max-w-xs">
          {title}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        
        {/* AI button - always visible */}
        <button
          onClick={onToggleAI}
          className="flex items-center gap-1.5 
            px-3 py-1.5 text-xs font-medium 
            rounded-lg bg-green-900/40 
            text-green-400 
            border border-green-800/60
            hover:bg-green-900/70 
            transition-colors">
          ✦ Generate with AI
        </button>

        {/* Save - only when has content */}
        {hasData && (
          <button
            onClick={onSave}
            disabled={saving}
            className="px-3 py-1.5 text-xs 
              font-medium rounded-lg
              bg-white/8 text-white/70
              border border-white/10
              hover:bg-white/15 
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
              bg-green-600 text-white
              hover:bg-green-500
              transition-colors
              disabled:opacity-40">
            Publish
          </button>
        )}

      </div>
    </div>
  )
}
