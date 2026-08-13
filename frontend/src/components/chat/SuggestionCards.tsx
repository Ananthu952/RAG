import React from "react";

interface Suggestion {
  icon: React.ElementType;
  title: string;
}

interface SuggestionCardsProps {
  suggestions: Suggestion[];
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
}

export default function SuggestionCards({
  suggestions,
  setPrompt,
}: SuggestionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12">
      {suggestions.map((card, idx) => {
        const Icon = card.icon;

        return (
          <button
            key={idx}
            onClick={() => setPrompt(card.title)}
            className="bg-[#181818] hover:bg-[#202020] border border-[#262626] hover:border-slate-700 p-4 rounded-xl text-left flex flex-col justify-between h-28 transition-all group"
          >
            <Icon className="w-4 h-4 text-text-bg-[#00E5FF]" />

            <p className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors leading-normal">
              {card.title}
            </p>
          </button>
        );
      })}
    </div>
  );
}