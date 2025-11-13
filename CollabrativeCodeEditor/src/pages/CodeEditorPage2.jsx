// import React, { useState, useEffect, useRef } from "react";
// import Editor from "@monaco-editor/react";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import { MessageSquareCode, X } from "lucide-react";
// import AISidebar from "../components/AISidebar";
// import { useAuth } from "../context/AuthContext.jsx";
// import { initVimMode } from "monaco-vim";

// // API helper to log runs
// const logRunToDatabase = async (runData) => {
//   try {
//     await fetch("http://localhost:4000/auth/log-run", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include", // Sends the auth cookie
//       body: JSON.stringify(runData),
//     });
//     console.log("Run logged to DB.");
//   } catch (err) {
//     console.error("Failed to log run to DB:", err);
//   }
// };

// // Helper to parse error category
// const parseErrorCategory = (errMsg) => {
//   const lowerMsg = errMsg.toLowerCase();
//   if (lowerMsg.includes("syntaxerror")) return "Syntax";
//   if (lowerMsg.includes("typeerror")) return "Runtime";
//   if (lowerMsg.includes("referenceerror")) return "Runtime";
//   if (lowerMsg.includes("compiler error")) return "Compiler";
//   return "Runtime"; // Default
// };

// const CodeEditorPage2 = ({
//   language = "python",
//   code = "",
//   stdin = "",
//   output = "",
//   onUpdate = () => {},
// }) => {
//   // Editor State
//   const [currentLang, setCurrentLang] = useState(language);
//   const [currentCode, setCurrentCode] = useState(code);
//   const [currentInput, setCurrentInput] = useState(stdin);
//   const [currentOutput, setCurrentOutput] = useState(output);
//   const [loading, setLoading] = useState(false);

//   // Sidebar State
//   const [sidebarWidth, setSidebarWidth] = useState(380);
//   const [isDragging, setIsDragging] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const containerRef = useRef(null);
//   const aiRef = useRef(null);
//   const { user } = useAuth(); // Get user from context

//   const [isVimMode, setIsVimMode] = useState(false); // State to toggle Vim
//   const editorRef = useRef(null); // Ref to store the editor instance


//   const statusBarRef = useRef(null); // 👈 ADD THIS REF
//   const vimModeRef = useRef(null); // 👈 ADD THIS REF

//   // Sync props
//   useEffect(() => setCurrentLang(language), [language]);
//   useEffect(() => setCurrentCode(code), [code]);
//   useEffect(() => setCurrentInput(stdin), [stdin]);
//   useEffect(() => setCurrentOutput(output), [output]);

//   // Sidebar resizing
//   useEffect(() => {
//     const onMouseMove = (e) => {
//       if (!isDragging || !containerRef.current) return;
//       const rect = containerRef.current.getBoundingClientRect();
//       const newWidth = Math.max(280, rect.right - e.clientX);
//       const maxWidth = Math.max(320, rect.width - 200);
//       setSidebarWidth(Math.min(maxWidth, newWidth));
//     };
//     const stopDrag = () => setIsDragging(false);
//     window.addEventListener("mousemove", onMouseMove);
//     window.addEventListener("mouseup", stopDrag);
//     return () => {
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("mouseup", stopDrag);
//     };
//   }, [isDragging]);

//   // const handleEditorMount = (editor, monaco) => {
//   //   // If a Vim instance already exists, dispose of it
//   //   if (vimModeRef.current) {
//   //     vimModeRef.current.dispose();
//   //   }
    
//   //   // Ensure the status bar element exists before initializing
//   //   if (statusBarRef.current) {
//   //     // Clear any previous status
//   //     statusBarRef.current.innerHTML = '';
      
//   //     // Initialize Vim mode, passing the editor and status bar
//   //     vimModeRef.current = initVimMode(editor, statusBarRef.current);
//   //   } else {
//   //     // Fallback if status bar isn't ready (less ideal)
//   //     vimModeRef.current = initVimMode(editor, null);
//   //   }
//   // };
//   // AFTER
//   const handleEditorMount = (editor, monaco) => {
//     editorRef.current = editor; // Save the editor instance
//     // Initial setup (Vim is off by default)
//   };

//   // --- 👇 ADD THIS NEW EFFECT ---
//   // Effect to toggle Vim mode
//   useEffect(() => {
//     if (!editorRef.current) return; // Editor not mounted yet

