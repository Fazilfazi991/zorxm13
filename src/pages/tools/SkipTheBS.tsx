import React, { useState } from 'react';

export default function SkipTheBS() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!url.trim()) {
      setError('Paste a link first.');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setError('');

    try {
      // Calls the FastAPI backend running locally on port 8000
      const res = await fetch('http://localhost:8000/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ url: url.trim() })
      });

      const data = await res.json();
      
      if (data.url) {
        setResult({ url: data.url });
      } else {
        setError('Could not extract. Maybe host not supported yet or link broken.');
      }
    } catch (e) {
      setError('Error connecting to backend. Make sure main.py is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center pt-10 px-4">
      <div className="text-3xl font-black mb-2 bg-gradient-to-r from-[#00f5ff] to-[#ff00ff] text-transparent bg-clip-text">
        SkipTheBS
      </div>
      <div className="text-[#888] mb-10 text-base text-center max-w-lg">
        Paste any Dood / Streamtape / Filemoon / Vidhide / Streamwish / Vidoza / Mixdrop link → get direct .mp4 instantly.
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-8 w-full max-w-xl shadow-[0_0_40px_rgba(0,245,255,0.05)]">
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://dood.yt/d/xxxx or any supported link..." 
          className="w-full p-4 rounded-xl border border-[#333] bg-black text-white text-base mb-5 outline-none focus:border-[#00f5ff] transition-colors"
        />
        <button 
          onClick={handleExtract}
          disabled={loading}
          className="w-full p-4 rounded-xl border-none bg-gradient-to-r from-[#00f5ff] to-[#ff00ff] text-black font-black text-lg cursor-pointer hover:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? 'EXTRACTING...' : 'SKIP THE BS →'}
        </button>

        {error && (
          <div className="text-[#ff00ff] mt-5 text-base text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 border border-[#222] rounded-xl p-5 bg-[#0a0a0a] animate-[pop_0.3s_ease-out]">
            <div className="break-all text-[#00f5ff] text-base mb-4 font-mono">
              {result.url}
            </div>
            <a 
              href={result.url} 
              target="_blank" 
              rel="noreferrer"
              download
              className="inline-block bg-[#00f5ff] text-black px-6 py-3 rounded-lg no-underline font-black text-base transition-transform hover:scale-105"
            >
              Download File
            </a>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pop { 
            from { opacity: 0; transform: translateY(10px); } 
            to { opacity: 1; transform: translateY(0); } 
          }
        `}} />
      </div>
    </div>
  );
}
