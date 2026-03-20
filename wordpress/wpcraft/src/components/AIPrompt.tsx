import { useState, useEffect } from 'react'
import { PageData } from '../types/schema'
import { generateTemplate } from '../lib/api'
import { useStreamingGeneration } from '../hooks/useStreamingGeneration'

type AIMode = 'full-page' | 'add-section' | 'template'

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
  const { generate, loading } = useStreamingGeneration()
  const [error, setError] = useState('')
  const [mode, setMode] = 
    useState<AIMode>(
      hasExistingContent 
        ? 'add-section' 
        : 'full-page'
    )
  const [showConfirm, setShowConfirm] = 
    useState(false)

  const [loadingTextIdx, setLoadingTextIdx] = useState(0)
  const loadingTexts = [
    "Analyzing your business...",
    "Designing your layout...",
    "Writing your copy...",
    "Building your sections...",
    "Almost ready..."
  ]

  useEffect(() => {
    if (!loading) {
      setLoadingTextIdx(0)
      return
    }
    const interval = setInterval(() => {
      setLoadingTextIdx(prev => 
        prev < loadingTexts.length - 1 ? prev + 1 : prev
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [loading])

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

    setError('')
    setShowConfirm(false)

    try {
      const result = await generate(
        `${apiBase}generate`,
        {
          post_id: postId,
          prompt,
          nonce,
          generation_type: mode === 'add-section' ? 'section' : 'page',
          source: 'wpcraft-plugin'
        }
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

  const handleGenerateTemplate = async (template: 'saas' | 'agency' | 'portfolio') => {
    if (loading) return
    
    // Templates always replace content
    if (hasExistingContent && !showConfirm) {
      setShowConfirm(true)
      return
    }

    setLoading(true)
    setError('')
    setShowConfirm(false)

    try {
      const result = await generateTemplate(
        postId, template, nonce, apiBase
      )

      if (result.success && result.data) {
        onGenerate(result.data, 'replace')
      } else {
        setError(result.error || 'Failed to generate template')
      }
    } catch (e: any) {
      setError(e.message || 'Connection error.')
    } finally {
      setLoading(false)
    }
  }

  // BLANK PAGE — full overlay mode
  if (!hasExistingContent) {
    return (
      <div className="absolute inset-0 
        z-50 flex items-center 
        justify-center bg-[rgba(15,23,42,0.7)]">
        <div className="w-full max-w-lg 
          mx-4 bg-white rounded-[16px] 
          border border-[#E2E8F0] p-6">
          
          <div className="text-center mb-5">
            <div className="text-2xl mb-2 text-[#166534]">✦</div>
            <h2 className="text-[#1A1A1A] 
              font-semibold text-lg">
              Generate your page
            </h2>
            <p className="text-[#64748B] 
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
            className="w-full bg-[#F8F9FA] 
              border border-[#E2E8F0] 
              rounded-xl px-4 py-3 text-sm 
              text-[#1A1A1A] 
              placeholder-[#94A3B8] 
              resize-none focus:outline-none 
              focus:border-[#166534] mb-3"
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
                  rounded-full bg-[#F8F9FA] 
                  text-white/40 
                  border border-[#E2E8F0]
                  hover:bg-[#F1F5F9] 
                  hover:text-white/60 
                  transition-colors">
                {ex}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-3 px-3 py-2 
              bg-[#FEF2F2] 
              border border-[#FECACA] 
              rounded-lg text-xs text-[#DC2626]">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-3 rounded-xl 
              bg-[#166534]-white 
              font-semibold text-sm 
              hover:bg-[#145228] 
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
                {loadingTexts[loadingTextIdx]}
              </span>
            ) : 'Generate Full Page ✦'}
          </button>

          {!loading && (
            <p className="text-center text-xs 
              text-[#94A3B8] mt-2">
              Ctrl+Enter to generate
            </p>
          )}

          {loading && (
            <div className="w-full mt-6 space-y-3 max-h-[30vh] overflow-y-auto pr-2">
               <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                 {loadingTexts[loadingTextIdx]}
               </div>
               {Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 animate-pulse">
                   <div className="w-1/4 h-3 bg-slate-200 rounded mb-3" />
                   <div className="w-full h-2 bg-slate-200 rounded mb-1.5" />
                   <div className="w-5/6 h-2 bg-slate-200 rounded" />
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // PAGE WITH CONTENT — bottom slide-up panel
  return (
    <div className="absolute bottom-0 
      left-0 right-0 z-50
      bg-white border-t 
      border-[#E2E8F0]"
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
        border-b border-[#E2E8F0]">
        
        <div className="flex gap-1 
          bg-[#F8F9FA] rounded-lg p-0.5">
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
                ? 'bg-[#166534] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#1A1A1A] hover:bg-[#F8F9FA]'
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
              transition-colors border
              ${mode === 'full-page'
                ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                : 'border-transparent text-[#64748B] hover:text-[#1A1A1A]'
              }`}>
            ⚠ Regenerate
          </button>
          <button
            onClick={() => {
              setMode('template')
              setPrompt('')
              setError('')
              setShowConfirm(false)
            }}
            className={`px-3 py-1.5 text-xs 
              font-medium rounded-md 
              transition-colors border
              ${mode === 'template'
                ? 'bg-[#166534] text-white shadow-sm'
                : 'border-transparent text-[#64748B] hover:text-[#1A1A1A]'
              }`}>
            ☆ Templates
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-[#94A3B8] 
            hover:text-[#1A1A1A] 
            text-lg leading-none px-2">
          ×
        </button>
      </div>

      <div className="p-4">

        {/* Mode description */}
        <p className="text-xs text-[#94A3B8] 
          mb-3">
          {mode === 'add-section'
            ? 'Describe the section you want to add — it will be appended to the bottom of your page.'
            : mode === 'template'
            ? 'Pick a curated layout below. This will replace all existing content with a professional template.'
            : '⚠ This will replace ALL existing content on this page with a new AI-generated page.'
          }
        </p>

        {error && (
          <div className="mb-3 px-3 py-2 
            bg-[#FEF2F2] 
            border border-[#FECACA] 
            rounded-lg text-xs text-[#DC2626]">
            {error}
          </div>
        )}

        {/* Template Grid */}
        {mode === 'template' && !showConfirm && (
          <div className="grid grid-cols-3 gap-3 mb-2">
            <button
              onClick={() => handleGenerateTemplate('saas')}
              disabled={loading}
              className="group p-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl hover:border-[#166534] transition-all text-left flex flex-col gap-2 disabled:opacity-50"
            >
              <div className="text-xl group-hover:scale-110 transition-transform">🚀</div>
              <div>
                <div className="text-xs font-bold text-[#1A1A1A] mb-0.5">SaaS Landing</div>
                <div className="text-[10px] text-[#64748B] leading-tight">Hero, Features, Pricing, Testimonials</div>
              </div>
            </button>

            <button
              onClick={() => handleGenerateTemplate('agency')}
              disabled={loading}
              className="group p-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl hover:border-[#166534] transition-all text-left flex flex-col gap-2 disabled:opacity-50"
            >
              <div className="text-xl group-hover:scale-110 transition-transform">🏢</div>
              <div>
                <div className="text-xs font-bold text-[#1A1A1A] mb-0.5">Agency</div>
                <div className="text-[10px] text-[#64748B] leading-tight">Hero, About, Services, Contact</div>
              </div>
            </button>

            <button
              onClick={() => handleGenerateTemplate('portfolio')}
              disabled={loading}
              className="group p-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl hover:border-[#166534] transition-all text-left flex flex-col gap-2 disabled:opacity-50"
            >
              <div className="text-xl group-hover:scale-110 transition-transform">🎨</div>
              <div>
                <div className="text-xs font-bold text-[#1A1A1A] mb-0.5">Portfolio</div>
                <div className="text-[10px] text-[#64748B] leading-tight">Hero, Gallery, Bio, Contact</div>
              </div>
            </button>
          </div>
        )}

        {/* Example chips */}
        {mode !== 'template' && (
          <div className="flex flex-wrap gap-1.5 
            mb-3">
            {examples.slice(0, 4).map(ex => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-xs px-2.5 py-1 
                  rounded-full bg-[#F8F9FA] 
                  text-[#64748B] 
                  border border-[#E2E8F0]
                  hover:bg-[#F0FDF4] 
                  hover:text-[#166534] 
                  transition-colors">
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* Confirm warning */}
        {showConfirm && (
          <div className="mb-3 px-3 py-2.5 
            bg-[#FEF2F2] 
            border border-[#FECACA] 
            rounded-lg">
            <p className="text-xs 
              text-[#DC2626] mb-2 font-medium">
              ⚠ This will delete all existing 
              sections. Are you sure?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleGenerate()}
                className="flex-1 py-1.5 text-xs 
                  bg-[#DC2626] text-[#1A1A1A] 
                  rounded-md font-medium
                  hover:bg-red-700">
                Yes, regenerate
              </button>
              <button
                onClick={() => 
                  setShowConfirm(false)}
                className="flex-1 py-1.5 text-xs 
                  bg-[#F8F9FA] text-[#64748B] 
                  border border-[#E2E8F0]
                  rounded-md
                  hover:bg-[#E2E8F0] hover:text-[#1A1A1A]">
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3 px-3 py-2 
            bg-[#FEF2F2] 
            border border-[#FECACA] 
            rounded-lg text-xs text-[#DC2626]">
            {error}
          </div>
        )}

        {!showConfirm && mode !== 'template' && (
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
              className="flex-1 bg-[#F8F9FA] 
                border border-[#E2E8F0] 
                rounded-xl px-3 py-2.5 
                text-sm text-[#1A1A1A]
                placeholder-[#94A3B8]
                focus:outline-none
                focus:border-[#166534]"
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
                text-white-[#166534] hover:bg-[#145228]'
                }`}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 
                    border-2 border-white/30 
                    border-t-white rounded-full 
                    animate-spin inline-block">
                  </span>
                  <span>{loadingTexts[loadingTextIdx]}</span>
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