//     if (isVimMode) {
//       // Enable Vim
//       if (vimModeRef.current) vimModeRef.current.dispose(); // Clean up just in case
//       vimModeRef.current = initVimMode(editorRef.current, statusBarRef.current);
//     } else {
//       // Disable Vim
//       if (vimModeRef.current) {
//         vimModeRef.current.dispose();
//         vimModeRef.current = null;
//       }
//       if (statusBarRef.current) {
//         statusBarRef.current.innerHTML = ''; // Clear status bar
//       }
//     }
//   }, [isVimMode]); // This effect re-runs whenever isVimMode changes
// // --- END OF ADD ---

//   // 👇 ADD THIS EFFECT FOR CLEANUP
//   useEffect(() => {
//     // This function runs when the component unmounts
//     return () => {
//       if (vimModeRef.current) {
//         vimModeRef.current.dispose();
//         vimModeRef.current = null;
//       }
//     };
//   }, []);

//   // ▶ Run code
//   const runCode = async () => {
//     setLoading(true);
//     setCurrentOutput("Running...");
//     onUpdate?.({ output: "Running..." });

//     let result = "";
//     let isError = false;
//     let errorOutput = "";

//     try {
//       const res = await axios.post("https://emkc.org/api/v2/piston/execute", {
//         language: currentLang,
//         version: "*",
//         files: [{ name: "main", content: currentCode }],
//         stdin: currentInput,
//       });

//       const stdout = res.data.run?.stdout?.trim();
//       const stderr = res.data.run?.stderr?.trim();
//       const compileErr = res.data.compile?.stderr?.trim();
      
//       errorOutput = stderr || compileErr; // Store the raw error
//       isError = !!errorOutput; // Check if an error occurred
      
//       result = isError
//         ? `Compiler Error:\n${errorOutput}`
//         : stdout || "No output";

//     } catch (err) {
//       console.error("Error running code:", err);
//       isError = true; // The API call itself failed
//       errorOutput = "⚠ Internal Error running code. Check Piston API or network.";
//       result = errorOutput;

//     } finally {
//       setLoading(false);
//       setCurrentOutput(result);
//       onUpdate?.({ output: result });

//       // Log the run
//       if (user) { // Only log if user is logged in
//         if (isError) {
//           logRunToDatabase({
//             isSuccess: false,
//             error: errorOutput.split('\n')[0].trim(), // Get clean first line
//             category: parseErrorCategory(errorOutput),
//             language: currentLang,
//             code: currentCode,
//           });
//         } else {
//           // Log success
//           logRunToDatabase({
//             isSuccess: true,
//             language: currentLang,
//             code: currentCode,
//           });
//         }
//       }
//     }
//   }; // end of runCode


//   const geminiAiHandler = async (text) => {
//     try {
//       const response = await fetch("http://localhost:4000/auth/ask-buddy", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ prompt: text }), 
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       return { answer: data.answer };
//     } catch (error) {
//       console.error("Failed to fetch from backend:", error);
//       return {
//         answer: `Sorry, I couldn't connect to the Debug-Buddy service. \n${error.message}`,
//       };
//     }
//   };

//   const handleExplainError = () => {
//     setIsSidebarOpen(true); 
//     if (aiRef.current && typeof aiRef.current.ask === 'function') {
//       const aiPrompt = `
// I encountered an error. Can you help me understand what's wrong and how to fix it?

// My Code (${currentLang}):
// \`\`\`${currentLang}
// ${currentCode}
// \`\`\`

// My Input (stdin):
// \`\`\`
// ${currentInput || "(No input provided)"}
// \`\`\`

// The Error Output:
// \`\`\`
// ${currentOutput}
// \`\`\`
// `;
//       aiRef.current.ask(aiPrompt);
//     } else {
//       console.warn('AI Sidebar ref not ready or ask() method not found.');
//     }
//   };

//   // Handlers
//   const handleChange = (val) => {
//     const updated = val || "";
//     setCurrentCode(updated);
//     onUpdate?.({ code: updated });
//   };

//   const handleLangChange = (e) => {
//     const lang = e.target.value;
//     setCurrentLang(lang);
//     onUpdate?.({ language: lang });
//   };

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setCurrentInput(val);
//     onUpdate?.({ stdin: val });
//   };

