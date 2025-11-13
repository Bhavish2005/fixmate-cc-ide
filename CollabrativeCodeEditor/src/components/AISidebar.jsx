// import React, {
//   useImperativeHandle,
//   forwardRef,
//   useState,
//   useCallback,
//   useEffect,
//   useRef,
// } from "react";
// import {
//   Send,
//   Loader2,
//   MessageSquare,
//   Bot,
//   X,
//   Sparkles,
// } from "lucide-react";

// const AISidebar = forwardRef(function AISidebar(
//   {
//     maxHistory = 50,
//     aiHandler = null,
//     placeholder = "Ask about errors or logic...",
//     className = "",
//     onClose,
//   },
//   ref
// ) {
//   const [prompt, setPrompt] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState(null);
//   const [history, setHistory] = useState([]);
//   const responseEndRef = useRef(null);

//   const clampHistory = useCallback(
//     (items) => items.slice(0, Math.max(0, Math.min(500, maxHistory))),
//     [maxHistory]
//   );

//   async function askAI(text) {
//     if (!text) return null;
//     setLoading(true);
//     try {
//       const handler = typeof aiHandler === "function" ? aiHandler : async () => ({ answer: "AI Disconnected" });
//       const result = await handler(text);
//       const answer = result?.answer || "";
//       const item = { id: Date.now(), question: text, answer };
//       setResponse(answer);
//       setHistory((h) => clampHistory([item, ...h]));
//       return item;
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     responseEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [response]);

//   useImperativeHandle(ref, () => ({
//     explainError: (err) => {
//       const ans = "Here is an explanation based on the error..."; // Placeholder
//       const item = { id: Date.now(), question: "Fix Error", answer: ans };
//       setResponse(ans);
//       setHistory((h) => clampHistory([item, ...h]));
//     },
//     ask: askAI,
//     clearHistory: () => { setHistory([]); setResponse(null); },
//   }));

//   return (
//     <div className={`flex flex-col h-full bg-slate-900 ${className}`}>
      
//       {/* 1. HEADER (Fixed Top) */}
//       <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 z-10">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
//             <Bot size={18} className="text-white" />
//           </div>
//           <div>
//             <h3 className="font-bold text-sm text-white">Debug Buddy</h3>
//             <p className="text-[10px] text-emerald-400 font-medium">● Online</p>
//           </div>
//         </div>
//         {onClose && (
//           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
//             <X size={18} />
//           </button>
//         )}
//       </div>

//       {/* 2. SCROLLABLE CONTENT (Middle) */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar min-h-0">
//         {/* Response */}
//         <div className="space-y-2">
//             {response && (
//                <div className="flex justify-between items-center">
//                    <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
//                        <Sparkles size={10} /> AI Analysis
//                    </h4>
//                    <button onClick={()=>setResponse(null)} className="text-[10px] text-slate-500 hover:underline">Clear</button>
//                </div>
//             )}
            
//             <div className={`min-h-[120px] rounded-2xl border transition-all ${response ? "bg-slate-800/50 border-slate-700 p-4 shadow-inner" : "border-slate-800 border-dashed flex items-center justify-center"}`}>
//                 {loading ? (
//                     <div className="flex flex-col items-center gap-2 text-slate-500">
//                         <Loader2 size={20} className="animate-spin text-cyan-500" />
//                         <span className="text-xs">Thinking...</span>
//                     </div>
//                 ) : response ? (
//                     <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{response} <div ref={responseEndRef}/></div>
//                 ) : (
//                     <div className="text-center px-6">
//                         <p className="text-xs text-slate-600">Ready to assist! Ask me anything.</p>
//                     </div>
//                 )}
//             </div>
//         </div>

//         {/* History */}
//         {history.length > 0 && (
//             <div className="space-y-3 pt-4 border-t border-slate-800">
//                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
//                     <MessageSquare size={10} /> Recent
//                 </h4>
//                 <div className="space-y-2">
//                     {history.map((item) => (
//                         <div key={item.id} onClick={() => setResponse(item.answer)} className="cursor-pointer group p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all">
//                             <p className="text-xs font-semibold text-slate-300 mb-1 line-clamp-1">{item.question}</p>
//                             <p className="text-[10px] text-slate-500 line-clamp-2 group-hover:text-slate-400">{item.answer}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         )}
//       </div>

//       {/* 3. INPUT AREA (Fixed Bottom - Guaranteed Visible) */}
//       <div className="flex-none p-4 border-t border-slate-800 bg-slate-900 z-10">
//         <div className="relative bg-slate-800 rounded-2xl p-1 border border-slate-700 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
//             <textarea
//                 value={prompt}
//                 onChange={(e) => setPrompt(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), askAI(prompt), setPrompt(""))}
//                 placeholder={placeholder}
//                 className="w-full bg-transparent text-sm text-white p-3 pr-10 max-h-32 min-h-[44px] resize-none outline-none placeholder-slate-600 custom-scrollbar"
//                 rows={1}
//             />
//             <button 
//                 onClick={() => { askAI(prompt); setPrompt(""); }}
//                 disabled={!prompt.trim() || loading}
//                 className="absolute right-2 bottom-2 p-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 disabled:opacity-0 disabled:pointer-events-none transition-all shadow-lg shadow-cyan-500/20"
//             >
//                 <Send size={14} />
//             </button>
//         </div>
//       </div>
//     </div>
//   );
// });

// export default AISidebar;

