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
  const { theme } = useSelector(state => state.user);
  
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

  if (theme === "neo-glass") {
    return (
      <div className={`w-full py-5 border-b border-white/[0.03] transition-colors duration-150 ${isUser ? "bg-white/[0.01]" : "bg-white/[0.02]"}`}>
        <div className="max-w-3xl mx-auto px-4 flex gap-4">
          <div className="shrink-0 pt-0.5">
            {isUser ? (
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[11px] font-bold text-indigo-400">
                U
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center border border-indigo-400/30 text-white font-bold text-[11px]">
                AI
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 leading-relaxed text-[14px] text-slate-200">
            {images && images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    loading="lazy"
                    onClick={() => setLightboxSrc(img)}
                    onError={(e)=>e.currentTarget.remove()}
                    className="w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"
                  />
                ))}
              </div>
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mt-5 mb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>,
                p: ({ children }) => <p className="mb-3 whitespace-pre-wrap break-words">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-white/10">{children}</table>
                  </div>
                ),
                th: ({ children }) => <th className="border border-white/10 bg-white/5 px-3 py-2 text-left">{children}</th>,
                td: ({ children }) => <td className="border border-white/10 px-3 py-2">{children}</td>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-1">
                    {children}
                    <FiExternalLink size={11} />
                  </a>
                ),
                img: ({ src }) => src ? (
                  <img src={src} loading="lazy" onClick={() => setLightboxSrc(src)} onError={(e) => e.currentTarget.remove()} className="w-40 h-28 rounded-xl object-cover cursor-pointer" />
                ) : null,
                code({ className, children }) {
                  const value = String(children).replace(/^\s*```[^\n]*\n/, "").replace(/\n```\s*$/, "").trim();
                  if (!className) return <code className="px-1.5 py-0.5 rounded bg-white/10 text-pink-400">{value}</code>;
                  const language = className.replace("language-", "");
                  return (
                    <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
                      <div className="flex items-center justify-between bg-[#1b1d24] border-b border-white/10 px-4 py-2">
                        <span className="uppercase text-xs text-slate-400">{language}</span>
                        <button onClick={() => copyCode(value)} className="flex items-center gap-1 text-xs">
                          {copiedCode === value ? <><Check size={14} />Copied</> : <><Copy size={14} />Copy</>}
                        </button>
                      </div>
                      <SyntaxHighlighter language={language} style={oneDark} wrapLongLines showLineNumbers customStyle={{ margin: 0, padding: "16px", background: "#0d1117", fontSize: "13px" }}>
                        {value}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
        {lightboxSrc && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setLightboxSrc(null)}>
            <button type="button" onClick={() => setLightboxSrc(null)} className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 rounded-full p-2">
              <FiX size={20} />
            </button>
            <img src={lightboxSrc} onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex gap-3 items-start my-1.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center border border-indigo-400/30 text-white font-bold text-[10px] shadow-md shadow-indigo-500/10 mt-1">
          AI
        </div>
      )}

      <div
        className={`w-fit max-w-[85vw] md:max-w-[70%]
          px-5 py-3 rounded-2xl
          break-words overflow-hidden
          leading-relaxed shadow-lg
          ${
            isUser
              ? "bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white rounded-tr-none border border-indigo-500/30 shadow-indigo-500/10"
              : "bg-[#13161c]/80 border border-white/[0.06] text-slate-200 rounded-tl-none shadow-black/30 backdrop-blur-sm"
          }`}
      >
        {images.length > 0 && (
    <div className="flex flex-wrap gap-3 mt-4">
        {images.map((img, i) => (
            <img
                key={i}
                src={img}
                loading="lazy"
                onClick={() => setLightboxSrc(img)}
                onError={(e)=>e.currentTarget.remove()}
                className="w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"
            />
        ))}
    </div>
)}<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mt-5 mb-3">{children}</h1>
    ),

    h2: ({ children }) => (
      <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>
    ),

    h3: ({ children }) => (
      <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>
    ),

    p: ({ children }) => (
      <p className="mb-3 whitespace-pre-wrap break-words">
        {children}
      </p>
    ),

    ul: ({ children }) => (
      <ul className="list-disc pl-5 space-y-1 my-2">
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol className="list-decimal pl-5 space-y-1 my-2">
        {children}
      </ol>
    ),

    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-white/10">
          {children}
        </table>
      </div>
    ),

    th: ({ children }) => (
      <th className="border border-white/10 bg-white/5 px-3 py-2 text-left">
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="border border-white/10 px-3 py-2">
        {children}
      </td>
    ),

    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-indigo-400 underline inline-flex items-center gap-1"
      >
        {children}
        <FiExternalLink size={11} />
      </a>
    ),

    img: ({ src }) => {
      if (!src) return null;

      return (
        <img
          src={src}
          loading="lazy"
          onClick={() => setLightboxSrc(src)}
          onError={(e) => e.currentTarget.remove()}
          className="w-40 h-28 rounded-xl object-cover cursor-pointer"
        />
      );
    },

    code({ className, children }) {
      console.log(children)
      const value = String(children)
  .replace(/^\s*```[^\n]*\n/, "")
  .replace(/\n```\s*$/, "")
  .trim();

      if (!className) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-white/10 text-pink-400">
            {value}
          </code>
        );
      }

      const language = className.replace("language-", "");

      return (
        <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#111318]">

          <div className="flex items-center justify-between bg-[#1b1d24] border-b border-white/10 px-4 py-2">

            <span className="uppercase text-xs text-slate-400">
              {language}
            </span>

            <button
              onClick={() => copyCode(value)}
              className="flex items-center gap-1 text-xs"
            >
              {copiedCode === value ? (
                <>
                  <Check size={14} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>

          </div>

          <SyntaxHighlighter
            language={language}
            style={oneDark}
            wrapLongLines
            showLineNumbers
            customStyle={{
              margin: 0,
              padding: "16px",
              background: "#0d1117",
              fontSize: "13px",
            }}
          >
            {value}
          </SyntaxHighlighter>

        </div>
      );
    },
  }}
>
  {markdown}
</ReactMarkdown>
      </div>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 rounded-full p-2"
          >
            <FiX size={20} />
          </button>
          <img
            src={lightboxSrc}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default MessageBubble;