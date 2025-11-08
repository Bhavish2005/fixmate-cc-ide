// import React, { useImperativeHandle, forwardRef, useState, useCallback } from 'react'

// /**
//  * Flexible AISidebar
//  * Props:
//  * - initialCollapsed: boolean (start collapsed)
//  * - compact: boolean (compact UI for narrow sidebars)
//  * - maxHistory: number (max items to keep)
//  * - aiHandler: async function(text) => { answer: string } (optional override for actual AI calls)
//  * - placeholder: string (prompt placeholder)
//  * - className: string additional classes for root container
//  *
//  * Exposed via ref:
//  * - explainError(err)
//  * - ask(text)
//  * - clearHistory()
//  */

// const AISidebar = forwardRef(function AISidebar(
//   {
//     initialCollapsed = false,
//     compact = false,
//     maxHistory = 50,
//     aiHandler = null,
//     placeholder = 'Ask the AI about errors, suggestions, or ask to simplify code...',
//     className = '',
//   },
//   ref
// ) {
//   const [prompt, setPrompt] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [response, setResponse] = useState(null)
//   const [history, setHistory] = useState([])
//   const [collapsed, setCollapsed] = useState(Boolean(initialCollapsed))

//   const clampHistory = useCallback((items) => items.slice(0, Math.max(0, Math.min(500, maxHistory))), [maxHistory])

//   // Small heuristic-based explainer for JS errors. Expandable later to call real AI.
//   function explainErrorSync(err) {
//     if (!err) return 'No error provided to explain.'
//     const lower = String(err).toLowerCase()

//     if (lower.includes('referenceerror')) {
//       return (
//         "ReferenceError usually means a variable or function is being used before it's defined or it's out of scope. " +
//         "Check spelling, ensure the variable is declared (const/let/var) and that it's in the correct lexical scope. For DOM refs ensure element exists before access."
//       )
//     }

//     if (lower.includes('typeerror')) {
//       return (
//         "TypeError means an operation was performed on a value of the wrong type (e.g., calling a non-function, or accessing property of undefined). " +
//         "Inspect the value, add guards (if/?.) and log runtime types to find the root."
//       )
//     }

//     if (lower.includes('syntaxerror')) {
//       return (
//         "SyntaxError indicates invalid code - missing brace, unexpected token, or malformed expression. " +
//         "Run a linter or check the line number in the stack to find the exact spot."
//       )
//     }

//     if (lower.includes('cannot read property') || lower.includes("cannot read properties of undefined")) {
//       return (
//         "This error typically indicates you're trying to access a property on undefined or null. Use optional chaining (?.), or ensure the value is initialized before access."
//       )
//     }

//     if (lower.includes('timeout') || lower.includes('network')) {
//       return (
//         "Looks like a network or timeout issue. Verify network connectivity, retry policies, and backend availability. Also check CORS if calling APIs from the browser."
//       )
//     }

//     // fallback
//     return (
//       "I couldn't match this error to a common pattern. Try providing more context (code snippet or stack trace) or press 'Ask AI' to get a detailed explanation."
//     )
//   }

//   async function localAIHandler(text) {
//     // small simulated delay
//     await new Promise((res) => setTimeout(res, 250))
//     return { answer: explainErrorSync(text) }
//   }

//   // askAI will delegate to provided aiHandler or use the local mock
//   async function askAI(text) {
//     if (!text) return null
//     setLoading(true)
//     try {
//       const handler = typeof aiHandler === 'function' ? aiHandler : localAIHandler
//       const result = await handler(text)
//       const answer = (result && result.answer) || String(result || '')
//       const item = {
//         id: Date.now(),
//         question: text,
//         answer,
//         createdAt: new Date().toISOString(),
//       }
//       setHistory((h) => clampHistory([item, ...h]))
//       setResponse(answer)
//       return item
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Expose methods to parent via ref
//   useImperativeHandle(ref, () => ({
//     explainError: (err) => {
//       const explanation = explainErrorSync(err)
//       const item = {
//         id: Date.now(),
//         question: err || 'Explain: (no input)',
//         answer: explanation,
//         createdAt: new Date().toISOString(),
//       }
//       setResponse(item.answer)
//       setHistory((h) => clampHistory([item, ...h]))
//       return item
//     },
//     ask: async (text) => {
//       return await askAI(text)
//     },
//     clearHistory: () => {
//       setHistory([])
//     },
//     setResponse: (text) => {
//       setResponse(text)
//     }
//   }), [aiHandler, clampHistory])

