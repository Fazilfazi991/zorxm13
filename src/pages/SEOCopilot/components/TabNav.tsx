import { cn } from "@/lib/utils";
import { Search, PenTool, LayoutTemplate } from "lucide-react";

export type TabId = "rules" | "titles" | "briefs";

interface TabNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function TabNav({ activeTab, onChange }: TabNavProps) {
  const tabs = [
    { id: "rules" as TabId, label: "SEO Rules Checker", icon: Search },
    { id: "titles" as TabId, label: "Title Generator", icon: PenTool },
    { id: "briefs" as TabId, label: "Content Brief Builder", icon: LayoutTemplate },
  ];

  return (
    <div className="w-full sticky top-0 z-50 bg-[#080B14]/80 backdrop-blur-xl border-b border-white/5 mb-8 pt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory relative hide-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex items-center justify-center gap-2.5 px-6 py-4 text-[15px] transition-all duration-300 whitespace-nowrap snap-start font-dm",
                isActive 
                  ? "text-white font-semibold" 
                  : "text-zinc-500 hover:text-zinc-300 font-medium"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-indigo-400" : "opacity-70")} />
              {tab.label}
              
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