//   return (
//     <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden pt-10">
//       <main ref={containerRef} className="flex-1 flex overflow-hidden">
//         {/* Code Editor Section */}
//         <section className="flex-1 p-4 min-w-0 flex flex-col">
//         {/* Toolbar */}
//         <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-t-lg px-4 py-2">
//           {/* Left Side: Title */}
//           <div>
//             <h1 className="text-base font-semibold bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
//               Build & Fix, Faster
//             </h1>
//             <p className="text-xs text-slate-400">
//               Write and debug your code with a smart AI Buddy right beside you.
//             </p>
//           </div>

//           {/* Right Side: Controls (NEW WRAPPER) */}
//           <div className="flex items-center gap-4">
//             {/* Vim Toggle */}
//             <div className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 id="vim-toggle"
//                 checked={isVimMode}
//                 onChange={(e) => setIsVimMode(e.target.checked)}
//                 className="w-4 h-4 bg-slate-700 border-slate-600 rounded text-cyan-500 focus:ring-cyan-500 cursor-pointer"
//               />
//               <label
//                 htmlFor="vim-toggle"
//                 className="text-sm font-medium text-slate-300 cursor-pointer select-none"
//               >
//                 Vim Mode
//               </label>
//             </div>

//             {/* Language Dropdown (Moved) */}
//             <select
//               value={currentLang}
//               onChange={handleLangChange}
//               className="bg-slate-800 text-white text-sm border border-slate-700 rounded-md px-2 py-1"
//             >
//               <option value="python">Python</option>
//               <option value="javascript">JavaScript</option>
//               <option value="cpp">C++</option>
//               <option value="c">C</option>
//               <option value="java">Java</option>
//               <option value="go">Go</option>
//             </select>

//             {/* Run Button (Moved) */}
//             <button
//               onClick={runCode}
//               disabled={loading}
//               aria-pressed={loading}
//               className={`relative inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${
//                 loading
//                   ? "bg-green-500 scale-95"
//                   : "bg-green-600 hover:bg-green-500"
//               }`}
//             >
//               {loading ? (
//                 <>
//                   <svg
//                     className="w-4 h-4 animate-spin"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                   >
//                     <circle
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="white"
//                       strokeOpacity="0.15"
//                       strokeWidth="4"
//                     />
//                     <path
//                       d="M22 12a10 10 0 00-10-10"
//                       stroke="white"
//                       strokeWidth="4"
//                       strokeLinecap="round"
//                     />
//                   </svg>
//                   Running...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
//                     <path d="M5 3v18l15-9L5 3z" fill="white" />
//                   </svg>
//                   Run
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//           {/* Editor */}
//           <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800 border-x border-b border-slate-700 rounded-b-lg overflow-hidden">
//             <Editor
//               height="60vh"
//               theme="vs-dark"
//               language={currentLang}
//               value={currentCode}
//               onChange={handleChange}
//               onMount={handleEditorMount}
//               options={{
//                 minimap: { enabled: false },
//                 fontSize: 15,
//                 automaticLayout: true,
//               }}
//             />
//             <div
//             ref={statusBarRef}
//             className="bg-slate-800 text-sm text-slate-300 px-3 py-1 border-t border-slate-700 font-mono"
//           >
//             {/* Vim status (e.g., --INSERT--) will appear here */}
//           </div>
//           </div>

//           {/* Input */}
//           <div className="mt-4">
//             <h3 className="text-sm font-semibold text-cyan-400 mb-2">Input (stdin)</h3>
//             <textarea
//               value={currentInput}
//               onChange={handleInputChange}
//               placeholder="Enter input (stdin) for your code here..."
//               className="w-full h-24 p-3 rounded-lg bg-slate-800/70 border border-slate-700 
//                          text-slate-200 placeholder-slate-500 text-sm font-mono
//                          focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
//             />
//           </div>

//           {/* Output */}
//           <div className="mt-4">
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="text-sm font-semibold text-cyan-400">Output</h3>
//               {currentOutput && (
//                 <div className="text-xs text-slate-400">
//                   {new Date().toLocaleTimeString()}
//                 </div>
//               )}
//             </div>
            
//             <div className="min-h-[80px] max-h-48 overflow-auto p-3 rounded-lg bg-slate-800/70 
//                            border border-slate-700 text-sm font-mono shadow-inner">
//               {currentOutput ? (
//                 <pre
//                   className={`whitespace-pre-wrap ${
//                     currentOutput.startsWith("Compiler Error") || currentOutput.startsWith("⚠")
//                       ? "text-red-400"
//                       : "text-green-400"
//                   }`}
//                 >
//                   {currentOutput}
//                 </pre>
//               ) : (
//                 <div className="text-slate-500 italic">
//                   No output yet. Click Run to execute.
//                 </div>
//               )}
//             </div>