//   function handleAskClick() {
//     askAI(prompt)
//   }

//   function toggleCollapsed() {
//     setCollapsed((c) => !c)
//   }

//   // UI classes adapt to compact mode
//   const rootClasses = `flex flex-col h-full ${compact ? 'text-sm p-2' : 'p-4'} ${className}`

//   return (
//     <div className={rootClasses}>
//       <div className="flex items-center justify-between mb-3">
//         <h3 className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>{collapsed ? 'AI' : 'AI Assistant'}</h3>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={toggleCollapsed}
//             aria-expanded={!collapsed}
//             title={collapsed ? 'Expand' : 'Collapse'}
//             className="text-xs text-slate-400 hover:text-white"
//           >
//             {collapsed ? '›' : '‹'}
//           </button>
//         </div>
//       </div>

//       {collapsed ? (
//         <div className="flex-1 flex items-center justify-center text-slate-400">Collapsed</div>
//       ) : (
//         <div className="flex-1 overflow-auto">
//           <div className="mb-3">
//             <label className="text-xs text-slate-300">Prompt</label>
//             <textarea
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               placeholder={placeholder}
//               className={`w-full mt-1 p-2 rounded bg-slate-700 text-white border border-slate-600 min-h-[${compact ? '48' : '72'}px] resize-none text-sm`}
//             />
//             <div className="mt-2 flex items-center gap-2">
//               <button
//                 onClick={handleAskClick}
//                 disabled={loading || !prompt}
//                 className={`px-2 py-1 text-xs rounded ${loading || !prompt ? 'bg-slate-600 text-slate-300 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-white'}`}
//               >
//                 {loading ? 'Thinking…' : 'Ask AI'}
//               </button>
//               <button
//                 onClick={() => { setPrompt(''); setResponse(null) }}
//                 className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
//               >
//                 Clear
//               </button>
//             </div>
//           </div>

//           <div className="mb-3">
//             <div className="text-xs text-slate-300 mb-2">Response</div>
//             <div className="min-h-[80px] p-3 bg-slate-800 rounded border border-slate-700 text-sm text-slate-200">
//               {response ? (
//                 <div>
//                   <div className="whitespace-pre-wrap">{response}</div>
//                 </div>
//               ) : (
//                 <div className="text-slate-400">No response yet. Ask a question or use the "Explain the Error" action from the editor.</div>
//               )}
//             </div>
//           </div>

//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <div className="text-xs text-slate-300">History</div>
//               <div className="flex items-center gap-2">
//                 <button onClick={() => setHistory([])} className="text-xs text-slate-400 hover:text-white">Clear</button>
//                 <div className="text-xs text-slate-400">{history.length}</div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               {history.length === 0 ? (
//                 <div className="text-xs text-slate-500">No previous queries.</div>
//               ) : (
//                 history.map((h) => (
//                   <div key={h.id} className="p-2 bg-slate-800 border border-slate-700 rounded">
//                     <div className="text-xs text-slate-300 font-medium">{h.question}</div>
//                     <div className="text-xs text-slate-400 mt-1 whitespace-pre-wrap">{h.answer}</div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="mt-3 text-xs text-slate-400">AI Sidebar — flexible mock helper. Provide `aiHandler` prop to connect a real AI backend.</div>
//     </div>
//   )
// })

// export default AISidebar


// import React, {
//   useImperativeHandle,
//   forwardRef,
//   useState,
//   useCallback,
// } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Send,
//   Trash2,
//   Loader2,
//   MessageSquare,
//   Bot,
// } from "lucide-react";

