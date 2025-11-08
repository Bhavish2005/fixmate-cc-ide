// fourth Improvement

// import React, { useState, useEffect, useRef } from "react";
// import Editor from "@monaco-editor/react";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import { MessageSquareCode, X } from "lucide-react";
// import AISidebar from "../components/AISidebar";

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

//   // ▶ Run code
//   const runCode = async () => {
//     setLoading(true);
//     setCurrentOutput("Running...");
//     onUpdate?.({ output: "Running..." });

//     try {
//       const res = await axios.post("https://emkc.org/api/v2/piston/execute", {
//         language: currentLang,
//         version: "*",
//         files: [{ name: "main", content: currentCode }],
//         stdin: currentInput,
//       });

//       const stdout = res.data.run?.stdout?.trim();
//       const stderr = res.data.run?.stderr?.trim();
      
//       // Also check for Piston's own compile error structure
//       const compileErr = res.data.compile?.stderr?.trim();
//       const error = stderr || compileErr;
      
//       const result = error
//         ? `Compiler Error:\n${error}` // Use 'Compiler Error' for both
//         : stdout || "No output";

//       setCurrentOutput(result);
//       onUpdate?.({ output: result });
//     } catch (err) {
//       console.error("Error running code:", err);
//       const errMsg = "⚠ Internal Error running code. Check Piston API or network.";
//       setCurrentOutput(errMsg);
//       onUpdate?.({ output: errMsg });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- CHANGE 1: ADD THE API HANDLER FUNCTION ---
//   /**
//    * This function calls your Node.js backend, which then calls Gemini.
//    */
//   const geminiAiHandler = async (text) => {
//     try {
//       // Make sure this URL matches your backend route
//       const response = await fetch("http://localhost:4000/auth/ask-buddy", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ prompt: text }), // Send the user's prompt
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       // Return the answer in the format AISidebar expects
//       return { answer: data.answer };
//     } catch (error) {
//       console.error("Failed to fetch from backend:", error);
//       // Return a user-friendly error message
//       return {
//         answer: `Sorry, I couldn't connect to the Debug-Buddy service. \n${error.message}`,
//       };
//     }
//   };
  
//   // --- CHANGE 3: CREATE A DEDICATED EXPLAIN ERROR HANDLER ---
// //   const handleExplainError = () => {
// //     setIsSidebarOpen(true); // 1. Open the sidebar
    
// //     // 2. Check if the AI ref and its explainError method exist
// //     if (aiRef.current && typeof aiRef.current.explainError === 'function') {
// //       // 3. Send the current error output to the AI sidebar
// //       // The sidebar will then show this error and its explanation
// //       aiRef.current.explainError(currentOutput);
// //     } else {
// //       console.warn('AI Sidebar ref not ready or explainError not found.');
// //     }
// //   };

// // --- REPLACE your old 'handleExplainError' with this ---

//   const handleExplainError = () => {
//     // 1. Open the sidebar
//     setIsSidebarOpen(true); 

//     // 2. Check if the AI ref and its 'ask' method exist
//     if (aiRef.current && typeof aiRef.current.ask === 'function') {
      
//       // 3. Create a detailed prompt for the AI
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
      
//       // 4. Send this full prompt to the AI's 'ask' method.
//       // This will trigger the geminiAiHandler and show the "Thinking..." state.
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
//           {/* Toolbar */}
//           <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-t-lg px-4 py-2">
//             <div className="flex items-center gap-4">
//               <div>
//                 <h1 className="text-base font-semibold bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
//                   Build & Fix, Faster
//                 </h1>
//                 <p className="text-xs text-slate-400">
//                   Write and debug your code with a smart AI Buddy right beside
//                   you.
//                 </p>
//               </div>

//               {/* Language Dropdown */}
//               <select
//                 value={currentLang}
//                 onChange={handleLangChange}
//                 className="bg-slate-800 text-white text-sm border border-slate-700 rounded-md px-2 py-1"
//               >
//                 <option value="python">Python</option>
//                 <option value="javascript">JavaScript</option>
//                 <option value="cpp">C++</option>
//                 <option value="c">C</option>
//                 <option value="java">Java</option>
//               </select>
//             </div>

//             {/* Run Button */}
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

