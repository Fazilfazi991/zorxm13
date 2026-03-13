import { AlertCircle, AlertTriangle, Info, CheckCircle2, XOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

type SeverityType = "critical" | "error" | "warning" | "info" | "good";

interface SeverityBadgeProps {
  level: SeverityType;
  className?: string;
  showIcon?: boolean;
}

export function SeverityBadge({ level, className, showIcon = true }: SeverityBadgeProps) {
  const getStyles = () => {
    switch (level) {
      case "critical":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "error":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "info":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "good":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  const Icon = {
    critical: XOctagon,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    good: CheckCircle2,
  }[level];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider",
        getStyles(),
        className
      )}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {level}
    </span>
  );
}
