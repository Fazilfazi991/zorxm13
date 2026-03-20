import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface StreamingPreviewProps {
  sections: any[];
  isGenerating: boolean;
  progress: number;
  totalSections: number;
  error?: string | null;
}

const SectionSkeleton = () => (
  <div className="w-full h-64 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse rounded-lg" />
);

const SectionRenderer = ({ section, index }: { section: any; index: number }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div
      key={section.id}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full mb-8 relative border-b pb-8"
    >
      <div className="absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
        {index + 1}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{section.type || 'Section'}</span>
            <span className="text-xs text-slate-400">ID: {section.id}</span>
        </div>
        <div className="p-8">
            {section.elements ? (
               <pre className="text-xs text-slate-600 overflow-x-auto p-4 bg-slate-50 rounded">
                 {JSON.stringify(section, null, 2)}
               </pre>
            ) : (
                <div className="text-slate-400 text-sm whitespace-pre-wrap">Content generated...</div>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export const StreamingPreview = ({
  sections,
  isGenerating,
  progress,
  totalSections,
  error
}: StreamingPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && sections.length > 0) {
      const lastSection = containerRef.current.lastElementChild;
      if (lastSection) {
        lastSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [sections]);

  return (
    <div className="w-full max-w-4xl mx-auto pl-8">
      {isGenerating && (
        <div className="mb-8 sticky top-0 z-10 bg-white/95 backdrop-blur-sm p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="font-semibold text-slate-900">
                Generating Section {Math.min(sections.length + 1, totalSections || 6)} of {totalSections || 6}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-600">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p className="font-semibold">Generation Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div ref={containerRef} className="space-y-6">
        {sections.map((section, index) => (
          <SectionRenderer key={section.id || index} section={section} index={index} />
        ))}

        {isGenerating && sections.length < (totalSections || 6) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="w-full relative">
            <div className="absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300">
              <Loader2 className="h-3 w-3 animate-spin text-white" />
            </div>
            <SectionSkeleton />
          </motion.div>
        )}

        {!isGenerating && sections.length > 0 && !error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 bg-green-50 border border-green-200 rounded-lg text-center mt-8">
            <p className="text-green-800 font-semibold">✓ Page Generated Successfully!</p>
            <p className="text-sm text-green-700 mt-1">
              {sections.length} sections ready to customize and publish
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
