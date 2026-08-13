export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl px-5 py-4">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-[#00B4D8] animate-bounce [animation-delay:0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-[#0077B6] animate-bounce [animation-delay:0.3s]"></div>
        </div>
      </div>
    </div>
  );
}