//           {/* Editor */}
//           <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800 border-x border-b border-slate-700 rounded-b-lg overflow-hidden">
//             <Editor
//               height="60vh"
//               theme="vs-dark"
//               language={currentLang}
//               value={currentCode}
//               onChange={handleChange}
//               options={{
//                 minimap: { enabled: false },
//                 fontSize: 15,
//                 automaticLayout: true,
//               }}
//             />
//           </div>

//           {/* Input */}
//           <div className="mt-4 bg-slate-800 border border-slate-700 p-3 rounded-md">
//             <h3 className="font-semibold text-blue-400 mb-2">Input (stdin):</h3>
//             <textarea
//               value={currentInput}
//               onChange={handleInputChange}
//               placeholder="Enter input values here..."
//               className="w-full h-20 p-2 rounded-md bg-slate-900 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Output */}
//           <div className="mt-4 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
//             <div className="flex items-center justify-between mb-2">
//               <div className="text-xs text-slate-300 font-medium">Output</div>
//               {currentOutput && (
//                 <div className="text-xs text-slate-400">
//                   {new Date().toLocaleTimeString()}
//                 </div>
//               )}
//             </div>

//             <div className="min-h-[56px] max-h-40 overflow-auto p-2 bg-slate-800 rounded text-slate-200">
//               {currentOutput ? (
//                 <div
//                   className={`whitespace-pre-wrap ${
//                     currentOutput.startsWith("Compiler Error") || currentOutput.startsWith("⚠")
//                       ? "text-red-400"
//                       : "text-green-400"
//                   }`}
//                 >
//                   {currentOutput}
//                 </div>
//               ) : (
//                 <div className="text-slate-400">
//                   No output yet. Click Run to execute.
//                 </div>
//               )}
//             </div>

//             {/* 🧠 Wrapper for Centering the Button */}
//             {(currentOutput.startsWith("Compiler Error") ||
//               currentOutput.startsWith("Runtime Error") || // Keep this for future
//               currentOutput.startsWith("⚠")) && ( // Catch internal errors too
//               <div className="mt-3 flex justify-center">
//                 <motion.button
//                   // --- CHANGE 4: UPDATE THE ONCLICK HANDLER ---
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
//               {/* --- CHANGE 2: PASS THE HANDLER AS A PROP --- */}
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
import { MessageSquareCode, X } from "lucide-react";
import AISidebar from "../components/AISidebar";
import { useAuth } from "../context/AuthContext.jsx";
import { initVimMode } from "monaco-vim";

// API helper to log runs
const logRunToDatabase = async (runData) => {
  try {
    await fetch("http://localhost:4000/auth/log-run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Sends the auth cookie
      body: JSON.stringify(runData),
    });
    console.log("Run logged to DB.");
  } catch (err) {
    console.error("Failed to log run to DB:", err);
  }
};

// Helper to parse error category
const parseErrorCategory = (errMsg) => {
  const lowerMsg = errMsg.toLowerCase();
  if (lowerMsg.includes("syntaxerror")) return "Syntax";
  if (lowerMsg.includes("typeerror")) return "Runtime";
  if (lowerMsg.includes("referenceerror")) return "Runtime";
  if (lowerMsg.includes("compiler error")) return "Compiler";
  return "Runtime"; // Default
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

  // Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const containerRef = useRef(null);
  const aiRef = useRef(null);
  const { user } = useAuth(); // Get user from context

  const [isVimMode, setIsVimMode] = useState(false); // State to toggle Vim
  const editorRef = useRef(null); // Ref to store the editor instance


  const statusBarRef = useRef(null); // 👈 ADD THIS REF
  const vimModeRef = useRef(null); // 👈 ADD THIS REF

  // Sync props
  useEffect(() => setCurrentLang(language), [language]);
  useEffect(() => setCurrentCode(code), [code]);
  useEffect(() => setCurrentInput(stdin), [stdin]);
  useEffect(() => setCurrentOutput(output), [output]);

  // Sidebar resizing
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(280, rect.right - e.clientX);
      const maxWidth = Math.max(320, rect.width - 200);
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

  // const handleEditorMount = (editor, monaco) => {
  //   // If a Vim instance already exists, dispose of it
  //   if (vimModeRef.current) {
  //     vimModeRef.current.dispose();
  //   }
    
  //   // Ensure the status bar element exists before initializing
  //   if (statusBarRef.current) {
  //     // Clear any previous status
  //     statusBarRef.current.innerHTML = '';
      
  //     // Initialize Vim mode, passing the editor and status bar
  //     vimModeRef.current = initVimMode(editor, statusBarRef.current);
  //   } else {
  //     // Fallback if status bar isn't ready (less ideal)
  //     vimModeRef.current = initVimMode(editor, null);
  //   }
  // };
  // AFTER
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor; // Save the editor instance
    // Initial setup (Vim is off by default)
  };

  // --- 👇 ADD THIS NEW EFFECT ---
  // Effect to toggle Vim mode
  useEffect(() => {
    if (!editorRef.current) return; // Editor not mounted yet

    if (isVimMode) {
      // Enable Vim
      if (vimModeRef.current) vimModeRef.current.dispose(); // Clean up just in case
      vimModeRef.current = initVimMode(editorRef.current, statusBarRef.current);
    } else {
      // Disable Vim
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
      if (statusBarRef.current) {
        statusBarRef.current.innerHTML = ''; // Clear status bar
      }
    }
  }, [isVimMode]); // This effect re-runs whenever isVimMode changes