// const AISidebar = forwardRef(function AISidebar(
//   {
//     initialCollapsed = false,
//     compact = false,
//     maxHistory = 50,
//     aiHandler = null,
//     placeholder = "Ask the AI about errors, suggestions, or ask to simplify code...",
//     className = "",
//   },
//   ref
// ) {
//   const [prompt, setPrompt] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [collapsed, setCollapsed] = useState(Boolean(initialCollapsed));

//   const clampHistory = useCallback(
//     (items) => items.slice(0, Math.max(0, Math.min(500, maxHistory))),
//     [maxHistory]
//   );

//   function explainErrorSync(err) {
//     if (!err) return "No error provided to explain.";
//     const lower = String(err).toLowerCase();

//     if (lower.includes("referenceerror"))
//       return "ReferenceError means you're using a variable or function before defining it. Check for typos or missing declarations.";
//     if (lower.includes("typeerror"))
//       return "TypeError means an operation was performed on an unexpected type (like calling a non-function or accessing a property of undefined).";
//     if (lower.includes("syntaxerror"))
//       return "SyntaxError means your code structure is invalid (missing brace, unexpected token, etc.).";
//     if (
//       lower.includes("cannot read property") ||
//       lower.includes("cannot read properties of undefined")
//     )
//       return "You're trying to access a property on undefined or null. Use optional chaining (?.) or ensure it's initialized.";
//     if (lower.includes("timeout") || lower.includes("network"))
//       return "Network or timeout issue — check your connection or API availability.";

//     return "Couldn’t detect a known error pattern. Try asking the AI for deeper insight.";
//   }

//   async function localAIHandler(text) {
//     await new Promise((res) => setTimeout(res, 300));
//     return { answer: explainErrorSync(text) };
//   }

//   async function askAI(text) {
//     if (!text) return null;
//     setLoading(true);
//     try {
//       const handler = typeof aiHandler === "function" ? aiHandler : localAIHandler;
//       const result = await handler(text);
//       const answer = (result && result.answer) || String(result || "");
//       const item = {
//         id: Date.now(),
//         question: text,
//         answer,
//         createdAt: new Date().toISOString(),
//       };
//       setHistory((h) => clampHistory([item, ...h]));
//       setResponse(answer);
//       return item;
//     } finally {
//       setLoading(false);
//     }
//   }

//   useImperativeHandle(
//     ref,
//     () => ({
//       explainError: (err) => {
//         const explanation = explainErrorSync(err);
//         const item = {
//           id: Date.now(),
//           question: err || "Explain: (no input)",
//           answer: explanation,
//           createdAt: new Date().toISOString(),
//         };
//         setResponse(item.answer);
//         setHistory((h) => clampHistory([item, ...h]));
//         return item;
//       },
//       ask: async (text) => await askAI(text),
//       clearHistory: () => setHistory([]),
//       setResponse: (text) => setResponse(text),
//     }),
//     [aiHandler, clampHistory]
//   );

//   const toggleCollapsed = () => setCollapsed((c) => !c);

//   return (
//     <div
//       className={`flex flex-col h-full bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 shadow-lg rounded-xl transition-all duration-300 ${className}`}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50">
//         <div className="flex items-center gap-2">
//           <Bot className="w-4 h-4 text-amber-500" />
//           <h3
//             className={`font-semibold ${
//               compact ? "text-xs" : "text-sm"
//             } text-white`}
//           >
//             {collapsed ? "AI" : "AI Assistant"}
//           </h3>
//         </div>

//         <button
//           onClick={toggleCollapsed}
//           className="p-1 rounded hover:bg-slate-700/50 transition"
//           title={collapsed ? "Expand" : "Collapse"}
//         >
//           {collapsed ? (
//             <ChevronLeft className="w-4 h-4 text-slate-300" />
//           ) : (
//             <ChevronRight className="w-4 h-4 text-slate-300" />
//           )}
//         </button>
//       </div>

