import React from "react";
import { Share2, Bell, User } from "lucide-react";

interface HeaderProps {
  activeTab: "Research" | "Analytics" | "Workspace";
  setActiveTab: React.Dispatch<
    React.SetStateAction<"Research" | "Analytics" | "Workspace">
  >;
}

export default function Header({
  activeTab,
  setActiveTab,
}: HeaderProps) {
  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-[#222222]">
          {/* Navigation Tabs */}
          <nav className="flex gap-8">
            {(['Research', 'Analytics', 'Workspace'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-medium relative py-5 transition-colors ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E5FF] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 border border-[#333333] hover:border-slate-600 rounded-lg text-xs text-slate-300 font-medium transition-colors flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Share</span>
            </button>
            
            <button className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#1f1f1f] transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            <button className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#1f1f1f] transition-colors">
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>
  );
}