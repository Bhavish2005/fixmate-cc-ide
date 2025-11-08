// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { Send, Smile } from "lucide-react";
// import "emoji-picker-element";

// // Replace this with your actual image URL
// const YOUR_IMAGE_URL_HERE = "https://img.freepik.com/free-vector/matrix-style-binary-code-digital-falling-numbers-blue-background_1017-37387.jpg"; // Example URL

// const ChatPanel = ({ roomId, userName, socket }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [showPicker, setShowPicker] = useState(false);
//   const messagesEndRef = useRef(null);
//   const pickerRef = useRef(null);
//   const smileBtnRef = useRef(null);

//   // 🧠 Load messages from sessionStorage
//   useEffect(() => {
//     const savedMessages = sessionStorage.getItem(`chat_${roomId}`);
//     if (savedMessages) {
//       try {
//         setMessages(JSON.parse(savedMessages));
//       } catch {
//         sessionStorage.removeItem(`chat_${roomId}`);
//       }
//     }
//   }, [roomId]);

//   // 💾 Save messages whenever they change
//   useEffect(() => {
//     sessionStorage.setItem(`chat_${roomId}`, JSON.stringify(messages));
//   }, [messages, roomId]);

//   // 🔽 Scroll to bottom on new messages
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };
//   useEffect(scrollToBottom, [messages]);

//   // 🛰 Listen for new messages
//   useEffect(() => {
//     if (!socket) return;
//     const handleReceiveMessage = (data) => {
//       setMessages((prev) => [...prev, { ...data, status: "delivered" }]);
//     };
//     socket.on("receive-message", handleReceiveMessage);
//     return () => socket.off("receive-message", handleReceiveMessage);
//   }, [socket]);

//   // ✨ Handle emoji selection
//   const onEmojiClick = useCallback(
//     (e) => {
//       setMessage((prev) => prev + e.detail.unicode);
//       setShowPicker(false);
//     },
//     []
//   );

//   // ✨ Add event listeners for picker
//   useEffect(() => {
//     if (!showPicker) return;

//     const picker = pickerRef.current;
//     const smileBtn = smileBtnRef.current;

//     const handleClickOutside = (e) => {
//       if (
//         picker &&
//         !picker.contains(e.target) &&
//         smileBtn &&
//         !smileBtn.contains(e.target)
//       ) {
//         setShowPicker(false);
//       }
//     };

//     if (picker) {
//       picker.addEventListener("emoji-click", onEmojiClick);
//     }
//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       if (picker) {
//         picker.removeEventListener("emoji-click", onEmojiClick);
//       }
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showPicker, onEmojiClick]);

//   // 💬 Send message
//   const sendMessage = () => {
//     if (!message.trim()) return;
//     const msgId = Date.now();
//     const msg = {
//       id: msgId,
//       roomId,
//       message,
//       userName,
//       time: new Date(),
//       status: "sending",
//     };

//     setMessages((prev) => [...prev, msg]);

//     socket.emit("send-message", msg, (ack) => {
//       if (ack?.status === "delivered") {
//         setMessages((prev) =>
//           prev.map((m) => (m.id === msgId ? { ...m, status: "delivered" } : m))
//         );
//       }
//     });

//     setMessage("");
//   };

//   // ⌨ Enter to send
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   // 🕒 Format time
//   const formatTime = (date) =>
//     new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

//   return (
//     <div
//       className="flex flex-col h-full text-white bg-cover bg-center"
//       style={{ backgroundImage: `url(${YOUR_IMAGE_URL_HERE})` }}
//     >
//       {/* --- 1. MODIFICATION HERE ---
//         Changed 'bg-gray-800' to 'bg-[#000e19]'
//       */}
//       <div className="p-4 border-b border-gray-700 bg-[#000e19]">
//         <h3 className="font-semibold">Team Chat</h3>
//         <p className="text-xs text-gray-400">Stay connected with your team</p>
//       </div>

//       {/* Messages (with overlay) */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
//         {messages.map((msg) => {
//           const isOwn = msg.userName === userName;
//           return (
//             <div
//               key={msg.id || Math.random()}
//               className={`flex items-start ${
//                 isOwn ? "justify-end" : "justify-start"
//               }`}
//             >
//               {/* Avatar */}
//               {!isOwn && (
//                 <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="text-xs font-semibold text-white">
//                     {msg.userName?.charAt(0).toUpperCase()}
//                   </span>
//                 </div>
//               )}

