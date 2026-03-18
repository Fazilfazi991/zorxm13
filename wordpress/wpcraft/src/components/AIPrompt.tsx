import { useState } from 'react'
import { PageData } from '../types/schema'
import { generatePage } from '../lib/api'

interface Props {
  postId: number
  nonce: string
  apiBase: string
  onGenerate: (data: PageData) => void
  onClose: () => void
}

export default function AIPrompt({
  postId, nonce, apiBase, 
  onGenerate, onClose
}: Props) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const examples = [
    'Landing page for an SEO agency in Dubai',
    'About page for a restaurant in Abu Dhabi',
    'Portfolio page for a freelance photographer',
    'Service page for a web development company',
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    try {
      const result = await generatePage(
        postId, prompt, nonce, apiBase
      )
      if (result.success && result.data) {
        onGenerate(result.data)
      } else {
        setError(result.message || 
          'Generation failed. Try again.')
      }
    } catch (e) {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 z-50 
      flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}>
      
      <div className="bg-[#1a1a1a] rounded-2xl 
        border border-white/10 p-6 w-full 
        max-w-lg mx-4">
        
        <div className="flex items-center 
          justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold 
              text-base">
              ✦ Generate with AI
            </h2>
            <p className="text-white/40 text-xs mt-0.5">
              Describe your page and AI will build it
            </p>
          </div>
          <button onClick={onClose}
            className="text-white/30 
              hover:text-white/60 text-xl">
            ×
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe your page... e.g. Landing page for a digital marketing agency in Dubai targeting restaurants and cafes"
          className="w-full bg-white/5 
            border border-white/10 rounded-xl 
            px-4 py-3 text-sm text-white/80 
            placeholder-white/20 resize-none 
            focus:outline-none 
            focus:border-green-600/50 mb-3"
          rows={4}
          onKeyDown={e => {
            if (e.key === 'Enter' && 
                (e.metaKey || e.ctrlKey)) {
              handleGenerate()
            }
          }}
        />

        <div className="flex flex-wrap gap-2 mb-4">
          {examples.map(ex => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-xs px-2.5 py-1 
                rounded-full bg-white/5 
                text-white/40 border border-white/10
                hover:bg-white/10 
                hover:text-white/60 
                transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 
            bg-red-900/30 border border-red-700/30 
            rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full py-3 rounded-xl 
            bg-green-700 text-white font-semibold 
            text-sm hover:bg-green-600 
            transition-colors
            disabled:opacity-40 
            disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center 
              justify-center gap-2">
              <span className="inline-block 
                w-3 h-3 border-2 
                border-white/30 border-t-white 
                rounded-full animate-spin">
              </span>
              Generating your page...
            </span>
          ) : (
            'Generate Page ✦'
          )}
        </button>

        <p className="text-center text-xs 
          text-white/20 mt-2">
          Ctrl+Enter to generate
        </p>
      </div>
    </div>
  )
}
