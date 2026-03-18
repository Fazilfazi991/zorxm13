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
    } catch (e) {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 
      bg-[#1a1a1a] border-t border-white/10 pt-4 pb-4 px-6">
      
      <div className="max-w-4xl mx-auto relative">
        <button onClick={onClose}
          className="absolute -top-[10px] right-0 text-white/30 
            hover:text-white/60 text-xl leading-none">
          &times;
        </button>

        <div className="flex items-center gap-2 mb-3">
          {examples.map(ex => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-[11px] px-2.5 py-1 
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

        <div className="flex gap-3 items-stretch">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your page... e.g. Landing page for SEO agency in Dubai"
            className="flex-1 bg-white/5 
              border border-white/10 rounded-[10px] 
              px-4 py-2 text-sm text-white focus:outline-none 
              focus:border-green-600/50"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleGenerate()
              }
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="bg-[#166534] text-white px-6 py-2
              rounded-lg text-sm font-semibold hover:bg-green-600 
              transition-colors disabled:opacity-40 
              disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 
                  border-white/30 border-t-white rounded-full 
                  animate-spin" />
                Generating...
              </span>
            ) : 'Generate ✦'}
          </button>
        </div>
      </div>
    </div>
  )
}
