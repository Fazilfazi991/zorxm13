import React, { useState, useRef } from 'react';

// API Configuration (Placeholders should be replaced with actual keys by the user)
const API_KEYS = {
  ANTHROPIC: "sk-ant-...",
  OPENAI: "sk-...",
  GEMINI: "AIza..."
};

export default function PromptAgent() {
  const [inputState, setInputState] = useState(true);
  const [runningState, setRunningState] = useState(false);
  const [completeState, setCompleteState] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [logs, setLogs] = useState<{ msg: string; color: string }[]>([]);
  const [progress, setProgress] = useState(0);
  const [brief, setBrief] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, color = 'text-zinc-400') => {
    setLogs(prev => [...prev, { msg, color }]);
    setTimeout(() => {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRunAgent = async () => {
    if (!prompt.trim()) return;

    abortControllerRef.current = new AbortController();
    setInputState(false);
    setRunningState(true);
    setCompleteState(false);
    setLogs([]);
    setProgress(0);

    try {
      // STAGE 1: CLASSIFY
      addLog('🔍 Classifying intent...', 'text-purple-400');
      setProgress(10);
      const classification = await callClaudeHaiku(`Classify this website project: "${prompt}"...`);
      addLog(`✅ Detected: ${classification.website_type} | ${classification.industry}`, 'text-cyan-400');
      setProgress(25);

      // STAGE 2: EXTRACT
      addLog('🔬 Extracting all details...', 'text-purple-400');
      setProgress(30);
      const extracted = await callGemini(`Website project: "${prompt}"...`);
      addLog(`✅ Extracted ${extracted.pages_needed?.length || 0} pages, ${extracted.key_features?.length || 0} features`, 'text-cyan-400');
      setProgress(50);

      // STAGE 3: ASSUMPTIONS
      addLog('🧠 Filling gaps with smart assumptions...', 'text-purple-400');
      setProgress(55);
      const assumptions = await callClaudeSonnet(`Website project: "${prompt}"...`);
      addLog(`✅ Made ${assumptions.assumptions_made?.length || 0} assumptions | Confidence: ${assumptions.overall_confidence}%`, 'text-cyan-400');
      setProgress(75);

      // STAGE 4: FINALIZE
      addLog('✨ Crafting perfect structured brief...', 'text-purple-400');
      setProgress(80);
      const finalBriefData = await callGPT4o(`Assemble the final perfect website brief for "${prompt}"...`);
      addLog('✅ Brief enhanced and finalized', 'text-cyan-400');
      setProgress(95);

      const finalBrief = {
        original_prompt: prompt,
        ...classification,
        ...extracted,
        ...assumptions,
        confidence_score: assumptions.overall_confidence
      };

      setTimeout(() => {
        setBrief(finalBrief);
        setRunningState(false);
        setCompleteState(true);
        setProgress(100);
        addLog('🎉 Prompt Agent complete!', 'text-green-400');
      }, 500);

    } catch (e: any) {
      if (e.name !== 'AbortError') {
        addLog(`❌ Error: ${e.message}`, 'text-red-400');
        console.error(e);
      }
    }
  };

  const reset = () => {
    abortControllerRef.current?.abort();
    setInputState(true);
    setRunningState(false);
    setCompleteState(false);
    setPrompt("");
    setLogs([]);
    setProgress(0);
    setBrief(null);
  };

  // LLM API Wrappers (Simplified for the demonstration)
  async function callClaudeHaiku(p: string) {
    // In a real implementation, these would handle actual fetch calls
    return { website_type: "saas-landing", industry: "AI Productivity", complexity: "medium" };
  }
  async function callGemini(p: string) {
    return { pages_needed: [{ name: "Home" }], key_features: [{ name: "AI Editor" }] };
  }
  async function callClaudeSonnet(p: string) {
    return { assumptions_made: [], overall_confidence: 85 };
  }
  async function callGPT4o(p: string) {
    return { status: "finalized" };
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-purple-500/30">
      <div className="max-w-3xl mx-auto p-6 py-24">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
          Prompt Agent
        </h1>
        <p className="text-zinc-400 mb-12 text-lg">Describe your website and watch the multi-LLM agent work in real time</p>

        {inputState && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. SaaS landing page for an AI productivity tool for startup founders, dark theme"
              className="w-full h-40 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-white placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all text-base"
            />

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-zinc-600 py-1 mr-2 uppercase tracking-widest font-bold">Suggestions</span>
              {["SaaS landing page for AI writing tool", "Restaurant website with reservations", "Portfolio for product designer"].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 rounded-full px-4 py-2 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunAgent}
              disabled={!prompt.trim()}
              className="group relative w-full overflow-hidden bg-white text-black font-black py-5 rounded-3xl transition-all hover:scale-[0.99] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 group-hover:text-white transition-colors">🧠 Run Prompt Agent</span>
            </button>
          </div>
        )}

        {runningState && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-zinc-500 uppercase font-black tracking-widest">Processing Intelligence</span>
                <span className="text-purple-400 font-black">{progress}%</span>
              </div>
              <div className="h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 font-mono text-xs space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className={`${log.color} animate-in slide-in-from-left-2 duration-300`}>
                  <span className="opacity-30 mr-2 opacity-50">{">"}</span> {log.msg}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        )}

        {completeState && (
          <div className="space-y-6 mt-6 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black">✅ Brief Finalized</h2>
              <button 
                onClick={reset}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-2xl text-sm font-bold transition-colors"
              >
                Create New Brief
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                <div className="text-xs text-zinc-500 uppercase font-black tracking-widest mb-4">Confidence Score</div>
                <div className="text-5xl font-black text-white mb-6 tracking-tighter">
                  {brief?.confidence_score || 85}<span className="text-zinc-700">%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${brief?.confidence_score || 85}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Type</span>
                  <span className="text-white font-bold">{brief?.website_type || 'SaaS'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Industry</span>
                  <span className="text-white font-bold">{brief?.industry || 'Technology'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Pages</span>
                  <span className="text-white font-bold">{brief?.pages_needed?.length || 1}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
              <details className="group">
                <summary className="cursor-pointer p-6 list-none flex justify-between items-center hover:bg-zinc-800/50 transition-colors">
                  <span className="font-bold tracking-widest uppercase text-xs">Full Structured JSON</span>
                  <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-6 pt-0">
                  <pre className="text-xs text-zinc-400 overflow-auto max-h-96 whitespace-pre-wrap font-mono p-4 bg-black/50 rounded-2xl border border-zinc-800">
                    {JSON.stringify(brief, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
      `}</style>
    </div>
  );
}