//             {/* Neutralize Button */}
//             {(currentOutput.startsWith("Compiler Error") ||
//               currentOutput.startsWith("Runtime Error") ||
//               currentOutput.startsWith("⚠")) && (
//               <div className="mt-3 flex justify-center">
//                 <motion.button
//                   onClick={handleExplainError}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.95 }}
//                   className="py-2 px-4 w-48 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 rounded-md text-white font-medium shadow-md hover:shadow-lg transition"
//                 >
//                   Neutralize the Bug
//                 </motion.button>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* Resizer */}
//         {isSidebarOpen && (
//           <div
//             onMouseDown={() => setIsDragging(true)}
//             className="w-2 cursor-col-resize hover:bg-slate-700 bg-transparent"
//           />
//         )}

//         {/* Collapsible AI Sidebar */}
//         <AnimatePresence>
//           {isSidebarOpen && (
//             <motion.aside
//               key="sidebar"
//               initial={{ x: 400, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               exit={{ x: 400, opacity: 0 }}
//               transition={{ type: "spring", stiffness: 120, damping: 15 }}
//               style={{ width: sidebarWidth }}
//               className="bg-slate-800 border-l border-slate-700 shadow-xl p-4 flex-shrink-0 flex flex-col relative"
//             >
//               <button
//                 onClick={() => setIsSidebarOpen(false)}
//                 className="absolute top-3 right-3 bg-slate-700/50 hover:bg-slate-700 p-1.5 rounded-md transition"
//               >
//                 <X size={18} />
//               </button>
//               <AISidebar ref={aiRef} aiHandler={geminiAiHandler} />
//             </motion.aside>
//           )}
//         </AnimatePresence>

//         {/* Floating AI Button */}
//         {!isSidebarOpen && (
//           <motion.button
//             key="aibutton"
//             onClick={() => setIsSidebarOpen(true)}
//             initial={{ opacity: 0, scale: 0 }}
//             animate={{ opacity: 1, scale: 1 }}
//             whileHover={{ scale: 1.1, boxShadow: "0 0 20px #6366f1aa" }}
//             whileTap={{ scale: 0.95 }}
//             transition={{ type: "spring", stiffness: 200, damping: 12 }}
//             className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 text-black hover:shadow-2xl transition-all z-50 flex items-center justify-center"
//           >
//             <MessageSquareCode size={26} />
//           </motion.button>
//         )}
//       </main>
//     </div>
//   );
// };

// export default CodeEditorPage2;


import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareCode, X, ChevronDown, Play } from "lucide-react";
import AISidebar from "../components/AISidebar";
import { useAuth } from "../context/AuthContext.jsx";
import { initVimMode } from "monaco-vim";

// API helper
const logRunToDatabase = async (runData) => {
  try {
    await fetch("http://localhost:4000/auth/log-run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(runData),
    });
  } catch (err) {
    console.error("Failed to log run:", err);
  }
};

