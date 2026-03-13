import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  grade?: string;
}

export function ScoreRing({ 
  score, 
  size = 120, 
  strokeWidth = 8, 
  className,
  grade
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColorClass = () => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 70) return "text-amber-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center flex-col", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="text-slate-800 transition-colors duration-300"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Foreground ring */}
          <circle
            className={cn("transition-all duration-1000 ease-out", getColorClass())}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        
        {/* Number in middle */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={cn("text-4xl font-bold tracking-tighter", getColorClass())}>
            {Math.round(animatedScore)}
          </span>
        </div>
      </div>
      
      {grade && (
        <span className={cn(
          "mt-3 text-sm font-medium uppercase tracking-widest", 
          getColorClass()
        )}>
          {grade}
        </span>
      )}
    </div>
  );
}
