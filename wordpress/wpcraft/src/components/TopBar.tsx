interface Props {
  title: string
  saving: boolean
  hasData: boolean
  onSave: () => void
  onPublish: () => void
  onToggleAI: () => void
}

export default function TopBar({
  title, saving, hasData,
  onSave, onPublish, onToggleAI
}: Props) {
  return (
    <div className="flex items-center 
      justify-between px-4 h-12 
      bg-[#1a1a1a] border-b border-white/10 
      flex-shrink-0">
      
      <div className="flex items-center gap-3">
        <span className="text-green-400 
          font-bold text-sm">✦ WPCraft</span>
        <span className="text-white/30">|</span>
        <span className="text-white/70 
          text-sm truncate max-w-48">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAI}
          className="px-3 py-1.5 text-xs 
            font-medium rounded-md
            bg-green-900/50 text-green-400 
            border border-green-700/50
            hover:bg-green-900 transition-colors"
        >
          ✦ AI Generate
        </button>

        {hasData && (
          <>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-3 py-1.5 text-xs 
                font-medium rounded-md
                bg-white/10 text-white/80
                hover:bg-white/20 
                transition-colors
                disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={onPublish}
              disabled={saving}
              className="px-3 py-1.5 text-xs 
                font-medium rounded-md
                bg-green-600 text-white
                hover:bg-green-500
                transition-colors
                disabled:opacity-50"
            >
              Publish →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
