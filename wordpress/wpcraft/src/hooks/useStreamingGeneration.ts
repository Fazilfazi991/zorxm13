import { useState } from 'react';

interface StreamEvent {
  type: 'start' | 'skeleton' | 'section' | 'complete' | 'error' | 'cached';
  data?: any;
  index?: number;
  total?: number;
  timestamp?: number;
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        // Wait up to 180s for skeleton response
        signal: AbortSignal.timeout ? AbortSignal.timeout(180000) : undefined
      });
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError || new Error('Max retries exceeded');
}

export function useStreamingGeneration() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const generate = async (url: string, payload: any) => {
    setLoading(true);
    setError(null);
    setSections([]);
    setProgress(0);

    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': payload.nonce },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let totalSections = 0;
      let localSections: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const event: StreamEvent = JSON.parse(line);

            switch (event.type) {
              case 'skeleton':
                setProgress(5);
                break;
              case 'section':
                setSections(prev => [...prev, event.data]);
                localSections.push(event.data);
                totalSections = event.total || 0;
                setProgress(Math.round((event.index! / Math.max(totalSections, 1)) * 100));
                break;
              case 'complete':
              case 'cached':
                setProgress(100);
                break;
              case 'error':
                throw new Error(event.data?.message || 'Unknown error');
            }
          } catch (e) {
            console.error('Failed to parse event:', line, e);
          }
        }
      }

      setLoading(false);
      return { success: true, data: { type: 'wpcraft', sections: localSections } };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Generation failed:', message);
      setLoading(false);
      return { success: false, data: { message } };
    }
  };

  return { sections, loading, error, progress, generate };
}