// --- END OF ADD ---

  // 👇 ADD THIS EFFECT FOR CLEANUP
  useEffect(() => {
    // This function runs when the component unmounts
    return () => {
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
    };
  }, []);

  // ▶ Run code
  const runCode = async () => {
    setLoading(true);
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
      
      errorOutput = stderr || compileErr; // Store the raw error
      isError = !!errorOutput; // Check if an error occurred
      
      result = isError
        ? `Compiler Error:\n${errorOutput}`
        : stdout || "No output";

    } catch (err) {
      console.error("Error running code:", err);
      isError = true; // The API call itself failed
      errorOutput = "⚠ Internal Error running code. Check Piston API or network.";
      result = errorOutput;

    } finally {
      setLoading(false);
      setCurrentOutput(result);
      onUpdate?.({ output: result });

      // Log the run
      if (user) { // Only log if user is logged in
        if (isError) {
          logRunToDatabase({
            isSuccess: false,
            error: errorOutput.split('\n')[0].trim(), // Get clean first line
            category: parseErrorCategory(errorOutput),
            language: currentLang,
            code: currentCode,
          });
        } else {
          // Log success
          logRunToDatabase({
            isSuccess: true,
            language: currentLang,
            code: currentCode,
          });
        }
      }
    }
  }; // end of runCode


  const geminiAiHandler = async (text) => {
    try {
      const response = await fetch("http://localhost:4000/auth/ask-buddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: text }), 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { answer: data.answer };
    } catch (error) {
      console.error("Failed to fetch from backend:", error);
      return {
        answer: `Sorry, I couldn't connect to the Debug-Buddy service. \n${error.message}`,
      };
    }
  };

  const handleExplainError = () => {
    setIsSidebarOpen(true); 
    if (aiRef.current && typeof aiRef.current.ask === 'function') {
      const aiPrompt = `
I encountered an error. Can you help me understand what's wrong and how to fix it?

My Code (${currentLang}):
\`\`\`${currentLang}
${currentCode}
\`\`\`

My Input (stdin):
\`\`\`
${currentInput || "(No input provided)"}
\`\`\`

The Error Output:
\`\`\`
${currentOutput}
\`\`\`
`;
      aiRef.current.ask(aiPrompt);
    } else {
      console.warn('AI Sidebar ref not ready or ask() method not found.');
    }
  };

  // Handlers
  const handleChange = (val) => {
    const updated = val || "";
    setCurrentCode(updated);
    onUpdate?.({ code: updated });
  };

  const handleLangChange = (e) => {
    const lang = e.target.value;
    setCurrentLang(lang);
    onUpdate?.({ language: lang });
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setCurrentInput(val);
    onUpdate?.({ stdin: val });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden pt-10">
      <main ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Code Editor Section */}
        <section className="flex-1 p-4 min-w-0 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-t-lg px-4 py-2">
          {/* Left Side: Title */}
          <div>
            <h1 className="text-base font-semibold bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Build & Fix, Faster
            </h1>
            <p className="text-xs text-slate-400">
              Write and debug your code with a smart AI Buddy right beside you.
            </p>
          </div>

          {/* Right Side: Controls (NEW WRAPPER) */}
          <div className="flex items-center gap-4">
            {/* Vim Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="vim-toggle"
                checked={isVimMode}
                onChange={(e) => setIsVimMode(e.target.checked)}
                className="w-4 h-4 bg-slate-700 border-slate-600 rounded text-cyan-500 focus:ring-cyan-500 cursor-pointer"
              />
              <label
                htmlFor="vim-toggle"
                className="text-sm font-medium text-slate-300 cursor-pointer select-none"
              >
                Vim Mode
              </label>
            </div>

            {/* Language Dropdown (Moved) */}
            <select
              value={currentLang}
              onChange={handleLangChange}
              className="bg-slate-800 text-white text-sm border border-slate-700 rounded-md px-2 py-1"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
            </select>

            {/* Run Button (Moved) */}
            <button
              onClick={runCode}
              disabled={loading}
              aria-pressed={loading}
              className={`relative inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${
                loading
                  ? "bg-green-500 scale-95"
                  : "bg-green-600 hover:bg-green-500"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeOpacity="0.15"
                      strokeWidth="4"
                    />
                    <path
                      d="M22 12a10 10 0 00-10-10"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3v18l15-9L5 3z" fill="white" />
                  </svg>
                  Run
                </>
              )}
            </button>
          </div>
        </div>

          {/* Editor */}
          <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800 border-x border-b border-slate-700 rounded-b-lg overflow-hidden">
            <Editor
              height="60vh"
              theme="vs-dark"
              language={currentLang}
              value={currentCode}
              onChange={handleChange}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                automaticLayout: true,
              }}
            />
            <div
            ref={statusBarRef}
            className="bg-slate-800 text-sm text-slate-300 px-3 py-1 border-t border-slate-700 font-mono"
          >
            {/* Vim status (e.g., --INSERT--) will appear here */}
          </div>
          </div>

          {/* Input */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">Input (stdin)</h3>
            <textarea
              value={currentInput}
              onChange={handleInputChange}
              placeholder="Enter input (stdin) for your code here..."
              className="w-full h-24 p-3 rounded-lg bg-slate-800/70 border border-slate-700 
                         text-slate-200 placeholder-slate-500 text-sm font-mono
                         focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            />
          </div>

          {/* Output */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-cyan-400">Output</h3>
              {currentOutput && (
                <div className="text-xs text-slate-400">
                  {new Date().toLocaleTimeString()}
                </div>
              )}
            </div>
            
            <div className="min-h-[80px] max-h-48 overflow-auto p-3 rounded-lg bg-slate-800/70 
                           border border-slate-700 text-sm font-mono shadow-inner">
              {currentOutput ? (
                <pre
                  className={`whitespace-pre-wrap ${
                    currentOutput.startsWith("Compiler Error") || currentOutput.startsWith("⚠")
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {currentOutput}
                </pre>
              ) : (
                <div className="text-slate-500 italic">
                  No output yet. Click Run to execute.
                </div>
              )}
            </div>

            {/* Neutralize Button */}
            {(currentOutput.startsWith("Compiler Error") ||
              currentOutput.startsWith("Runtime Error") ||
              currentOutput.startsWith("⚠")) && (
              <div className="mt-3 flex justify-center">
                <motion.button
                  onClick={handleExplainError}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 w-48 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 rounded-md text-white font-medium shadow-md hover:shadow-lg transition"
                >
                  Neutralize the Bug
                </motion.button>
              </div>
            )}
          </div>
        </section>

        {/* Resizer */}
        {isSidebarOpen && (
          <div
            onMouseDown={() => setIsDragging(true)}
            className="w-2 cursor-col-resize hover:bg-slate-700 bg-transparent"
          />
        )}

        {/* Collapsible AI Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              style={{ width: sidebarWidth }}
              className="bg-slate-800 border-l border-slate-700 shadow-xl p-4 flex-shrink-0 flex flex-col relative"
            >
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-3 right-3 bg-slate-700/50 hover:bg-slate-700 p-1.5 rounded-md transition"
              >
                <X size={18} />
              </button>
              <AISidebar ref={aiRef} aiHandler={geminiAiHandler} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Floating AI Button */}
        {!isSidebarOpen && (
          <motion.button
            key="aibutton"
            onClick={() => setIsSidebarOpen(true)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, boxShadow: "0 0 20px #6366f1aa" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 text-black hover:shadow-2xl transition-all z-50 flex items-center justify-center"
          >
            <MessageSquareCode size={26} />
          </motion.button>
        )}
      </main>
    </div>
  );
};

export default CodeEditorPage2;