//               {/* --- 2. MODIFICATION HERE ---
//                 Added 'opacity-95' to the message bubble class
//               */}
//               <div
//                 className={`max-w-[70%] px-3 py-2 rounded-lg shadow-md opacity-80 ${
//                   isOwn
//                     ? "bg-blue-600 text-white rounded-br-none"
//                     : "bg-gray-700 text-gray-100 rounded-bl-none"
//                 }`}
//               >
//                 <div className="flex items-baseline justify-between mb-1">
//                   <span className="font-medium text-xs opacity-90">
//                     {msg.userName}
//                   </span>
//                   &nbsp;&nbsp;&nbsp;
//                   <span className="text-[10px] text-gray-300/80">
//                     {formatTime(msg.time)}
//                   </span>
//                 </div>
//                 <p className="text-sm break-words">{msg.message}</p>

//                 {/* Clock or Delivered indicator */}
//                 {isOwn && (
//                   <div className="text-right mt-1 text-[10px] text-gray-200/70">
//                     {msg.status === "sending" ? (
//                       <span className="inline-block animate-spin-slow opacity-80">
//                         🕓
//                       </span>
//                     ) : (
//                       <span className="opacity-80">✓</span>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {isOwn && (
//                 <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
//                   <span className="text-xs font-semibold text-white">
//                     {msg.userName?.charAt(0).toUpperCase()}
//                   </span>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input (retains its solid background for readability) */}
//       <div className="p-4 border-t border-gray-700 bg-[#000e19]">
//         <div className="flex items-center space-x-2">
//           <div className="flex-1 relative">
//             {/* Conditionally render picker */}
//             {showPicker && (
//               <div className="absolute bottom-14 right-0 z-10">
//                 <emoji-picker
//                   ref={pickerRef}
//                   style={{
//                     width: "250px",
//                     height: "300px",
//                     borderRadius: "8px",
//                     transform: "translateX(30px)",
//                     "--background-color": "#1f2937",
//                     "--category-label-color": "#9ca3af",
//                     "--indicator-color": "#3b82f6",
//                     "--outline-color": "transparent",
//                     "--search-background-color": "#374151",
//                     "--search-border-color": "#4b5563",
//                     "--input-border-color": "#4b5563",
//                     "--input-color": "#e5e7eb",
//                     "--secondary-background-color": "#374151",
//                   }}
//                 ></emoji-picker>
//               </div>
//             )}
//             <input
//               type="text"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Type your message..."
//               className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10 text-white placeholder-gray-400"
//             />
//             {/* Add ref and onClick to the smile button */}
//             <button
//               ref={smileBtnRef}
//               onClick={() => setShowPicker(!showPicker)}
//               className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
//             >
//               <Smile className="w-4 h-4" />
//             </button>
//           </div>
//           <button
//             onClick={sendMessage}
//             disabled={!message.trim()}
//             className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
//           >
//             <Send className="w-4 h-4 text-white" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatPanel;

// second improvement
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Smile } from "lucide-react";
import "emoji-picker-element";

// Replace this with your actual image URL
const YOUR_IMAGE_URL_HERE = "https://img.freepik.com/free-vector/matrix-style-binary-code-digital-falling-numbers-blue-background_1017-37387.jpg"; // Example URL

