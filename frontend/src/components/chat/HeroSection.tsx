import React from "react";
import { Diamond } from "lucide-react";

export default function HeroSection() {
  return (
    <>
      {/* Diamond Central Icon Badge */}
      <div className="w-16 h-16 rounded-2xl bg-[#1e1b18] border border-bg-[#00E5FF]/20 flex items-center justify-center mb-6 shadow-xl shadow-bg-[#00E5FF]/5">
        <Diamond className="w-8 h-8 text-bg-[#00E5FF] stroke-[1.5]" />
      </div>

      {/* Heading Title */}
      <h1 className="text-4xl font-bold text-white tracking-tight mb-3 text-center">
        Aureum Search
      </h1>

      {/* Subtitle */}
      <p className="text-slate-400 text-sm text-center max-w-lg mb-10 leading-relaxed">
        Intelligent document synthesis and search. Access elite enterprise
        insights with zero friction.
      </p>
    </>
  );
}