//       {/* Collapsing Body */}
//       <AnimatePresence initial={false}>
//         {!collapsed && (
//           <motion.div
//             key="expanded"
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "100%" }}
//             exit={{ opacity: 0, height: 0 }}
//             transition={{ duration: 0.25, ease: "easeInOut" }}
//             className="flex-1 overflow-y-auto p-3"
//           >
//             {/* Prompt */}
//             <div className="mb-3">
//               <textarea
//                 value={prompt}
//                 onChange={(e) => setPrompt(e.target.value)}
//                 placeholder={placeholder}
//                 className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 focus:ring-1 focus:ring-amber-500 text-sm text-white resize-none min-h-[70px] placeholder-slate-500"
//               />
//               <div className="mt-2 flex items-center gap-2">
//                 <button
//                   onClick={() => askAI(prompt)}
//                   disabled={loading || !prompt}
//                   className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
//                     loading || !prompt
//                       ? "bg-slate-700 text-slate-400 cursor-not-allowed"
//                       : "bg-amber-600 hover:bg-amber-500 text-white shadow-md"
//                   }`}
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
//                     </>
//                   ) : (
//                     <>
//                       <Send className="w-3.5 h-3.5" /> Ask AI
//                     </>
//                   )}
//                 </button>

//                 <button
//                   onClick={() => {
//                     setPrompt("");
//                     setResponse(null);
//                   }}
//                   className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200"
//                 >
//                   <Trash2 className="w-3.5 h-3.5" /> Clear
//                 </button>
//               </div>
//             </div>

//             {/* Response */}
//             <div className="mb-4">
//               <div className="text-xs text-slate-400 mb-2">Response</div>
//               <div className="min-h-[90px] p-3 bg-slate-800/70 rounded-lg border border-slate-700 text-sm text-slate-200 shadow-inner">
//                 {response ? (
//                   <div className="whitespace-pre-wrap">{response}</div>
//                 ) : (
//                   <div className="text-slate-500 italic">
//                     No response yet. Try asking something.
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* History */}
//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-1 text-xs text-slate-400">
//                   <MessageSquare className="w-3 h-3" />
//                   <span>History</span>
//                 </div>
//                 <button
//                   onClick={() => setHistory([])}
//                   className="text-xs text-slate-400 hover:text-white"
//                 >
//                   Clear
//                 </button>
//               </div>

//               <div className="space-y-2 max-h-[200px] overflow-y-auto">
//                 {history.length === 0 ? (
//                   <div className="text-xs text-slate-500 italic">
//                     No previous queries.
//                   </div>
//                 ) : (
//                   history.map((h) => (
//                     <motion.div
//                       key={h.id}
//                       initial={{ opacity: 0, y: 5 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="p-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs"
//                     >
//                       <div className="font-medium text-slate-300">
//                         {h.question}
//                       </div>
//                       <div className="text-slate-400 mt-1 whitespace-pre-wrap">
//                         {h.answer}
//                       </div>
//                     </motion.div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Footer */}
//       <div className="text-[10px] text-slate-500 border-t border-slate-700/50 px-3 py-2">
//         ⚙️ Flexible AI Sidebar — connect a real backend using `aiHandler`.
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
} from "react";
import {
  Send,
  Trash2,
  Loader2,
  MessageSquare,
  Bot,
} from "lucide-react";

