import MessageBubble from "./MessageBubble";

import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Zap, Code2, MessageSquare, Globe, ArrowRight } from "lucide-react";
function NeuralPulse() {
  return (
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      {[0, 0.45, 0.9].map((delay, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-cyan-400/30"
          initial={{ scale: 0.3, opacity: 0.55 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.span
        className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400"
        style={{ boxShadow: "0 0 14px rgba(125,211,252,0.55)" }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

const THINKING_LABELS = ["Thinking", "Analyzing", "Reasoning", "Generating"];

function GeneratingIndicator() {
  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % THINKING_LABELS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const label = THINKING_LABELS[labelIndex];

  return (
    <div className="flex items-center gap-3 max-w-[72%] py-1">
      <NeuralPulse />
      <div className="flex overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={label}
            className="flex"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {label.split("").map((ch, i) => (
              <motion.span
                key={i}
                className="text-[13px] font-medium tracking-wide text-slate-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.07,
                }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function MessageList({ setValue, setSelectedAgent }) {

  const bottomRef = useRef(null);
  const { messages, isLoading } = useSelector(state => state.message);
  const { userData } = useSelector(state => state.user);
  const { selectedConversation } = useSelector(state => state.conversation);
  const dispatch = useDispatch();
useEffect(() => {

  requestAnimationFrame(() => {

    bottomRef.current?.scrollIntoView({

      behavior: "smooth",

      block: "end"

    });

  });

}, [messages.length, isLoading]);
  useEffect(() => {
    if (!selectedConversation || selectedConversation.title === "New Chat") return;
    const get = async () => {
      const data = await getMessages(selectedConversation._id);
      dispatch(setMessages(data));
      const latestArtifactMessage =
  [...data]
    .reverse()
    .find(
      msg =>
        msg.artifacts &&
        msg.artifacts.length > 0
    );

if (latestArtifactMessage) {

  dispatch(
    setArtifacts(
      latestArtifactMessage.artifacts
    )
  );

}
    };
    get();
  }, [selectedConversation?._id]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {messages.length === 0 && !isLoading ? (
        <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-4">
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20 flex items-center justify-center mb-2">
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-[10px] animate-pulse" />
              <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <path d="M32 3L57 17.5V46.5L32 61L7 46.5V17.5L32 3Z" stroke="url(#hexGradient)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.35" />
                <path d="M32 3L57 17.5V46.5L32 61" stroke="url(#hexGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 22C22 16.48 26.48 12 32 12C37.52 12 42 16.48 42 22C42 27.52 37.52 32 32 32" stroke="url(#coreGradient)" strokeWidth="3" strokeLinecap="round" />
                <path d="M42 42C42 47.52 37.52 52 32 52C26.48 52 22 47.52 22 42C22 36.48 26.48 32 32 32" stroke="url(#coreGradient)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="32" cy="32" r="5" fill="url(#coreInner)" />
                <circle cx="22" cy="22" r="3" fill="#22D3EE" />
                <circle cx="42" cy="42" r="3" fill="#C084FC" />
                <defs>
                  <linearGradient id="hexGradient" x1="7" y1="3" x2="57" y2="61" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818CF8" />
                    <stop offset="0.5" stopColor="#C084FC" />
                    <stop offset="1" stopColor="#22D3EE" />
                  </linearGradient>
                  <linearGradient id="coreGradient" x1="22" y1="12" x2="42" y2="52" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818CF8" />
                    <stop offset="0.5" stopColor="#C084FC" />
                    <stop offset="1" stopColor="#818CF8" />
                  </linearGradient>
                  <linearGradient id="coreInner" x1="27" y1="27" x2="37" y2="37" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22D3EE" />
                    <stop offset="1" stopColor="#818CF8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="bg-gradient-to-r from-indigo-200 via-violet-200 to-cyan-200 bg-clip-text text-transparent text-3xl font-bold tracking-tight">
              Hello, {userData?.name ? userData.name.split(" ")[0] : "there"}
            </h1>
            <p className="text-[13.5px] text-slate-400 max-w-[340px] leading-relaxed mt-2">
              Welcome back to your multi-agent creative studio. What shall we co-create today?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 max-w-2xl w-full mt-8 text-left">
            {[
              {
                title: "Code Generation",
                desc: "Write premium HTML, CSS, and JS components with real-time preview",
                prompt: "Create a modern dashboard card UI with glassmorphism effects",
                agent: "coding",
                icon: Code2,
                color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
              },
              {
                title: "Web Search",
                desc: "Fetch real-time updates and search the web using Tavily Search",
                prompt: "What are the latest feature updates for Google Gemini 2.5?",
                agent: "search",
                icon: Globe,
                color: "text-violet-400 bg-violet-500/10 border-violet-500/20"
              },
              {
                title: "Agent Chats",
                desc: "Have natural discussions and explain algorithms step-by-step",
                prompt: "Explain how Redis caching works with standard examples",
                agent: "chat",
                icon: MessageSquare,
                color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
              }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setValue(card.prompt);
                    setSelectedAgent(card.agent);
                  }}
                  className="group flex flex-col justify-between items-start gap-4 p-5 rounded-[22px] bg-[#0c0d12]/40 backdrop-blur-md border border-white/[0.05] hover:border-indigo-500/30 hover:bg-[#11131c]/60 shadow-lg hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-left focus:outline-none"
                >
                  <div className="flex flex-col gap-3 w-full">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.color}`}>
                      <Icon size={15} />
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-semibold text-slate-200 tracking-tight">
                        {card.title}
                      </h4>
                      <p className="text-[11.5px] text-slate-500 leading-relaxed mt-1">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors mt-2">
                    Try prompt
                    <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              ref={index === messages.length - 1 ? bottomRef : null}
            >
              <MessageBubble role={msg.role} content={msg.content} images={msg.images} />
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <GeneratingIndicator />
            </motion.div>
          )}
        
        </div>
      )}
        <div ref={bottomRef} />
    </div>
  );
}