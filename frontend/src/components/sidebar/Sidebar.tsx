import React from "react";
import {
  Sparkles,
  Plus,
  MessageSquare,
  FileText,
  Settings,
  HelpCircle,
} from "lucide-react";
export default function Sidebar() {
  return (
    <>
      {
        <aside className="w-64 bg-[#181818] border-r border-[#262626] flex flex-col justify-between h-full">
        <div className="p-4 space-y-6 overflow-y-auto">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 px-2 py-1">
            <Sparkles className="w-5 h-5 text-[#00E5FF] fill-[#00E5FF]/20" />
            <span className="font-semibold text-white text-lg tracking-tight">Aureum Search</span>
          </div>

          {/* New Chat Button */}
          <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-transparent border border-[#00E5FF]/40 hover:border-[#00E5FF] rounded-lg text-[#00E5FF] font-medium text-xs tracking-wide transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Recent Chats Section */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-2">Recent</p>
            
            <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#222222] transition-colors truncate text-left">
              <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">Q3 Financial Analysis</span>
            </button>

            <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#222222] transition-colors truncate text-left">
              <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">Contract Review - Tesla</span>
            </button>
          </div>

          {/* Documents Section */}
          <div className="space-y-1 pt-2">
            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-2">Documents</p>
            
            {/* Selected Active Doc */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#242424] text-xs">
              <FileText className="w-4 h-4 text-[#00E5FF] shrink-0" />
              <div className="truncate">
                <p className="font-medium text-slate-200 truncate">Annual_Report.pdf</p>
                <p className="text-[10px] text-slate-500">12 pages</p>
              </div>
            </div>

            {/* Processing Doc */}
            <div className="flex flex-col gap-1.5 p-2.5 rounded-lg text-xs text-slate-400 hover:bg-[#222222] transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate text-slate-300">Tech_Specs.v2.pdf</span>
              </div>
              <div className="flex items-center gap-2 pl-7">
                <div className="h-0.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00E5FF]/80 w-2/3 animate-pulse"></div>
                </div>
                <span className="text-[10px] text-[#00E5FF]/90 font-medium">Processing...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#262626] space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#222222] transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#222222] transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span>Support</span>
          </button>

          {/* User Profile Card */}
          <div className="pt-2">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#202020] border border-[#2a2a2a]">
              <div className="w-8 h-8 rounded-full bg-[#00E5FF]c/20 text-white flex items-center justify-center font-bold text-xs">
                JD
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">John Doe</p>
                <p className="text-[10px] text-slate-500 truncate">Enterprise Pro</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      }
    </>
  );
}