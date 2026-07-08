import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiExternalLink, FiX } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useSelector } from "react-redux";

function MessageBubble({ role, content, images = [] }) {
  const isUser = role === "user";
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");
  const { theme, userData } = useSelector(state => state.user);
  
  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode("");
    }, 2000);
  };

  const markdown = (content || "")
    .replace(/```review/gi, "```")
    .replace(/```text/gi, "```")
    .replace(/```[a-zA-Z0-9_-]+\s+id="[^"]*"/g, "```");

  // Minimal Markdown Render components to maintain typography layout rhythm
  const mdComponents = {
    h1: ({ children }) => <h1 className="text-[15px] font-bold text-white mt-5 mb-2.5 tracking-tight">{children}</h1>,
    h2: ({ children }) => <h2 className="text-[13.5px] font-semibold text-white mt-4 mb-2 tracking-tight">{children}</h2>,
    h3: ({ children }) => <h3 className="text-[12.5px] font-semibold text-white mt-3 mb-1.5">{children}</h3>,
    p: ({ children }) => <p className="mb-3 whitespace-pre-wrap break-words text-[#d4d4d8] leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-3 text-[#d4d4d8] text-[12.5px]">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-3 text-[#d4d4d8] text-[12.5px]">{children}</ol>,
    table: ({ children }) => (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full border-collapse border border-white/[0.04] text-[12px]">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border border-white/[0.04] bg-white/[0.01] px-3 py-2 text-left font-bold text-white">{children}</th>,
    td: ({ children }) => <td className="border border-white/[0.04] px-3 py-2 text-[#a1a1aa]">{children}</td>,
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noreferrer" className="text-[#a1a1aa] hover:text-white underline inline-flex items-center gap-1 font-medium transition-colors">
        {children}
        <FiExternalLink size={10} />
      </a>
    ),
    img: ({ src }) => src ? (
      <img src={src} loading="lazy" onClick={() => setLightboxSrc(src)} onError={(e) => e.currentTarget.remove()} className="w-36 h-24 rounded object-cover cursor-pointer border border-white/[0.08]" />
    ) : null,
    code({ className, children }) {
      const value = String(children).replace(/^\s*```[^\n]*\n/, "").replace(/\n```\s*$/, "").trim();
      if (!className) return <code className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.04] text-neutral-200 font-mono text-[11.5px]">{value}</code>;
      const language = className.replace("language-", "");
      return (
        <div className="my-3.5 overflow-hidden rounded-lg border border-white/[0.04] bg-[#121214]">
          <div className="flex items-center justify-between bg-[#161619] border-b border-white/[0.04] px-4 py-2 select-none">
            <span className="uppercase text-[9px] font-mono font-bold text-[#71717a]">{language}</span>
            <button onClick={() => copyCode(value)} className="flex items-center gap-1 text-[9px] font-bold text-[#71717a] hover:text-[#f4f4f5] transition-colors border-none bg-transparent cursor-pointer">
              {copiedCode === value ? <><Check size={11} className="text-green-500" />Copied</> : <><Copy size={11} />Copy</>}
            </button>
          </div>
          <SyntaxHighlighter language={language} style={oneDark} wrapLongLines showLineNumbers={false} customStyle={{ margin: 0, padding: "16px", background: "#121214", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
            {value}
          </SyntaxHighlighter>
        </div>
      );
    }
  };

  // ── Glass Mode Layout (Quiet bordered panels)
  if (theme === "neo-glass") {
    return (
      <div className={`w-full py-5 border-b border-white/[0.02] transition-colors duration-150 ${isUser ? "bg-white/[0.005]" : "bg-white/[0.015]"}`}>
        <div className="max-w-2xl mx-auto px-4 flex gap-4.5">
          <div className="shrink-0 pt-0.5 select-none w-10">
            <span className="text-[9px] font-mono tracking-wider text-[#71717a] uppercase font-bold">
              {isUser ? "USER" : "AGENT"}
            </span>
          </div>
          <div className="flex-1 min-w-0 leading-relaxed text-[13px] text-[#e4e4e7]">
            {images && images.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-2.5">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    loading="lazy"
                    onClick={() => setLightboxSrc(img)}
                    onError={(e) => e.currentTarget.remove()}
                    className="w-36 h-24 rounded object-cover border border-white/[0.08] cursor-zoom-in hover:opacity-90 transition-opacity"
                  />
                ))}
              </div>
            )}
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
        
        {lightboxSrc && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setLightboxSrc(null)}>
            <button type="button" onClick={() => setLightboxSrc(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/5 rounded-full p-2 border-none cursor-pointer">
              <FiX size={18} />
            </button>
            <img src={lightboxSrc} onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] rounded-lg border border-white/[0.08] shadow-2xl object-contain" />
          </div>
        )}
      </div>
    );
  }

  // ── Minimal Mode Layout (Quiet Typographic row)
  return (
    <div className="w-full py-5 border-b border-white/[0.02] select-text">
      <div className="max-w-2xl mx-auto px-4 flex gap-5">
        <div className="shrink-0 w-10 text-right select-none pt-0.5">
          <span className="text-[9px] font-mono tracking-wider text-[#71717a] uppercase font-bold">
            {isUser ? "USER" : "AGENT"}
          </span>
        </div>
        <div className="flex-1 min-w-0 leading-relaxed text-[13px] text-[#e4e4e7]">
          {images && images.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mb-2.5">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  loading="lazy"
                  onClick={() => setLightboxSrc(img)}
                  onError={(e) => e.currentTarget.remove()}
                  className="w-36 h-24 rounded object-cover border border-white/[0.08] cursor-zoom-in hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          )}
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>

      {lightboxSrc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setLightboxSrc(null)}>
          <button type="button" onClick={() => setLightboxSrc(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/5 rounded-full p-2 border-none cursor-pointer">
            <FiX size={18} />
          </button>
          <img src={lightboxSrc} onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] rounded-lg border border-white/[0.08] shadow-2xl object-contain" />
        </div>
      )}
    </div>
  );
}

export default MessageBubble;