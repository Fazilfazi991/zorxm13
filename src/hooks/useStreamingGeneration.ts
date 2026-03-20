import { useState, useCallback } from 'react';

export interface StreamingSection {
  type: 'section' | 'complete' | 'error';
  data?: any;
  index?: number;
  message?: string;
}

export const useStreamingGeneration = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generatePage = useCallback(async (prompt: string, userId: string) => {
    setIsGenerating(true);
    setSections([]);
    setError(null);
    setProgress(0);

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Generation failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let sectionCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const message = JSON.parse(line);

            if (message.type === 'section') {
              setSections(prev => [...prev, message.data]);
              sectionCount++;
              setProgress(Math.round((sectionCount / 6) * 100)); // Assuming 6 sections
            } else if (message.type === 'complete') {
              setTotalSections(message.totalSections);
              setProgress(100);
              setIsGenerating(false);
            } else if (message.type === 'error') {
              throw new Error(message.message);
            }
          } catch (parseError) {
            console.error('Failed to parse NDJSON line:', line, parseError);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
    }
  }, []);

  return {
    sections,
    isGenerating,
    progress,
    totalSections,
    error,
    generatePage
  };
};
