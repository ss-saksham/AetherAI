import { Sparkles, MessageSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/user.slice";

export default function Navbar() {
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.user);
  const { conversations, selectedConversation } = useSelector(state => state.conversation);
  const {messages} = useSelector(state => state.message);
  return (
    <div className="h-12 flex items-center justify-between px-6 border-b border-white/[0.04] bg-[#0a0a0b] z-10 select-none">

      {/* Left — chat title */}
      <div className="flex items-center gap-2">
        <h2 className="text-[12px] font-semibold text-[#f4f4f5] tracking-tight">
          {selectedConversation?.title || "Untitled Workspace"}
        </h2>
        <span className="text-[10px] font-mono text-[#71717a]">
          &middot; {messages.length} messages
        </span>
      </div>

      {/* Right — theme switcher */}
      <div className="flex items-center">
        <button
          onClick={() => dispatch(toggleTheme())}
          title={theme === "classic" ? "Switch to Glass layout" : "Switch to Minimal layout"}
          className="text-[10px] font-bold tracking-wider uppercase text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors duration-150 cursor-pointer bg-transparent border-none"
        >
          {theme === "classic" ? "Glass Mode" : "Minimal Mode"}
        </button>
      </div>

    </div>
  );
}