import { useState } from 'react'
import { PageData } from '../types/schema'
import { generatePage } from '../lib/api'

type AIMode = 'full-page' | 'add-section'

interface Props {
  postId: number
  nonce: string
  apiBase: string
  hasExistingContent: boolean
  onGenerate: (
    data: PageData, 
    mode: 'replace' | 'append'
  ) => void
  onClose: () => void
}

export default function AIPrompt({
  postId, nonce, apiBase,
  hasExistingContent,
  onGenerate, onClose
}: Props) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = 
    useState<AIMode>(
      hasExistingContent 
        ? 'add-section' 
        : 'full-page'
    )
  const [showConfirm, setShowConfirm] = 
    useState(false)

  const fullPageExamples = [
    'Landing page for an SEO agency in Dubai',
    'About page for a restaurant in Abu Dhabi',
    'Portfolio page for a photographer',
    'Service page for a web dev company',
  ]

  const sectionExamples = [
    'Add a testimonials section with 3 reviews',
    'Add a pricing table with 3 tiers',
    'Add a team section with 4 members',
    'Add a FAQ section with 5 questions',
    'Add a contact form section',
    'Add a features grid with 6 items',
  ]

  const examples = mode === 'full-page' 
    ? fullPageExamples 
    : sectionExamples

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    // If replacing existing content, 
    // show confirm first
    if (mode === 'full-page' && 
        hasExistingContent && 
        !showConfirm) {
      setShowConfirm(true)
      return
    }

    setLoading(true)
    setError('')
    setShowConfirm(false)

    try {
      const result = await generatePage(
        postId, prompt, nonce, apiBase,
        mode === 'add-section' 
          ? 'section' 
          : 'page'
      )

      if (result.success && result.data) {
        onGenerate(
          result.data,
          mode === 'full-page' 
            ? 'replace' 
            : 'append'
        )
      } else if (result.data?.status === 402) {
        setError(
          'No credits remaining. ' +
          'Upgrade at zorxm13.vercel.app/pricing'
        )
      } else {
        setError(
          result.message || 
          result.data?.message ||
          'Generation failed. Try again.'
        )
      }
    } catch (e: any) {
      setError(
        e.message || 'Connection error.'
      )
    } finally {
      setLoading(false)
    }
  }

  // BLANK PAGE — full overlay mode
  if (!hasExistingContent) {
    return (
      <div className="absolute inset-0 
        z-50 flex items-center 
        justify-center bg-black/90">
        <div className="w-full max-w-lg 
          mx-4 bg-[#1a1a1a] rounded-2xl 
          border border-white/10 p-6">
          
          <div className="text-center mb-5">
            <div className="text-2xl mb-2">✦</div>
            <h2 className="text-white 
              font-semibold text-lg">
              Generate your page
            </h2>
            <p className="text-white/40 
              text-xs mt-1">
              Describe your business and 
              AI will build the full page
            </p>
          </div>

          <textarea
            value={prompt}
            onChange={e => 
              setPrompt(e.target.value)}
            placeholder="e.g. Landing page for a digital marketing agency in Dubai targeting restaurants and cafes. Professional tone, green color scheme."
            className="w-full bg-white/5 
              border border-white/10 
              rounded-xl px-4 py-3 text-sm 
              text-white/80 
              placeholder-white/20 
              resize-none focus:outline-none 
              focus:border-green-600/50 mb-3"
            rows={3}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter' && 
                  (e.metaKey || e.ctrlKey)) {
                handleGenerate()
              }
            }}
          />

          <div className="flex flex-wrap 
            gap-1.5 mb-4">
            {fullPageExamples.map(ex => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-xs px-2.5 py-1 
                  rounded-full bg-white/5 
                  text-white/40 
                  border border-white/10
                  hover:bg-white/10 
                  hover:text-white/60 
                  transition-colors">
                {ex}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-3 px-3 py-2 
              bg-red-900/30 
              border border-red-700/30 
              rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-3 rounded-xl 
              bg-green-700 text-white 
              font-semibold text-sm 
              hover:bg-green-600 
              transition-colors
              disabled:opacity-40 
              disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center 
                justify-center gap-2">
                <span className="w-3 h-3 
                  border-2 border-white/30 
                  border-t-white rounded-full 
                  animate-spin inline-block">
                </span>
                Generating your page...
              </span>
            ) : 'Generate Full Page ✦'}
          </button>

          <p className="text-center text-xs 
            text-white/20 mt-2">
            Ctrl+Enter to generate
          </p>
        </div>
      </div>
    )
  }

  // PAGE WITH CONTENT — bottom slide-up panel
  return (
    <div className="absolute bottom-0 
      left-0 right-0 z-50
      bg-[#1a1a1a] border-t 
      border-white/10"
      style={{
        animation: 'slideUp 0.25s ease'
      }}>
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* Mode tabs */}
      <div className="flex items-center 
        justify-between px-4 pt-3 pb-2 
        border-b border-white/10">
        
        <div className="flex gap-1 
          bg-white/5 rounded-lg p-0.5">
          <button
            onClick={() => {
              setMode('add-section')
              setPrompt('')
              setError('')
              setShowConfirm(false)
            }}
            className={`px-3 py-1.5 text-xs 
              font-medium rounded-md 
              transition-colors
              ${mode === 'add-section'
                ? 'bg-green-700 text-white'
                : 'text-white/40 hover:text-white/60'
              }`}>
            ✦ Add section
          </button>
          <button
            onClick={() => {
              setMode('full-page')
              setPrompt('')
              setError('')
              setShowConfirm(false)
            }}
            className={`px-3 py-1.5 text-xs 
              font-medium rounded-md 
              transition-colors
              ${mode === 'full-page'
                ? 'bg-red-800 text-red-200'
                : 'text-white/40 hover:text-white/60'
              }`}>
            ⚠ Regenerate page
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-white/30 
            hover:text-white/60 
            text-lg leading-none px-2">
          ×
        </button>
      </div>

      <div className="p-4">

        {/* Mode description */}
        <p className="text-xs text-white/30 
          mb-3">
          {mode === 'add-section'
            ? 'Describe the section you want to add — it will be appended to the bottom of your page.'
            : '⚠ This will replace ALL existing content on this page with a new AI-generated page.'
          }
        </p>

        {/* Example chips */}
        <div className="flex flex-wrap gap-1.5 
          mb-3">
          {examples.slice(0, 4).map(ex => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-xs px-2.5 py-1 
                rounded-full bg-white/5 
                text-white/40 
                border border-white/10
                hover:bg-white/10 
                hover:text-white/60 
                transition-colors">
              {ex}
            </button>
          ))}
        </div>

        {/* Confirm warning */}
        {showConfirm && (
          <div className="mb-3 px-3 py-2.5 
            bg-red-900/30 
            border border-red-700/40 
            rounded-lg">
            <p className="text-xs 
              text-red-300 mb-2 font-medium">
              ⚠ This will delete all existing 
              sections. Are you sure?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleGenerate()}
                className="flex-1 py-1.5 text-xs 
                  bg-red-700 text-white 
                  rounded-md font-medium
                  hover:bg-red-600">
                Yes, regenerate
              </button>
              <button
                onClick={() => 
                  setShowConfirm(false)}
                className="flex-1 py-1.5 text-xs 
                  bg-white/10 text-white/60 
                  rounded-md
                  hover:bg-white/15">
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3 px-3 py-2 
            bg-red-900/30 
            border border-red-700/30 
            rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Input + button row */}
        {!showConfirm && (
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={e => 
                setPrompt(e.target.value)}
              placeholder={
                mode === 'add-section'
                  ? 'Add a testimonials section with 3 reviews...'
                  : 'Landing page for my business...'
              }
              className="flex-1 bg-white/5 
                border border-white/10 
                rounded-xl px-3 py-2.5 
                text-sm text-white/80
                placeholder-white/20
                focus:outline-none
                focus:border-green-600/50"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleGenerate()
                }
                if (e.key === 'Escape') {
                  onClose()
                }
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={
                loading || !prompt.trim()
              }
              className={`px-4 py-2 rounded-xl 
                text-sm font-semibold 
                text-white transition-colors
                disabled:opacity-40
                disabled:cursor-not-allowed
                ${mode === 'full-page'
                  ? 'bg-red-700 hover:bg-red-600'
                  : 'bg-green-700 hover:bg-green-600'
                }`}>
              {loading ? (
                <span className="w-4 h-4 
                  border-2 border-white/30 
                  border-t-white rounded-full 
                  animate-spin inline-block">
                </span>
              ) : mode === 'full-page' 
                ? 'Regenerate' 
                : 'Add ✦'
              }
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
