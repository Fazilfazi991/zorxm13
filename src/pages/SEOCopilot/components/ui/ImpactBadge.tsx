import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Activity } from "lucide-react";

interface ImpactBadgeProps {
  level: "high" | "medium" | "low";
  type?: "impact" | "effort";
  className?: string;
}

export function ImpactBadge({ level, type = "impact", className }: ImpactBadgeProps) {
  const getStyles = () => {
    if (type === "effort") {
      switch (level) {
        case "high":
          return "bg-slate-800 text-slate-300 border-slate-700";
        case "medium":
          return "bg-slate-800 text-slate-300 border-slate-700";
        case "low":
          return "bg-slate-800 text-slate-300 border-slate-700";
      }
    } else {
      switch (level) {
        case "high":
          return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
        case "medium":
          return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        case "low":
          return "bg-slate-800 text-slate-400 border-slate-700";
      }
    }
  };

  const getIcon = () => {
    if (type === "effort") {
      if (level === "low") return <ArrowDown className="mr-1 h-3 w-3" />;
      if (level === "high") return <ArrowUp className="mr-1 h-3 w-3" />;
      return <Activity className="mr-1 h-3 w-3" />;
    }
    
    // Impact doesn't need icons per design, but could add them
    return null;
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider",
        getStyles(),
        className
      )}
    >
      {getIcon()}
      {type}: {level}
    </span>
  );
}
