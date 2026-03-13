import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: "icon" | "full";
}

export function CopyButton({ text, className, variant = "icon" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (variant === "full") {
    return (
      <Button
        variant="outline"
        className={cn(
          "bg-card/50 border-border/50 hover:bg-card hover:border-border transition-all",
          copied && "text-emerald-500 border-emerald-500/50 bg-emerald-500/10",
          className
        )}
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4 text-slate-400" />
            Copy
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors",
        copied && "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10",
        className
      )}
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
