import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Search, Plus, Palette, CreditCard, LogOut, MessageSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toggleTheme, setUserData } from "../redux/user.slice";
import { setSelectedConversation } from "../redux/conversation.slice";
import { setMessages, setArtifacts } from "../redux/message.slice";
import { getMessages } from "../features/message.api";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  
  const dispatch = useDispatch();
  const { conversations } = useSelector((state) => state.conversation);
  const { theme } = useSelector((state) => state.user);

  // Toggle Command Palette visibility with Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset indices and focus when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(setUserData(null));
      setIsOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  // Define static quick actions
  const staticActions = [
    {
      id: "new-chat",
      title: "New Chat",
      subtitle: "Start a fresh creative session",
      icon: <Plus size={14} />,
      handler: () => {
        window.dispatchEvent(new Event("create-new-chat"));
        setIsOpen(false);
      }
    },
    {
      id: "toggle-theme",
      title: `Switch to ${theme === "classic" ? "Neo-Glass" : "Minimal"} Mode`,
      subtitle: "Switch between modern card and quiet editorial views",
      icon: <Palette size={14} />,
      handler: () => {
        dispatch(toggleTheme());
        setIsOpen(false);
      }
    },
    {
      id: "billing",
      title: "Billing & Plans",
      subtitle: "View credits balance and upgrade plan",
      icon: <CreditCard size={14} />,
      handler: () => {
        window.dispatchEvent(new Event("open-billing"));
        setIsOpen(false);
      }
    },
    {
      id: "logout",
      title: "Sign Out",
      subtitle: "Log out of Aether Studio",
      icon: <LogOut size={14} className="text-red-400" />,
      handler: handleLogout
    }
  ];

  // Filter conversations
  const filteredConversations = conversations.filter((c) =>
    (c.title || "Untitled Chat").toLowerCase().includes(search.toLowerCase())
  );

  // Combined searchable item stack
  const totalItems = [
    ...staticActions.filter(a => a.title.toLowerCase().includes(search.toLowerCase())),
    ...filteredConversations.map(c => ({
      id: `chat-${c._id}`,
      title: c.title || "Untitled Chat",
      subtitle: "Chat History Session",
      icon: <MessageSquare size={14} className="text-[#71717a]" />,
      handler: async () => {
        dispatch(setSelectedConversation(c));
        const msgs = await getMessages(c._id);
        dispatch(setMessages(msgs));
        dispatch(setArtifacts(msgs.artifacts));
        setIsOpen(false);
      }
    }))
  ];

  // Handle key navigation within combined items list
  const handleKeyDown = (e) => {
    if (!isOpen || totalItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % totalItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + totalItems.length) % totalItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      totalItems[activeIndex]?.handler();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            ref={containerRef}
            className="relative w-full max-w-xl mx-4 bg-[#0e0e11] border border-white/[0.06] rounded-xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.85)] flex flex-col max-h-[480px]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.04] shrink-0">
              <Search className="text-[#52525b]" size={16} />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands and conversations..."
                className="flex-1 bg-transparent text-sm text-[#f4f4f5] placeholder-[#52525b] border-none font-sans outline-none focus:outline-none"
              />
              <span className="text-[10px] font-mono text-[#52525b] bg-white/[0.02] border border-white/[0.04] px-1.5 py-0.5 rounded uppercase">ESC</span>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {totalItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#52525b] font-mono">
                  No matching actions or conversations found.
                </div>
              ) : (
                totalItems.map((item, index) => {
                  const isSelected = index === activeIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => item.handler()}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "bg-white/[0.03] text-white" : "text-[#a1a1aa]"
                      }`}
                    >
                      <div className={`flex items-center justify-center w-6 h-6 rounded-md border transition-colors ${
                        isSelected ? "bg-white/[0.04] border-white/[0.1] text-white" : "bg-white/[0.01] border-white/[0.03] text-[#71717a]"
                      }`}>
                        {item.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] font-medium transition-colors ${isSelected ? "text-white" : "text-[#e4e4e7]"}`}>
                          {item.title}
                        </p>
                        <p className="text-[10px] text-[#71717a] font-mono mt-0.5 truncate">
                          {item.subtitle}
                        </p>
                      </div>

                      {isSelected && (
                        <span className="text-[9px] font-mono text-[#71717a] pr-1 uppercase">Enter</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Monospace Footer */}
            <div className="h-9 px-4 border-t border-white/[0.04] flex items-center justify-between shrink-0 bg-white/[0.01] text-[9px] font-mono text-[#52525b]">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={9} />
                <span>Aether Command Palette</span>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