const ChatPanel = ({ roomId, userName, socket ,userId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const pickerRef = useRef(null);
  const smileBtnRef = useRef(null);

  // 🧠 Load messages from sessionStorage
  useEffect(() => {
    const savedMessages = sessionStorage.getItem(`chat_${roomId}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch {
        sessionStorage.removeItem(`chat_${roomId}`);
      }
    }
  }, [roomId]);

  // 💾 Save messages whenever they change
  useEffect(() => {
    sessionStorage.setItem(`chat_${roomId}`, JSON.stringify(messages));
  }, [messages, roomId]);

  // 🔽 Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // 🛰 Listen for new messages
  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, { ...data, status: "delivered" }]);
    };
    socket.on("receive-message", handleReceiveMessage);
    return () => socket.off("receive-message", handleReceiveMessage);
  }, [socket]);

  // ✨ Handle emoji selection
  const onEmojiClick = useCallback(
    (e) => {
      setMessage((prev) => prev + e.detail.unicode);
      setShowPicker(false);
    },
    []
  );

  // ✨ Add event listeners for picker
  useEffect(() => {
    if (!showPicker) return;

    const picker = pickerRef.current;
    const smileBtn = smileBtnRef.current;

    const handleClickOutside = (e) => {
      if (
        picker &&
        !picker.contains(e.target) &&
        smileBtn &&
        !smileBtn.contains(e.target)
      ) {
        setShowPicker(false);
      }
    };

    if (picker) {
      picker.addEventListener("emoji-click", onEmojiClick);
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      if (picker) {
        picker.removeEventListener("emoji-click", onEmojiClick);
      }
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker, onEmojiClick]);

  // 💬 Send message
  const sendMessage = () => {
    if (!message.trim()) return;
    const msgId = Date.now();
    // const userId=userId;
    const msg = {
      id: msgId,
      roomId,
      message,
      userId,
      userName,
       time: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, msg]);
    console.log("message sent:",msg);
    socket.emit("send-message", msg, (ack) => {
      if (ack?.status === "delivered") {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, status: "delivered" } : m))
        );
      }
    });

    setMessage("");
  };

  // ⌨ Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 🕒 Format time
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="flex flex-col h-full text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${YOUR_IMAGE_URL_HERE})` }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-[#000e19]">
        <h3 className="font-semibold">Team Chat</h3>
        <p className="text-xs text-gray-400">Stay connected with your team</p>
      </div>

      {/* Messages (with overlay) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
        {messages.map((msg) => {
          const isOwn = msg.userId === userId;
          return (
            <div
              key={msg.id || Math.random()}
              className={`flex items-start ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar */}
              {!isOwn && (
                // --- MODIFICATION 1: Added mr-2 for spacing ---
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                  <span className="text-xs font-semibold text-white">
                    {msg.userName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Message bubble */}
              <div
                // --- MODIFICATION 2: Changed opacity-80 to opacity-90 ---
                className={`max-w-[70%] px-3 py-2 rounded-lg shadow-md opacity-90 ${
                  isOwn
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-700 text-gray-100 rounded-bl-none"
                }`}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-medium text-xs opacity-90">
                    {msg.userName}
                  </span>
                  
                  {/* --- MODIFICATION 3: Removed &nbsp; --- */}
                  &nbsp;&nbsp;&nbsp;
                  <span className="text-[10px] text-gray-300/80">
                    {formatTime(msg.time)}
                  </span>
                </div>
                <p className="text-sm break-words">{msg.message}</p>

                {/* Clock or Delivered indicator */}
                {isOwn && (
                  <div className="text-right mt-1 text-[10px] text-gray-200/70">
                    {msg.status === "sending" ? (
                      <span className="inline-block animate-spin-slow opacity-80">
                        🕓
                      </span>
                    ) : (
                      <span className="opacity-90">✓</span>
                    )}
                  </div>
                )}
              </div>

              {/* Own Avatar (already had ml-2) */}
              {isOwn && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <span className="text-xs font-semibold text-white">
                    {msg.userName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {/* --- MODIFICATION 4: Matched header color --- */}
      <div className="p-4 border-t border-gray-700 bg-[#000e19]">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            {/* Conditionally render picker */}
            {showPicker && (
              <div className="absolute bottom-14 right-0 z-10">
                <emoji-picker
                  ref={pickerRef}
                  style={{
                    width: "250px",
                    height: "300px",
                    borderRadius: "8px",
                    transform: "translateX(30px)",
                    "--background-color": "#1f2937",
                    "--category-label-color": "#9ca3af",
                    "--indicator-color": "#3b82f6",
                    "--outline-color": "transparent",
                    "--search-background-color": "#374151",
                    "--search-border-color": "#4b5563",
                    "--input-border-color": "#4b5563",
                    "--input-color": "#e5e7eb",
                    "--secondary-background-color": "#374151",
                  }}
                ></emoji-picker>
              </div>
            )}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10 text-white placeholder-gray-400"
            />
            {/* Add ref and onClick to the smile button */}
            <button
              ref={smileBtnRef}
              onClick={() => setShowPicker(!showPicker)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;