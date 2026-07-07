import { useState } from "react";
import { Send, Paperclip,  Square, Zap, MessageSquare, Code2, Presentation, Image as ImageIcon, Globe, FileText,X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setArtifacts, setIsLoading } from "../redux/message.slice";
import { sendPrompt } from "../features/agent.api";
import { Mic, MicOff } from "lucide-react";
import { useEffect } from "react";
import { createConversation, updateConversations } from "../features/conversation.api";
import { addConversation, setConvTitle, setSelectedConversation } from "../redux/conversation.slice";
import { useRef } from "react";
import { setUserData } from "../redux/user.slice";

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

auto:"Ask CortexAI...",

chat:"Chat with CortexAI...",

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
   <div className={`w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.05] transition-all duration-300
      ${theme === "neo-glass" ? "bg-transparent border-t-transparent" : "bg-[#0c0d12]/75 backdrop-blur-md"}`}>
      <div className={`flex flex-col gap-2 rounded-2xl px-4 pt-3.5 pb-3 transition-all duration-300
        ${theme === "neo-glass"
          ? "max-w-3xl mx-auto w-full bg-[#11131a] border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)] focus-within:border-violet-500/40 focus-within:shadow-[0_0_30px_rgba(139,92,246,0.1)]"
          : "bg-white/[0.02] hover:bg-white/[0.03] focus-within:bg-white/[0.04] border border-white/[0.07] focus-within:border-indigo-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.15)] focus-within:shadow-[0_0_24px_rgba(99,102,241,0.08)]"
        }`}>


    <div className="flex w-[80%] gap-2 pr-2 flex-wrap">

    {agents.map((agent) => {

      const Icon = agent.icon;
      const isActive = selectedAgent === agent.id;

      return (

        <button
          key={agent.id}
          onClick={() => setSelectedAgent(agent.id)}
          className={`
            flex-shrink-0
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-[14px]
            text-xs
            font-bold
            border
            transition-all
            duration-300
            cursor-pointer
            ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white border-transparent shadow-[0_2px_12px_rgba(99,102,241,0.3)] scale-[1.01]"
                : "bg-white/[0.015] text-slate-400 border-white/[0.04] hover:bg-white/[0.04] hover:text-slate-200"
            }
          `}
        >

          <Icon
            size={13.5}
            className={
              isActive
                ? "text-white"
                : "text-slate-500"
            }
          />

          {agent.label}

        </button>

      );

    })}


</div>

{

selectedFile && (

<div className="my-3">

<div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">

{

selectedFile.type==="application/pdf"

?

<FileText

size={16}

className="text-red-400"

/>

:



selectedFile?.type.startsWith("image/")

&&

<img

src={URL.createObjectURL(selectedFile)}

className="h-10 w-10 rounded-xl object-cover mt-3"

/>



}

<div>

<p className="text-xs text-white">

{

selectedFile.name

}

</p>

<p className="text-[10px] text-slate-500">

{

Math.ceil(

selectedFile.size/

1024

)

}

KB

</p>

</div>

<button

onClick={()=>{

setSelectedFile(null);

fileRef.current.value="";

}}

className="ml-2"

>

<X

size={14}

className="text-slate-500 hover:text-white"

/>

</button>

</div>

</div>

)
}


        {/* Textarea */}
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
placeholders[selectedAgent]
}
          rows={3}
          disabled={isLoading}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
        />

        {/* Bottom row */}
        <div className="flex items-center justify-between">

          {/* Left — attach + mic */}
          <div className="flex items-center gap-1">
  <input

ref={fileRef}

type="file"

hidden

accept=".pdf,image/*"

onChange={(e)=>{

const file =
e.target.files[0];

if(file){

setSelectedFile(file);

}

}}

/>
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer"
            onClick={()=>
fileRef.current.click()
}
            >
              <Paperclip size={14} />
            </button>
           <button

onClick={toggleMic}

className={`

flex

items-center

justify-center

w-8

h-8

rounded-lg

transition-all

cursor-pointer

${

isListening

?

"bg-red-500 text-white"

:

"text-slate-600 hover:bg-white/[0.05]"

}

`}

>

{
isListening
?
<MicOff size={14}/>
:
<Mic size={14}/>
}
</button>

            {/* Model Switcher Pill */}
            <div className="flex items-center ml-2 bg-white/[0.03] border border-white/[0.06] rounded-full p-0.5 select-none">
              <button
                type="button"
                onClick={() => setSelectedModel("gemini")}
                className={`px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedModel === "gemini"
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.25)]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Gemini
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel("groq")}
                className={`px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedModel === "groq"
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.25)]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Groq
              </button>
            </div>
          </div>

          {/* Right — send / stop */}
          <button
            onClick={handleSend}
            disabled={!isLoading && !value.trim()}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150
              ${isLoading
                ? "bg-white text-[#0d0f14] hover:bg-slate-200"
                : value.trim()
                ? "bg-gradient-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white"
                : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
              }`}
          >
            {isLoading ? <Square size={12} fill="currentColor" /> : <Send size={14} />}
          </button>

        </div>
      </div>

      <p className="text-center text-[10.5px] text-slate-700 mt-2.5">
        CortexAI can make mistakes. Verify important info.
      </p>
    </div>
  );
}