const CodeEditorPage2 = ({
  language = "python",
  code = "",
  stdin = "",
  output = "",
  onUpdate = () => {},
}) => {
  // Editor State
  const [currentLang, setCurrentLang] = useState(language);
  const [currentCode, setCurrentCode] = useState(code);
  const [currentInput, setCurrentInput] = useState(stdin);
  const [currentOutput, setCurrentOutput] = useState(output);
  const [loading, setLoading] = useState(false);
  
  // Visibility State
  const [showOutputPanel, setShowOutputPanel] = useState(false);

  // Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const containerRef = useRef(null);
  const aiRef = useRef(null);
  const { user } = useAuth();

  // Vim State
  const [isVimMode, setIsVimMode] = useState(false);
  const editorRef = useRef(null);
  const statusBarRef = useRef(null);
  const vimModeRef = useRef(null);

  // Sync props
  useEffect(() => setCurrentLang(language), [language]);
  useEffect(() => setCurrentCode(code), [code]);
  useEffect(() => setCurrentInput(stdin), [stdin]);
  useEffect(() => setCurrentOutput(output), [output]);

  // Sidebar Resizing
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(300, rect.right - e.clientX);
      const maxWidth = Math.max(400, rect.width - 400);
      setSidebarWidth(Math.min(maxWidth, newWidth));
    };
    const stopDrag = () => setIsDragging(false);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [isDragging]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // Vim Mode Toggle
  useEffect(() => {
    if (!editorRef.current) return;
    if (isVimMode) {
      if (vimModeRef.current) vimModeRef.current.dispose();
      vimModeRef.current = initVimMode(editorRef.current, statusBarRef.current);
    } else {
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
      if (statusBarRef.current) statusBarRef.current.innerHTML = "";
    }
  }, [isVimMode]);

  useEffect(() => {
    return () => {
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
    };
  }, []);

  const runCode = async () => {
    setLoading(true);
    setShowOutputPanel(true); // Show output on run
    setCurrentOutput("Running...");
    onUpdate?.({ output: "Running..." });

    let result = "";
    let isError = false;
    let errorOutput = "";

    try {
      const res = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: currentLang,
        version: "*",
        files: [{ name: "main", content: currentCode }],
        stdin: currentInput,
      });

      const stdout = res.data.run?.stdout?.trim();
      const stderr = res.data.run?.stderr?.trim();
      const compileErr = res.data.compile?.stderr?.trim();
      errorOutput = stderr || compileErr;
      isError = !!errorOutput;
      result = isError ? `Compiler Error:\n${errorOutput}` : stdout || "No output";
    } catch (err) {
      isError = true;
      errorOutput = "⚠ Internal Error running code.";
      result = errorOutput;
    } finally {
      setLoading(false);
      setCurrentOutput(result);
      onUpdate?.({ output: result });

      if (user) {
        logRunToDatabase({
          isSuccess: !isError,
          error: isError ? errorOutput.split("\n")[0].trim() : null,
          language: currentLang,
          code: currentCode,
        });
      }
    }
  };

  const geminiAiHandler = async (text) => {
    try {
      const response = await fetch("http://localhost:4000/auth/ask-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return { answer: data.answer };
    } catch (error) {
      return { answer: `Connection error: ${error.message}` };
    }
  };

  const handleExplainError = () => {
    setIsSidebarOpen(true);
    if (aiRef.current?.ask) {
      const aiPrompt = `Help me fix this error:\nCode:\n${currentCode}\nError:\n${currentOutput}`;
      aiRef.current.ask(aiPrompt);
    }
  };

  // Handlers
  const handleChange = (val) => { setCurrentCode(val || ""); onUpdate?.({ code: val || "" }); };
  const handleLangChange = (e) => { setCurrentLang(e.target.value); onUpdate?.({ language: e.target.value }); };
  const handleInputChange = (e) => { setCurrentInput(e.target.value); onUpdate?.({ stdin: e.target.value }); };

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col pt-6 overflow-hidden">
      <main ref={containerRef} className="flex-1 flex overflow-hidden p-4 gap-4 relative">
        
        {/* --- LEFT SECTION: Editor & IO --- */}
        <div className="flex-1 flex flex-col min-w-0 h-full gap-4">
          
          {/* 1. EDITOR PANEL (Takes remaining height) */}
          <div className="flex-1 flex flex-col bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50 relative z-10">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-slate-800/80 backdrop-blur px-4 py-3 border-b border-slate-700/50 shrink-0">
               <h1 className="text-sm font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                 Coding IDE Powered with AI Buddy
               </h1>

               <div className="flex items-center gap-3">
                 {/* Vim Checkbox */}
                 <label className="flex items-center gap-2 cursor-pointer bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/50 hover:border-slate-600 transition">
                   <input
                     type="checkbox"
                     checked={isVimMode}
                     onChange={(e) => setIsVimMode(e.target.checked)}
                     className="w-3 h-3 rounded border-slate-600 text-cyan-500 focus:ring-0 bg-slate-800"
                   />
                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Vim Mode</span>
                 </label>

                 <select
                   value={currentLang}
                   onChange={handleLangChange}
                   className="bg-slate-900 text-white text-xs border border-slate-700 rounded-lg px-2 py-1.5 outline-none focus:border-cyan-500 transition"
                 >
                   <option value="python">Python</option>
                   <option value="javascript">JavaScript</option>
                   <option value="cpp">C++</option>
                   <option value="java">Java</option>
                   <option value="go">Go</option>

                 </select>

                 <button
                   onClick={runCode}
                   disabled={loading}
                   className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-lg transition-all active:scale-95 ${
                     loading ? "bg-emerald-900/50 text-emerald-200" : "bg-emerald-600 hover:bg-emerald-500 text-white"
                   }`}
                 >
                    {loading ? "Running..." : <><Play size={10} fill="currentColor"/> Run</>}
                 </button>
               </div>
            </div>

            {/* Monaco Editor */}
            <div className="relative flex-1 bg-[#1e1e1e] min-h-0">
              <Editor
                height="100%"
                theme="vs-dark"
                language={currentLang}
                value={currentCode}
                onChange={handleChange}
                onMount={handleEditorMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
            
            {/* Vim Status Bar (Visible only when Vim Mode is ON) */}
            <div 
              ref={statusBarRef} 
              className={`bg-slate-800 text-white text-xs font-bold font-mono px-3 py-1 border-t border-slate-700/50 ${isVimMode ? 'block' : 'hidden'}`}
              style={{ minHeight: '26px' }} 
            />
          </div>

          {/* 2. BOTTOM PANEL (Fixed Height: 200px) */}
          {/* Input is always visible. Output slides in. */}
          <div className="h-48 flex gap-4 shrink-0 overflow-hidden">
            
            {/* INPUT PANEL (Always Visible) */}
            <motion.div 
              layout
              className="flex flex-col bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg h-full"
              animate={{ width: showOutputPanel ? "50%" : "100%" }} // Shrinks to 50% if output is open
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            >
              <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700/50">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Input (Stdin)</span>
              </div>
              <textarea
                value={currentInput}
                onChange={handleInputChange}
                className="flex-1 w-full p-3 bg-transparent text-slate-300 text-sm font-mono resize-none outline-none focus:bg-slate-800/50 transition custom-scrollbar"
                placeholder="Enter input for your code here..."
              />
            </motion.div>

            {/* OUTPUT PANEL (Conditionally Visible) */}
            <AnimatePresence>
              {showOutputPanel && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "50%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="flex flex-col bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg h-full relative"
                >
                  <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700/50 flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Output</span>
                    <div className="flex gap-2 items-center">
                        <button onClick={() => setShowOutputPanel(false)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-700"><X size={12} /></button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-3 overflow-auto font-mono text-sm custom-scrollbar bg-slate-900/30">
                     {currentOutput ? (
                       <pre className={`${currentOutput.startsWith("Compiler Error") || currentOutput.startsWith("⚠") ? "text-rose-400" : "text-emerald-400"}`}>
                         {currentOutput}
                       </pre>
                     ) : (
                       <div className="h-full flex items-center justify-center text-slate-600 italic text-xs">
                         Waiting for output...
                       </div>
                     )}
                  </div>

                  {/* Quick Fix AI Button */}
                  {(currentOutput.startsWith("Compiler Error") || currentOutput.startsWith("⚠")) && (
                      <motion.button
                        onClick={handleExplainError}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute bottom-3 right-3 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
                      >
                        <MessageSquareCode size={14} /> Neutralize the Bug
                      </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Resizer Handle */}
        {isSidebarOpen && (
          <div
            onMouseDown={() => setIsDragging(true)}
            className="w-1 cursor-col-resize hover:bg-cyan-500/30 rounded-full transition-colors"
          />
        )}

        {/* --- RIGHT SECTION: AI Sidebar --- */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: sidebarWidth, 
                opacity: 1, 
                transition: { type: "spring", stiffness: 200, damping: 25 }
              }}
              exit={{ 
                width: 0, 
                opacity: 0, 
                transition: { duration: 0.2 }
              }}
              className="flex-shrink-0 h-full rounded-2xl shadow-2xl border border-slate-700/50 bg-slate-900 overflow-hidden"
            >
              <div style={{ width: sidebarWidth }} className="h-full"> 
                 <AISidebar
                    ref={aiRef}
                    aiHandler={geminiAiHandler}
                    onClose={() => setIsSidebarOpen(false)}
                  />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Floating AI Button */}
        {!isSidebarOpen && (
          <motion.button
            layoutId="ai-trigger"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-8 right-8 p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/20 z-50 hover:scale-105 transition-transform"
          >
            <MessageSquareCode size={24} />
          </motion.button>
        )}
      </main>
    </div>
  );
};

export default CodeEditorPage2;