// import React, { useState, useEffect } from "react";
// import Editor from "@monaco-editor/react";
// import axios from "axios";
// import { socket } from "../socket"; 

// const CodeEditor = ({ language, code, stdin, output, onUpdate, roomId, userName }) => {
//   const [currentLang, setCurrentLang] = useState(language);
//   const [currentCode, setCurrentCode] = useState(code);
//   const [currentInput, setCurrentInput] = useState(stdin);
//   const [currentOutput, setCurrentOutput] = useState(output);
//   const [loading, setLoading] = useState(false);

//   // Sync props on change
//   useEffect(() => setCurrentLang(language), [language]);
//   useEffect(() => setCurrentCode(code), [code]);
//   useEffect(() => setCurrentInput(stdin), [stdin]);
//   useEffect(() => setCurrentOutput(output), [output]);

//   // ✅ Join room on mount
//   useEffect(() => {
//     if (!roomId) return;
//     socket.emit("join-room", { roomId, userName });
//     console.log(`Joined room: ${roomId}`);

//     // ✅ Listen for incoming code updates
//     socket.on("code-update", (newCode) => {
//       setCurrentCode(newCode);
//       onUpdate({ code: newCode });
//     });

//     return () => socket.off("code-update");
//   }, [roomId, userName, onUpdate]);

//   // ▶ Run code
//   const runCode = async () => {
//     setLoading(true);
//     setCurrentOutput("Running...");
//     onUpdate({ output: "Running..." });

//     try {
//       const res = await axios.post("https://emkc.org/api/v2/piston/execute", {
//         language: currentLang,
//         version: "*",
//         files: [{ name: "main", content: currentCode }],
//         stdin: currentInput,
//       });

//       const result = res.data.run?.output || "No output";
//       setCurrentOutput(result);
//       onUpdate({ output: result });
//     } catch {
//       setCurrentOutput("⚠ Error running code");
//       onUpdate({ output: "⚠ Error running code" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✏ Handlers
//   const handleChange = (val) => {
//     const updated = val || "";
//     setCurrentCode(updated);
//     onUpdate({ code: updated });
//     socket.emit("code-change", { roomId, code: updated }); // ✅ broadcast change
//   };

//   const handleLangChange = (e) => {
//     const lang = e.target.value;
//     setCurrentLang(lang);
//     onUpdate({ language: lang });
//   };

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setCurrentInput(val);
//     onUpdate({ stdin: val });
//   };

//   return (
//     <div className="flex flex-col h-full bg-gray-900 text-white p-2 rounded-lg border border-gray-700">
//       {/* Toolbar */}
//       <div className="flex items-center justify-between mb-2">
//         <select
//           value={currentLang}
//           onChange={handleLangChange}
//           className="bg-gray-800 border border-gray-700 text-white px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-blue-500 w-28"
//         >
//           <option value="python">Python</option>
//           <option value="javascript">JavaScript</option>
//           <option value="cpp">C++</option>
//           <option value="c">C</option>
//           <option value="java">Java</option>
//         </select>

//         <button
//           onClick={runCode}
//           disabled={loading}
//           className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm text-white font-medium disabled:opacity-50 w-17 cursor-pointer"
//         >
//           {loading ? "⏳" : "Run"}
//         </button>
//       </div>

//       {/* Editor */}
//       <div className="flex-1 border border-gray-700 rounded-lg overflow-hidden">
//         <Editor
//           height="100vh"
//           theme="vs-dark"
//           language={currentLang}
//           value={currentCode}
//           onChange={handleChange}
//           options={{
//             minimap: { enabled: false },
//             fontSize: 15,
//             automaticLayout: true,
//           }}
//         />
//       </div>

//       {/* Input */}
//       <div className="mt-3 bg-gray-800 border border-gray-700 p-3 rounded-md">
//         <h3 className="font-semibold text-blue-400 mb-2">Input (stdin):</h3>
//         <textarea
//           value={currentInput}
//           onChange={handleInputChange}
//           placeholder="Enter input values here..."
//           className="w-full h-20 p-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {/* Output */}
//       {currentOutput && currentOutput.trim() !== "" && (
//         <div className="mt-3 bg-gray-800 border border-gray-700 p-3 rounded-md">
//           <h3 className="font-semibold text-blue-400 mb-2">Output:</h3>
//           <pre className="text-sm whitespace-pre-wrap">{currentOutput}</pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CodeEditor;
// import React, { useState } from "react"; // ❌ No useEffect
// import Editor from "@monaco-editor/react";
// import axios from "axios";
// // ❌ No socket import needed

// // ✅ Props are now 'page' and 'onUpdate'
// const CodeEditor = ({ page, onUpdate }) => {
//   // ✅ Destructure props for easy access
//   const { language, code, stdin, output } = page;

//   // ✅ The only local state we need is for the "loading" spinner
//   const [loading, setLoading] = useState(false);

//   // ❌ All local state for code, lang, input, output is GONE.
//   // ❌ All useEffect hooks (sessionStorage, socket listeners) are GONE.

//   // ▶️ Run code
//   const runCode = async () => {
//     setLoading(true);
//     // ✅ Send "Running..." up to RoomPage
//     onUpdate({ output: "Running..." });

//     try {
//       const res = await axios.post("https://emkc.org/api/v2/piston/execute", {
//         language: language, // Use prop
//         version: "*",
//         files: [{ name: "main", content: code }], // Use prop
//         stdin: stdin, // Use prop
//       });

