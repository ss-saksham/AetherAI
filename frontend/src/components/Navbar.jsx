import { Sparkles, MessageSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/user.slice";

export default function Navbar() {
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.user);
  const { conversations, selectedConversation } = useSelector(state => state.conversation);
  const {messages} = useSelector(state => state.message);
  return (
    <div className="h-14 flex items-center justify-between px-5 border-b border-white/[0.04] bg-[#0c0d12]/60 backdrop-blur-lg z-10 select-none">

      {/* Left — chat title */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-[9px] bg-indigo-500/10 border border-indigo-500/20">
          <MessageSquare size={13} className="text-indigo-400" />
        </div>
        <h2 className="text-[13.5px] font-bold text-slate-100 tracking-tight">
          {selectedConversation?.title || "New Chat"}
        </h2>
        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
          {messages.length} Messages
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(toggleTheme())}
          title={theme === "classic" ? "Switch to Neo-Glass theme" : "Switch to Classic theme"}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/15 hover:shadow-[0_2px_12px_rgba(99,102,241,0.15)] text-[11px] font-bold text-indigo-450 cursor-pointer transition-all duration-300 select-none"
        >
          <Sparkles size={11} className={theme === "neo-glass" ? "animate-pulse text-indigo-300" : "text-indigo-400"} />
          {theme === "classic" ? "Preview New Design" : "Restore Classic Design"}
        </button>
      </div>

    </div>
  );
}