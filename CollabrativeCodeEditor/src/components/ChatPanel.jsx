import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Smile } from "lucide-react";
import "emoji-picker-element";

const YOUR_IMAGE_URL_HERE =
  "https://img.freepik.com/free-vector/matrix-style-binary-code-digital-falling-numbers-blue-background_1017-37387.jpg";

const ChatPanel = ({ roomId, userName, socket, userId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const pickerRef = useRef(null);
  const smileBtnRef = useRef(null);


  useEffect(() => {
    const saved = sessionStorage.getItem(`chat_${roomId}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem(`chat_${roomId}`);
      }
    }
  }, [roomId]);

  // Save messages
  useEffect(() => {
    sessionStorage.setItem(`chat_${roomId}`, JSON.stringify(messages));
  }, [messages, roomId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Receive message
  useEffect(() => {
    if (!socket) return;
    const handleReceive = (data) => {
      setMessages((p) => [...p, { ...data, status: "delivered" }]);
    };

    socket.on("receive-message", handleReceive);
    return () => socket.off("receive-message", handleReceive);
  }, [socket]);

  // Emoji click handler
  const onEmojiClick = useCallback(
    (e) => {
      setMessage((prev) => prev + e.detail.unicode);
      setShowPicker(false);
    },
    []
  );

  // Outside click for emoji picker
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

    if (picker) picker.addEventListener("emoji-click", onEmojiClick);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      if (picker) picker.removeEventListener("emoji-click", onEmojiClick);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker, onEmojiClick]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const msgId = Date.now();

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

    socket.emit("send-message", msg, (ack) => {
      if (ack?.status === "delivered") {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, status: "delivered" } : m))
        );
      }
    });

    setMessage("");
  };

  // Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div 
      className=" flex flex-col h-full text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${YOUR_IMAGE_URL_HERE})` }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-[#000e19]">
        <h3 className="font-semibold">Team Chat</h3>
        <p className="text-xs text-gray-400">Stay connected with your team</p>
      </div>

      {/* Messages */}
      <div className="messages flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
        {messages.map((msg) => {
          const isOwn = msg.userId === userId;

          return (
            <div
              key={msg.id}
              className={`flex items-start ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar (left) */}
              {!isOwn && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs text-white font-semibold">
                    {msg.userName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`max-w-[70%] px-3 py-2 rounded-2xl shadow-md opacity-90 ${
                  isOwn ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
                }`}
              >
                {/* NAME + TIME IN GRID */}
                <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 gap-y-1 items-start">
                  <span className="font-medium text-[9px] opacity-90">
                    {msg.userName}
                  </span>

                  <div></div>

                  <span className="text-[10px] opacity-80">
                    {formatTime(msg.time)}
                  </span>
                </div>

  <div className="grid grid-cols-[1fr_auto] gap-y-1 mt-1 items-start">

    {/* MESSAGE TEXT — takes full space automatically */}
    <p className="
        text-sm break-words leading-relaxed 
        bg-white/20 px-3 py-2 rounded-xl
        text-white shadow-sm 
    ">
      {msg.message}
    </p>

    {/* TICK / CLOCK */}
    {isOwn && (
        <div className="text-right text-[11px] ml-2 mt-1 text-white/80 pt-[100%]">
        {msg.status === "sending" ? (
          <span
            className="inline-block w-3 h-3 border-[2px] border-white/40
            border-t-transparent rounded-full 
            animate-[rotateClock_1s_linear_infinite]"
          ></span>
        ) : (
          <span className="opacity-90">✓</span>
        )}</div>
    
    )}

  </div>

              </div>

              {/* Avatar (right) */}
              {isOwn && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ml-2">
                  <span className="text-xs text-white font-semibold">
                    {msg.userName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input panel */}
      <div className="p-4 border-t border-gray-700 bg-[#000e19]">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            {showPicker && (
              <div className="absolute bottom-14 right-0 z-10">
                <emoji-picker
                  ref={pickerRef}
                  style={{
                    width: "250px",
                    height: "300px",
                    borderRadius: "8px",
                    "--background-color": "#1f2937",
                    "--category-label-color": "#9ca3af",
                    "--indicator-color": "#3b82f6",
                  }}
                ></emoji-picker>
              </div>
            )}

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full h-12 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-white resize-none"
            ></textarea>

            <button
              ref={smileBtnRef}
              onClick={() => setShowPicker(!showPicker)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-gray-600"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