//       const result = res.data.run?.output || "No output";
//       // ✅ Send result up to RoomPage
//       onUpdate({ output: result });
//     } catch {
//       const errorMsg = "⚠️ Error running code";
//       // ✅ Send error up to RoomPage
//       onUpdate({ output: errorMsg });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----------------------------------------------------
//   // 🧠 Handlers now just call onUpdate()
//   // ----------------------------------------------------

//   const handleChange = (val) => {
//     onUpdate({ code: val || "" });
//   };

//   const handleLangChange = (e) => {
//     onUpdate({ language: e.target.value });
//   };

//   const handleInputChange = (e) => {
//     onUpdate({ stdin: e.target.value });
//   };

//   return (
//     <div className="flex flex-col h-full bg-gray-900 text-white p-2 rounded-lg border border-gray-700">
//       {/* Toolbar */}
//       <div className="flex items-center justify-between mb-2">
//         <select
//           value={language} // ✅ Use prop
//           onChange={handleLangChange} // ✅ Use new handler
//           className="bg-gray-800 border border-gray-700 text-white px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-blue-500 w-28"
//         >
//           <option value="python">Python</option>
//           <option value="javascript">JavaScript</option>
//           <option value="cpp">C++</option>
//           <option value="c">C</option>
//           <option value="java">Java</option>
//         </select>

//         <button
//           onClick={runCode}
//           disabled={loading}
//           className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm text-white font-medium disabled:opacity-50 w-17 cursor-pointer"
//         >
//           {loading ? "⏳" : "Run"}
//         </button>
//       </div>

//       {/* Editor */}
//       <div className="flex-1 border border-gray-700 rounded-lg overflow-hidden">
//         <Editor
//           height="100vh"
//           theme="vs-dark"
//           language={language} // ✅ Use prop
//           value={code} // ✅ Use prop
//           onChange={handleChange} // ✅ Use new handler
//           options={{
//             minimap: { enabled: false },
//             fontSize: 15,
//             automaticLayout: true,
//           }}
//         />
//       </div>

//       {/* Input */}
//       <div className="mt-3 bg-gray-800 border border-gray-700 p-3 rounded-md">
//         <h3 className="font-semibold text-blue-400 mb-2">Input (stdin):</h3>
//         <textarea
//           value={stdin} // ✅ Use prop
//           onChange={handleInputChange} // ✅ Use new handler
//           placeholder="Enter input values here..."
//           className="w-full h-20 p-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {/* Output */}
//       {/* ✅ Use output prop directly */}
//       {output && output.trim() !== "" && (
//         <div className="mt-3 bg-gray-800 border border-gray-700 p-3 rounded-md">
//           <h3 className="font-semibold text-blue-400 mb-2">Output:</h3>
//           <pre className="text-sm whitespace-pre-wrap">{output}</pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CodeEditor;


import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const CodeEditor = ({ page, onUpdate }) => {
  const { language, code, stdin, output } = page;
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    onUpdate({ output: "Running..." });

    try {
      const res = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: language,
        version: "*",
        files: [{ name: "main", content: code }],
        stdin: stdin,
      });

      const result = res.data.run?.output || "No output";
      onUpdate({ output: result });
    } catch {
      const errorMsg = "⚠️ Error running code";
      onUpdate({ output: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (val) => {
    onUpdate({ code: val || "" });
  };

  const handleLangChange = (e) => {
    onUpdate({ language: e.target.value });
  };

  const handleInputChange = (e) => {
    onUpdate({ stdin: e.target.value });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-2 rounded-lg border border-gray-700">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <select
          value={language}
          onChange={handleLangChange}
          className="bg-gray-800 border border-gray-700 text-white px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-blue-500 w-28"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="java">Java</option>
        </select>

        <button
  onClick={runCode}
  disabled={loading}
  // Added flex, items-center, justify-center, space-x-1, transition-colors
  // Changed w-17 to w-20 (a standard, better-fitting width)
  // Changed bg-green-400 to bg-green-500 for better contrast
  className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md text-sm text-white font-medium disabled:opacity-50 w-20 cursor-pointer transition-colors"
>
  {loading ? (
    "⏳"
  ) : (
    // Wrapped icon and text in a span with flex to align them
    <span className="flex items-center space-x-1">
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="currentColor" // Use currentColor to inherit text-white
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 3v18l15-9L5 3z" />
      </svg>
      <span>Run</span>
    </span>
  )}
</button>
      </div>

      {/* Editor */}
      <div className="flex-1 border border-gray-700 rounded-lg overflow-hidden">
        <Editor
          height="100%" /* 👈 MODIFIED: Changed from 100vh to 100% to fit container */
          theme="vs-dark"
          language={language}
          value={code}
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Input */}
      <div className="mt-3 bg-gray-800 border border-gray-700 p-3 rounded-md">
        <h3 className="font-semibold text-blue-400 mb-2">Input</h3>
        <textarea
          value={stdin}
          onChange={handleInputChange}
          placeholder="Enter input values here..."
          /* 👈 MODIFIED: Added resize-none to prevent user resizing */
          className="w-full h-20 p-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Output */}
      {output && output.trim() !== "" && (
        <div className="mt-3 bg-gray-800 border border-gray-700 p-3 rounded-md">
          <h3 className="font-semibold text-blue-400 mb-2">Output:</h3>
          {/* 👈 MODIFIED: Added max-h-32 and overflow-y-auto to make it scroll */}
          <pre className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;