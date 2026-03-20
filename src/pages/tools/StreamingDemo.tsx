import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StreamingPreview } from '@/components/streaming/StreamingPreview';
import { useStreamingGeneration } from '@/hooks/useStreamingGeneration';

export default function StreamingDemo() {
  const { sections, isGenerating, progress, totalSections, error, generatePage } = useStreamingGeneration();
  const [prompt, setPrompt] = useState('Landing page for an SEO agency in Dubai');

  const handleGenerate = () => {
    generatePage(prompt, 'streaming-demo-user'); 
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">WPCraft Stream Preview</h1>
            <p className="text-slate-500 text-sm">Real-time asynchronous NDJSON section builder</p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-28 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-slate-900">Configure Page</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Describe the Landing Page
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 transition-colors"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-sm"
              >
                {isGenerating ? 'Generating blocks...' : 'Build Full Page ✦'}
              </Button>

              <div className="mt-8 pt-6 border-t border-slate-100 flex gap-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sections</p>
                  <p className="text-3xl font-black text-slate-800">
                    {sections.length}<span className="text-slate-300 text-lg">/{totalSections || 6}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Progress</p>
                  <p className="text-3xl font-black text-blue-600">{progress}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {sections.length === 0 && !isGenerating ? (
              <div className="bg-white rounded-lg border border-slate-200 p-16 text-center shadow-sm">
                <div className="text-6xl mb-6">⚡</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Live Page AI streaming</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Click generate to track NDJSON Serverless responses arriving on the fly skipping 90s lockups securely!
                </p>
              </div>
            ) : (
              <StreamingPreview
                sections={sections}
                isGenerating={isGenerating}
                progress={progress}
                totalSections={totalSections || 6}
                error={error}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