const AISidebar = forwardRef(function AISidebar(
  {
    compact = false,
    maxHistory = 50,
    aiHandler = null,
    placeholder = "Ask the AI about errors, suggestions, or ask to simplify code...",
    className = "",
  },
  ref
) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);

  const clampHistory = useCallback(
    (items) => items.slice(0, Math.max(0, Math.min(500, maxHistory))),
    [maxHistory]
  );

  function explainErrorSync(err) {
    if (!err) return "No error provided to explain.";
    const lower = String(err).toLowerCase();

    if (lower.includes("referenceerror"))
      return "ReferenceError: using a variable or function before defining it.";
    if (lower.includes("typeerror"))
      return "TypeError: performing an invalid operation on a value of the wrong type.";
    if (lower.includes("syntaxerror"))
      return "SyntaxError: invalid JavaScript syntax (missing bracket, unexpected token, etc.).";
    if (
      lower.includes("cannot read property") ||
      lower.includes("cannot read properties of undefined")
    )
      return "You're trying to access a property on undefined or null. Use optional chaining (?.).";
    if (lower.includes("timeout") || lower.includes("network"))
      return "Network or timeout issue — check your connection.";

    return "Couldn’t detect a known error pattern. Try asking the AI directly.";
  }

  async function localAIHandler(text) {
    await new Promise((res) => setTimeout(res, 300));
    return { answer: explainErrorSync(text) };
  }

  async function askAI(text) {
    if (!text) return null;
    setLoading(true);
    try {
      const handler =
        typeof aiHandler === "function" ? aiHandler : localAIHandler;
      const result = await handler(text);
      const answer = (result && result.answer) || String(result || "");
      const item = {
        id: Date.now(),
        question: text,
        answer,
        createdAt: new Date().toISOString(),
      };
      setHistory((h) => clampHistory([item, ...h]));
      setResponse(answer);
      return item;
    } finally {
      setLoading(false);
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      explainError: (err) => {
        const explanation = explainErrorSync(err);
        const item = {
          id: Date.now(),
          question: err || "Explain: (no input)",
          answer: explanation,
          createdAt: new Date().toISOString(),
        };
        setResponse(item.answer);
        setHistory((h) => clampHistory([item, ...h]));
        return item;
      },
      ask: async (text) => await askAI(text),
      clearHistory: () => setHistory([]),
      setResponse: (text) => setResponse(text),
    }),
    [aiHandler, clampHistory]
  );

  return (
    <div
      className={`flex flex-col h-full bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 shadow-lg rounded-xl transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-300" />
          <h3
            className={`font-semibold ${
              compact ? "text-xs" : "text-sm"
            } text-white`}
          >
            Debug-Buddy
          </h3>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Prompt */}
        <div className="mb-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 focus:ring-1 focus:ring-amber-500 text-sm text-white resize-none min-h-[70px] placeholder-slate-500"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => askAI(prompt)}
              disabled={loading || !prompt}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                loading || !prompt
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 text-white shadow-md"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Ask Buddy
                </>
              )}
            </button>

            <button
              onClick={() => {
                setPrompt("");
                setResponse(null);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Response */}
        {/* <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2">Response</div>
          <div className="min-h-[90px] p-3 bg-slate-800/70 rounded-lg border border-slate-700 text-sm text-slate-200 shadow-inner">
            {response ? (
              <div className="whitespace-pre-wrap">{response}</div>
            ) : (
              <div className="text-slate-500 italic">
                No response yet. Try asking something.
              </div>
            )}
          </div>
        </div> */}

      {/* Response */}
      <div className="mb-4">
        <div className="text-xs text-slate-400 mb-2">Response</div>
        
        {/* --- 💡 FIX IS ON THIS LINE --- */}
        <div className="min-h-[90px] max-h-64 overflow-y-auto p-3 bg-slate-800/70 rounded-lg border border-slate-700 text-sm text-slate-200 shadow-inner">
          {response ? (
            <div className="whitespace-pre-wrap">{response}</div>
          ) : (
            <div className="text-slate-500 italic">
              No response yet. Try asking something.
            </div>
          )}
        </div>
      </div>



        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MessageSquare className="w-3 h-3" />
              <span>History</span>
            </div>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-xs text-slate-500 italic">
                No previous queries.
              </div>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  className="p-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs"
                >
                  <div className="font-medium text-slate-300">
                    {h.question}
                  </div>
                  <div className="text-slate-400 mt-1 whitespace-pre-wrap">
                    {h.answer}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-[10px] text-slate-500 border-t border-slate-700/50 px-3 py-2">
        DebugBuddy - A Flexible AI Powered Buddy
      </div>
    </div>
  );
});

export default AISidebar;
