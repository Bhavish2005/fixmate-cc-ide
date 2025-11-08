import { io } from "socket.io-client";
// Connect to backend Socket.IO server
export const socket =  io("http://localhost:4000", {
  withCredentials: true,
});

// Just for debug
socket.on("connect", () => {
  console.log("🟢 Connected to Socket.IO:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected from Socket.IO");
});