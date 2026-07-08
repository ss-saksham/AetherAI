import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Square, Zap, MessageSquare, Code2, Presentation, Image as ImageIcon, Globe, FileText, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setArtifacts, setIsLoading } from "../redux/message.slice";
import { sendPrompt } from "../features/agent.api";
import { Mic, MicOff } from "lucide-react";
import { createConversation, updateConversations } from "../features/conversation.api";
import { addConversation, setConvTitle, setSelectedConversation } from "../redux/conversation.slice";
import { setUserData } from "../redux/user.slice";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInput({
  value,
  setValue,
  selectedAgent,
  setSelectedAgent,
  setBanner
}) {
const [isListening, setIsListening] = useState(false);
const [selectedModel, setSelectedModel] = useState("gemini");

const recognitionRef = useRef(null);
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector(state => state.conversation);
   const { theme } = useSelector(state => state.user);
   const { isLoading } = useSelector(state => state.message);
const fileRef = useRef(null);

const [

selectedFile,

setSelectedFile

]=useState(null);

   const placeholders={

auto:"Ask Aether...",

chat:"Chat with Aether...",

coding:"Describe the software you want...",

pdf:"Generate a PDF about...",

ppt:"Create a presentation about...",

image:"Describe the image...",

search:"Search the web..."

};

   const agents = [

  {
    id:"auto",
    icon:Zap,
    label:"Auto"
  },

  {
    id:"chat",
    icon:MessageSquare,
    label:"Chat"
  },

  {
    id:"coding",
    icon:Code2,
    label:"Coding"
  },

  {
    id:"pdf",
    icon:FileText,
    label:"PDF"
  },

  {
    id:"ppt",
    icon:Presentation,
    label:"PPT"
  },

  {
    id:"image",
    icon:ImageIcon,
    label:"Image"
  },

  {
    id:"search",
    icon:Globe,
    label:"Search"
  }

];

useEffect(() => {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";

  recognition.interimResults = true;

  recognition.continuous = true;

  recognition.onresult = (event) => {

    let transcript = "";

    for (

      let i = event.resultIndex;

      i < event.results.length;

      i++

    ) {

      transcript += event.results[i][0].transcript;

    }

    setValue(transcript);

  };

  recognition.onend = () => {

    setIsListening(false);

  };

  recognitionRef.current = recognition;

}, []);

const toggleMic = () => {

  if (!recognitionRef.current) {

    alert("Speech Recognition not supported");

    return;

  }

  if (isListening) {

    recognitionRef.current.stop();

    setIsListening(false);

  } else {

    recognitionRef.current.start();

    setIsListening(true);

  }

};


  const handleSend = async () => {
    const prompt = value.trim();
    if (!prompt) return;

    dispatch(setIsLoading(true));

    try {


      let conversation = selectedConversation;

      if (!conversation) {
        const newConversation = await createConversation();
        dispatch(addConversation(newConversation));
        dispatch(setSelectedConversation(newConversation));
        conversation = newConversation;
      }

      if (conversation.title === "New Chat") {
        await updateConversations(conversation._id, prompt.slice(0, 40));
        dispatch(setConvTitle({ conversationId: conversation._id, title: prompt.slice(0, 40) }));
      }

      dispatch(addMessage({ role: "user", content: prompt }));
      setValue("");

      const formData = new FormData();

formData.append(
    "conversationId",
    conversation._id
);

formData.append(
    "prompt",
    prompt
);

formData.append(
    "agent",
    selectedAgent
);

formData.append(
    "model",
    selectedModel
);

if(selectedFile){

    formData.append(
        "file",
        selectedFile
    );

}

setSelectedFile(null)

      const data = await sendPrompt(formData);
      console.log(data);
      try {
        const { data: profileData } = await api.get("/api/me");
        dispatch(setUserData(profileData.user));
      } catch (err) {
        console.log("Error updating credits", err);
      }
     dispatch(
  addMessage({
    role: "assistant",
    content: data.answer,
    images:data.images
  })
);

console.log(data)

if(data.artifacts){
  dispatch(
    setArtifacts(
      data.artifacts
    )
  );
}}
catch(error){

  setBanner({

    open:true,

    title:
      error.response?.data?.title ||
      "Something went wrong",

    message:
      error.response?.data?.message ||
      "Please try again."

  });

}
  finally {
       dispatch(setIsLoading(false));
    }
  };

  const commands = [
    { id: "auto", label: "Auto Agent", desc: "Select best agent automatically" },
    { id: "chat", label: "General Chat", desc: "Conversational discussion node" },
    { id: "coding", label: "Coding Workspace", desc: "Generate interactive client-side sandboxes" },
    { id: "pdf", label: "PDF Document", desc: "Generate report documents" },
    { id: "ppt", label: "PPT Presentation", desc: "Create widescreen presentations" },
    { id: "image", label: "Image Vision", desc: "Analyze or describe uploaded images" },
    { id: "search", label: "Web Search", desc: "Scrape real-time web results" },
    { id: "clear", label: "Clear Chat", desc: "Reset active creative workspace" }
  ];

  const isCommandMode = value.startsWith("/");
  const commandQuery = isCommandMode ? value.slice(1).toLowerCase() : "";
  const filteredCommands = commands.filter(cmd =>
    cmd.id.startsWith(commandQuery) || cmd.label.toLowerCase().includes(commandQuery)
  );

  const [commandIndex, setCommandIndex] = useState(0);

  useEffect(() => {
    setCommandIndex(0);
  }, [value]);

  const executeCommand = (cmd) => {
    if (cmd.id === "clear") {
      window.dispatchEvent(new Event("create-new-chat"));
    } else {
      setSelectedAgent(cmd.id);
    }
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (isCommandMode && filteredCommands.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCommandIndex((prev) => (prev + 1) % filteredCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCommandIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        executeCommand(filteredCommands[commandIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setValue("");
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-transparent px-6 pb-6 pt-3 select-none">
      <div className="max-w-2xl mx-auto w-full bg-[#121214] border border-white/[0.04] rounded-xl flex flex-col focus-within:border-white/[0.08] transition-all duration-200 shadow-sm relative">
        
        {/* Floating Slash Command Menu */}
        <AnimatePresence>
          {isCommandMode && filteredCommands.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-2 z-[60] bg-[#0e0e11] border border-white/[0.06] rounded-xl p-1.5 shadow-[0_16px_32px_rgba(0,0,0,0.7)] max-h-[220px] overflow-y-auto space-y-0.5"
            >
              <div className="px-2.5 py-1.5 text-[9px] font-mono text-[#52525b] uppercase border-b border-white/[0.02] mb-1">
                Workspace Commands
              </div>
              {filteredCommands.map((cmd, index) => {
                const isSelected = index === commandIndex;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setCommandIndex(index)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? "bg-white/[0.03] text-white" : "text-[#a1a1aa]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#71717a] font-bold bg-white/[0.02] border border-white/[0.04] px-1 py-0.2 rounded">
                        /{cmd.id}
                      </span>
                      <span className="text-[12px] font-medium">{cmd.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#52525b]">{cmd.desc}</span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top toolbar: Monochromatic Agent Switcher */}
        <div className="flex gap-4.5 px-4 pt-3 pb-1 border-b border-white/[0.02] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`text-[9.5px] font-bold uppercase tracking-wider transition-colors duration-150 cursor-pointer bg-transparent border-none pb-2 relative ${
                  isActive ? "text-white" : "text-[#71717a] hover:text-[#a1a1aa]"
                }`}
              >
                {agent.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#f4f4f5] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Textarea Workspace */}
        <div className="flex flex-col px-4 pt-3 pb-2">
          {selectedFile && (
            <div className="mb-2.5 flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] rounded-md px-2 py-1.5 w-fit">
              <FileText size={12} className="text-[#a1a1aa]" />
              <span className="text-[10px] font-mono text-[#a1a1aa] truncate max-w-[150px]">{selectedFile.name}</span>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  fileRef.current.value = "";
                }}
                className="cursor-pointer bg-transparent border-none text-[#71717a] hover:text-white transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          )}

          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[selectedAgent]}
            rows={2}
            disabled={isLoading}
            className="w-full bg-transparent outline-none resize-none text-[13px] text-[#f4f4f5] placeholder:text-[#52525b] leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          />
        </div>

        {/* Bottom Workspace Actions */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1 select-none">
          <div className="flex items-center gap-1.5">
            <input
              ref={fileRef}
              type="file"
              hidden
              accept=".pdf,image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setSelectedFile(file);
              }}
            />
            
            <button
              onClick={() => fileRef.current.click()}
              className="flex items-center justify-center w-7 h-7 rounded-md text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.03] transition-colors duration-150 bg-transparent border-none cursor-pointer"
              title="Attach media"
            >
              <Paperclip size={13} />
            </button>

            <button
              onClick={toggleMic}
              className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-150 cursor-pointer border-none bg-transparent ${
                isListening ? "text-red-400 bg-red-500/10" : "text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.03]"
              }`}
              title="Voice input"
            >
              {isListening ? <MicOff size={13} /> : <Mic size={13} />}
            </button>

            {isListening && (
              <div className="flex items-center gap-[2.5px] h-4 px-1 text-red-400">
                <span className="w-[1.5px] h-2 bg-current rounded-full waveform-bar" style={{ animationDelay: '0.1s' }} />
                <span className="w-[1.5px] h-3.5 bg-current rounded-full waveform-bar" style={{ animationDelay: '0.3s' }} />
                <span className="w-[1.5px] h-1.5 bg-current rounded-full waveform-bar" style={{ animationDelay: '0.0s' }} />
                <span className="w-[1.5px] h-4 bg-current rounded-full waveform-bar" style={{ animationDelay: '0.4s' }} />
                <span className="w-[1.5px] h-2.5 bg-current rounded-full waveform-bar" style={{ animationDelay: '0.2s' }} />
              </div>
            )}

            {/* Quiet Monospace Model Switcher */}
            <div className="flex items-center gap-2 text-[9px] font-mono text-[#71717a] border border-white/[0.04] bg-white/[0.01] rounded-md px-2 py-0.5 ml-1">
              <button
                type="button"
                onClick={() => setSelectedModel("gemini")}
                className={`font-bold transition-colors cursor-pointer bg-transparent border-none uppercase ${
                  selectedModel === "gemini" ? "text-white" : "hover:text-[#a1a1aa]"
                }`}
              >
                Gemini 3.5 Flash
              </button>
              <span className="opacity-30">|</span>
              <button
                type="button"
                onClick={() => setSelectedModel("groq")}
                className={`font-bold transition-colors cursor-pointer bg-transparent border-none uppercase ${
                  selectedModel === "groq" ? "text-white" : "hover:text-[#a1a1aa]"
                }`}
              >
                Llama 3.3 70B
              </button>
            </div>
          </div>

          {/* Send Action */}
          <button
            onClick={handleSend}
            disabled={!isLoading && !value.trim()}
            className={`flex items-center justify-center w-7 h-7 rounded-md border-none cursor-pointer transition-all duration-150 ${
              isLoading
                ? "bg-[#f4f4f5] text-[#09090b]"
                : value.trim()
                ? "bg-[#f4f4f5] text-[#09090b] hover:bg-white active:scale-[0.98]"
                : "bg-white/[0.02] text-[#52525b] cursor-not-allowed"
            }`}
          >
            {isLoading ? <Square size={10} fill="currentColor" /> : <Send size={11} />}
          </button>
        </div>

      </div>

      <p className="text-center text-[9px] font-mono text-[#52525b] mt-3">
        Aether can make mistakes. Verify important info.
      </p>
    </div>
  );
}