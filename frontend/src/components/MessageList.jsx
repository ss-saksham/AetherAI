import MessageBubble from "./MessageBubble";

import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Zap, Code2, MessageSquare, Globe, ArrowRight } from "lucide-react";
function GeneratingIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121214] border border-white/[0.04] rounded-md select-none w-fit ml-4 mt-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[#f4f4f5] animate-pulse" />
      <span className="text-[10px] font-mono tracking-wider text-[#a1a1aa] uppercase">thinking</span>
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
        <div className="max-w-xl mx-auto w-full py-16 px-4 flex flex-col items-start gap-8 select-none">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#71717a]">CortexAI Studio</span>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-2">
              Hello, {userData?.name ? userData.name.split(" ")[0] : "there"}.
            </h1>
            <p className="text-[12px] text-[#a1a1aa] leading-relaxed max-w-sm mt-1">
              Select a workflow context below or write in the prompt command workspace to begin.
            </p>
          </div>

          <div className="flex flex-col w-full border border-white/[0.04] rounded-xl bg-[#121214]/40 divide-y divide-white/[0.04] overflow-hidden">
            {[
              {
                title: "Premium Code Sandbox",
                desc: "Generate clean web interfaces with live layout feedback",
                prompt: "Create a modern dashboard card UI with glassmorphism effects",
                agent: "coding",
                tag: "coding"
              },
              {
                title: "Semantic Web Search",
                desc: "Research current events and cross-verify with search index tools",
                prompt: "What are the latest feature updates for Google Gemini 2.5?",
                agent: "search",
                tag: "search"
              },
              {
                title: "Technical Conversation",
                desc: "Discuss system designs, database schemas, or complex logic",
                prompt: "Explain how Redis caching works with standard examples",
                agent: "chat",
                tag: "chat"
              }
            ].map((workflow, i) => {
              return (
                <button
                  key={i}
                  onClick={() => {
                    setValue(workflow.prompt);
                    setSelectedAgent(workflow.agent);
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.015] transition-colors duration-150 cursor-pointer text-left focus:outline-none bg-transparent border-none"
                >
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[#71717a]">
                        {workflow.tag}
                      </span>
                      <h4 className="text-[12.5px] font-bold text-[#f4f4f5]">
                        {workflow.title}
                      </h4>
                    </div>
                    <p className="text-[11.5px] text-[#71717a] truncate mt-0.5">
                      {workflow.desc}
                    </p>
                  </div>
                  <ArrowRight size={13} className="text-[#71717a] shrink-0" />
                </button>
              );
            })}
          </div>
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