import React, {
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  Send,
  Loader2,
  MessageSquare,
  Bot,
  X,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AISidebar = forwardRef(function AISidebar(
  {
    maxHistory = 50,
    aiHandler = null,
    placeholder = "Ask about errors or logic...",
    className = "",
    onClose,
  },
  ref
) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const responseEndRef = useRef(null);

  const clampHistory = useCallback(
    (items) => items.slice(0, Math.max(0, Math.min(500, maxHistory))),
    [maxHistory]
  );

  async function askAI(text) {
    if (!text) return null;
    setLoading(true);
    try {
      const handler =
        typeof aiHandler === "function"
          ? aiHandler
          : async () => ({ answer: "AI Disconnected" });
      const result = await handler(text);
      const answer = result?.answer || "";
      const item = { id: Date.now(), question: text, answer };
      setResponse(answer);
      setHistory((h) => clampHistory([item, ...h]));
      return item;
    } finally {
      setLoading(false);
    }
  }

  // Scroll to bottom of response when it updates
  useEffect(() => {
    responseEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [response]);

  useImperativeHandle(ref, () => ({
    explainError: (err) => {
      const ans = `Here is an analysis of the error:\n\n\`\`\`\n${err}\n\`\`\`\n\nTry checking your syntax or variable definitions.`;
      const item = { id: Date.now(), question: "Fix Error", answer: ans };
      setResponse(ans);
      setHistory((h) => clampHistory([item, ...h]));
    },
    ask: askAI,
    clearHistory: () => {
      setHistory([]);
      setResponse(null);
    },
  }));

  return (
    <div className={`flex flex-col h-full bg-slate-900 ${className}`}>
      {/* 1. HEADER (Fixed Top) */}
      <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Debug Buddy</h3>
            <p className="text-[10px] text-emerald-400 font-medium">
              ● Online
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 2. SCROLLABLE CONTENT (Middle) */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
        {/* Response Area */}
        <div className="space-y-4">
          {response && (
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={10} /> AI Analysis
              </h4>
              <button
                onClick={() => setResponse(null)}
                className="text-[10px] text-slate-500 hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          <div
            className={`min-h-[120px] rounded-2xl border transition-all ${
              response
                ? "bg-slate-800/50 border-slate-700 p-5 shadow-inner"
                : "border-slate-800 border-dashed flex items-center justify-center"
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 size={24} className="animate-spin text-cyan-500" />
                <span className="text-xs font-medium">Thinking...</span>
              </div>
            ) : response ? (
              <div className="text-sm text-slate-300 leading-relaxed">
                {/* --- MARKDOWN RENDERER --- */}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Style Headings
                    h1: ({ node, ...props }) => (
                      <h1 className="text-lg font-bold text-white mb-3 mt-4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-base font-bold text-cyan-400 mb-2 mt-4" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-sm font-bold text-cyan-300 mb-2 mt-3" {...props} />
                    ),
                    // Style Paragraphs
                    p: ({ node, ...props }) => (
                      <p className="mb-3 last:mb-0" {...props} />
                    ),
                    // Style Lists
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside mb-3 space-y-1 pl-2 text-slate-300" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-inside mb-3 space-y-1 pl-2 text-slate-300" {...props} />
                    ),
                    // Style Links
                    a: ({ node, ...props }) => (
                      <a className="text-cyan-400 hover:underline cursor-pointer" {...props} />
                    ),
                    // Style Code Blocks & Inline Code
                    code: ({ node, inline, className, children, ...props }) => {
                      return inline ? (
                        // Inline code (e.g. `variable`)
                        <code className="bg-slate-700/50 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-600/50" {...props}>
                          {children}
                        </code>
                      ) : (
                        // Block code (```python ... ```)
                        <div className="relative group my-3">
                          <div className="absolute top-0 right-0 px-2 py-1 text-[10px] text-slate-500 font-mono bg-slate-800 rounded-bl-lg rounded-tr-lg border-l border-b border-slate-700">
                            Code
                          </div>
                          <div className="bg-[#0d1117] rounded-lg border border-slate-800 overflow-hidden">
                            <div className="overflow-x-auto p-3">
                              <code className="block text-xs font-mono text-emerald-400 whitespace-pre" {...props}>
                                {children}
                              </code>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  }}
                >
                  {response}
                </ReactMarkdown>
                {/* ------------------------- */}
                <div ref={responseEndRef} />
              </div>
            ) : (
              <div className="text-center px-6 py-8">
                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-400 font-medium">
                  How can I help you today?
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Ask to fix errors, explain code, or refactor.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-slate-800 mt-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={10} /> Recent Chat
            </h4>
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setResponse(item.answer)}
                  className="cursor-pointer group p-3 rounded-xl bg-slate-800/20 hover:bg-slate-800 border border-slate-800/50 hover:border-slate-700 transition-all"
                >
                  <p className="text-xs font-semibold text-slate-300 mb-1 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                    {item.question}
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    Click to restore answer...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. INPUT AREA (Fixed Bottom - Guaranteed Visible) */}
      <div className="flex-none p-4 border-t border-slate-800 bg-slate-900 z-10">
        <div className="relative bg-slate-800 rounded-2xl p-1 border border-slate-700 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), askAI(prompt), setPrompt(""))
            }
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-white p-3 pr-10 max-h-32 min-h-[44px] resize-none outline-none placeholder-slate-600 custom-scrollbar"
            rows={1}
          />
          <button
            onClick={() => {
              askAI(prompt);
              setPrompt("");
            }}
            disabled={!prompt.trim() || loading}
            className="absolute right-2 bottom-2 p-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 disabled:opacity-0 disabled:pointer-events-none transition-all shadow-lg shadow-cyan-500/20"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default AISidebar;