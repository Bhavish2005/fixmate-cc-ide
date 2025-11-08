// import { Server } from "socket.io";
// import { v4 as uuidV4 } from "uuid"; // 💡 Using uuid is safer than Date.now()

// export const initSocket = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   // --- Participant Data (Your existing logic) ---
//   const userMap = new Map(); // userId -> { socketId, name, roomId, lastSeen }
//   const roomParticipants = new Map(); // roomId -> Set(userId)
//   const DISCONNECT_GRACE_MS = 7000;

//   // 🧠 NEW: Page Data Storage
//   const roomPages = new Map(); // roomId -> Array[pageObject]

//   // 🧠 NEW: Helper to create a default page
//   const createNewPage = (name = "Page 1") => ({
//     id: uuidV4(), // Use a real UUID
//     name: name,
//     language: "javascript",
//     code: '// Welcome to your new page!\nconsole.log("Hello!");',
//     stdin: "",
//     output: "",
//   });

//   const getRoomUsers = (roomId) => {
//     const userIds = roomParticipants.get(roomId);
//     if (!userIds) return [];
//     return Array.from(userIds).map((uid) => {
//       const u = userMap.get(uid);
//       return u
//         ? { userId: uid, name: u.name, isOnline: true }
//         : { userId: uid, name: "Unknown", isOnline: false };
//     });
//   };

//   io.on("connection", (socket) => {
//     console.log(`⚡ New connection: ${socket.id}`);

//     // 🏠 Join Room
//     socket.on("join-room", ({ roomId, userName, userId }) => {
//       socket.join(roomId);
//       if(!userId)
//         return;
//       // --- Participant Logic (Your existing) ---
//       const existingUser = userMap.get(userId);
//       if (existingUser && existingUser.socketId !== socket.id) {
//         console.log(`♻️ ${userName} refreshed (new socket: ${socket.id})`);
//       }
//       userMap.set(userId, {
//         socketId: socket.id,
//         name: userName,
//         roomId,
//         lastSeen: Date.now(),
//       });
//       if (!roomParticipants.has(roomId)) {
//         roomParticipants.set(roomId, new Set());
//       }
//       roomParticipants.get(roomId).add(userId);
//       console.log(`✅ ${userName} joined room ${roomId}`);

//       // --- 🧠 UPDATED: Page Logic ---
//       // If room is new, create its first page
//       if (!roomPages.has(roomId)) {
//         roomPages.set(roomId, [createNewPage("Page 1")]);
//         console.log(`📄 Created default page for new room ${roomId}`);
//       }
//       // Send the current page list *only to the joining socket*
//       socket.emit("pages-update", roomPages.get(roomId));

//       // --- Participant Emits (Your existing) ---
//       const users = getRoomUsers(roomId);
//       // Send to everyone INCL. sender
//       io.to(roomId).emit("participants-update", users); 
//       // Send to sender only
//       socket.emit("self-joined", { userId, roomId, users }); 
//       // Send to everyone EXCEPT sender
//       socket.to(roomId).emit("user-joined", { userName, userId }); 
//     });
//     socket.on("leave-room", ({ roomId, userId }, callback) => {
//       const userData = userMap.get(userId);
//       const name = userData ? userData.name : "A user";

//       console.log(`👋 ${name} is properly leaving room ${roomId}`);

//       // --- Remove user logic (from your "disconnect" event) ---
//       userMap.delete(userId);
//       const set = roomParticipants.get(roomId);
//       if (set) {
//         set.delete(userId);
//         if (set.size === 0) roomParticipants.delete(roomId);
//       }
      
//       // --- Update everyone else ---
//       io.to(roomId).emit("participants-update", getRoomUsers(roomId));
//       io.to(roomId).emit("user-left", { userName: name, userId });
//       socket.leave(roomId);

//       // --- This is the magic part ---
//       // Tell the client "OK, I'm done, you can navigate now"
//       if (callback) {
//         callback({ status: "ok" });
//       }
//     });

//     // 💬 Chat message (No changes)
//     socket.on("send-message", (msg, callback) => {
//       const { roomId, userName, message, time } = msg;
//       socket.to(roomId).emit("receive-message", {
//         userName,
//         message,
//         sendtime: time,
//         time: new Date().toISOString(),
//       });
//       if (callback) callback({ status: "delivered" });
//     });

//     // ----------------------------------------------------
//     // 🧠 NEW: Page Sync Handlers
//     // (Replaces your old "code-change" handler)
//     // ----------------------------------------------------

//     // 🧑‍💻 A user changed content (code, stdin, lang, output)
//     socket.on("content-change", ({ roomId, pageId, updates }) => {
//       const pages = roomPages.get(roomId);
//       if (pages) {
//         // Find and update the page data on the server
//         const page = pages.find((p) => p.id === pageId);
//         if (page) {
//           Object.assign(page, updates); // e.g., page.code = updates.code
//         }
//         // Broadcast *only the change* to *other* users
//         socket.broadcast.to(roomId).emit("content-update", { pageId, updates });
//       }
//     });

//     // ➕ A user added a new page
//     socket.on("add-page", ({ roomId, name }) => {
//       const pages = roomPages.get(roomId);
//       if (pages) {
//         const newPage = createNewPage(name);
//         pages.push(newPage);
        
//         // Broadcast the *entire new list* to *everyone* in the room
//         io.to(roomId).emit("pages-update", pages);
//       }
//     });

//     // ❌ A user closed a page
//     socket.on("close-page", ({ roomId, pageId }) => {
//       const pages = roomPages.get(roomId);
//       if (pages) {
//         const newPages = pages.filter((p) => p.id !== pageId);
//         roomPages.set(roomId, newPages);

//         // Broadcast the new list to everyone
//         io.to(roomId).emit("pages-update", newPages);
//       }
//     });
    

//     // ❌ Disconnect (🧠 UPDATED with page cleanup)
//     socket.on("disconnect", () => {
//       const userEntry = Array.from(userMap.entries()).find(
//         ([, v]) => v.socketId === socket.id
//       );
//       if (!userEntry) return;

//       const [userId, userData] = userEntry;
//       const { roomId, name } = userData;
//       console.log(`🔌 ${name} disconnected (grace period: ${DISCONNECT_GRACE_MS}ms)`);
//       const disconnectedSocketId = socket.id;

//       setTimeout(() => {
//         const currentUser = userMap.get(userId);
//         if (currentUser && currentUser.socketId !== disconnectedSocketId) {
//           console.log(`♻️ ${name} reconnected, not removing`);
//           return;
//         }
//         if (!currentUser) {
//           console.log(`⚠️ ${name} already removed`);
//           return;
//         }

//         console.log(` ${name} timed out, removing from room ${roomId}`);
//         userMap.delete(userId);

//         const set = roomParticipants.get(roomId);
//         if (set) {
//           set.delete(userId);
          
//           // 🧠 UPDATED: Clean up room data if empty
//           if (set.size === 0) {
//             roomParticipants.delete(roomId);
//             roomPages.delete(roomId); // Also delete page data
//             console.log(`🧹 Room ${roomId} is empty, cleaning up all data.`);
//           }
//         }

//         io.to(roomId).emit("participants-update", getRoomUsers(roomId));
//         io.to(roomId).emit("user-left", { userName: name, userId });
//       }, DISCONNECT_GRACE_MS);
//     });
//   });

//   return io;
// };


// import { Server } from "socket.io";

// export const initSocket = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   const userMap = new Map(); // userId -> { socketId, name, roomId, lastSeen }
//   const roomParticipants = new Map(); // roomId -> Set(userId)
//   const DISCONNECT_GRACE_MS = 7000;

//   const getRoomUsers = (roomId) => {
//     const userIds = roomParticipants.get(roomId);
//     if (!userIds) return [];
//     return Array.from(userIds).map((uid) => {
//       const u = userMap.get(uid);
//       return u
//         ? { userId: uid, name: u.name, isOnline: true }
//         : { userId: uid, name: "Unknown", isOnline: false };
//     });
//   };

//   io.on("connection", (socket) => {
//     console.log(` New connection: ${socket.id}`);

//     // 🏠 Join Room
//     socket.on("join-room", ({ roomId, userName, userId }) => {
//       socket.join(roomId);

//       if(!userId)
//         return;
//       const existingUser = userMap.get(userId);
//       if (existingUser && existingUser.socketId !== socket.id) {
//         console.log(`${userName} refreshed (new socket: ${socket.id})`);
//       }

//       userMap.set(userId, {
//         socketId: socket.id,
//         name: userName,
//         roomId,
//         lastSeen: Date.now(),
//       });

//       if (!roomParticipants.has(roomId)) {
//         roomParticipants.set(roomId, new Set());
//       }
//       roomParticipants.get(roomId).add(userId);

//       console.log(`✅ ${userName} joined room ${roomId} with userId=${userId}`);

//       const users = getRoomUsers(roomId);
//       socket.emit("participants-update", users);
//       socket.to(roomId).emit("participants-update", users);

//       socket.emit("self-joined", { userId, roomId, users });
//       socket.to(roomId).emit("user-joined", { userName, userId });
//     });

//     // 💬 Chat message (with ack)
//     socket.on("send-message", (msg, callback) => {
//       const { roomId, userName, message, time } = msg;

//       // Broadcast to room (except sender)
//       socket.to(roomId).emit("receive-message", {
//         userName,
//         message,
//         sendtime: time,
//         time: new Date().toISOString(),
//       });

//       // ✅ Acknowledge delivery back to sender
//       if (callback) callback({ status: "delivered" });
//     });

//     // 🧑‍💻 Code sync
//     socket.on("code-change", ({ roomId, code }) => {
//       socket.broadcast.to(roomId).emit("code-update", code);
//     });

//     // ❌ Disconnect
//     socket.on("disconnect", () => {
//       const userEntry = Array.from(userMap.entries()).find(
//         ([, v]) => v.socketId === socket.id
//       );
//       if (!userEntry) return;

//       const [userId, userData] = userEntry;
//       const { roomId, name } = userData;

//       console.log(`🔌 ${name} disconnected (grace period: ${DISCONNECT_GRACE_MS}ms)`);

//       const disconnectedSocketId = socket.id;

//       setTimeout(() => {
//         const currentUser = userMap.get(userId);
//         if (currentUser && currentUser.socketId !== disconnectedSocketId) {
//           console.log(`♻ ${name} reconnected, not removing`);
//           return;
//         }

//         if (!currentUser) {
//           console.log(`⚠ ${name} already removed`);
//           return;
//         }

//         console.log(`❌ ${name} timed out, removing from room ${roomId}`);
//         userMap.delete(userId);

//         const set = roomParticipants.get(roomId);
//         if (set) {
//           set.delete(userId);
//           if (set.size === 0) roomParticipants.delete(roomId);
//         }

//         io.to(roomId).emit("participants-update", getRoomUsers(roomId));
//         io.to(roomId).emit("user-left", { userName: name, userId });
//       }, DISCONNECT_GRACE_MS);
//     });
//   });

//   return io;
// };

import { Server } from "socket.io";
import { v4 as uuidV4 } from "uuid"; // 💡 Using uuid is safer than Date.now()

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // --- Participant Data (Your existing logic) ---
  const userMap = new Map(); // userId -> { socketId, name, roomId, lastSeen }
  const roomParticipants = new Map(); // roomId -> Set(userId)
  const roomOwners = new Map();
  const DISCONNECT_GRACE_MS = 7000;

  // 🧠 NEW: Page Data Storage
  const roomPages = new Map(); // roomId -> Array[pageObject]

  // 🧠 NEW: Helper to create a default page
  const createNewPage = (name = "Page 1") => ({
    id: uuidV4(), // Use a real UUID
    name: name,
    language: "javascript",
    code: '// Welcome to your new page!\nconsole.log("Hello!");',
    stdin: "",
    output: "",
  });

  const getRoomUsers = (roomId) => {
    const userIds = roomParticipants.get(roomId);
    if (!userIds) return [];
    return Array.from(userIds).map((uid) => {
      const u = userMap.get(uid);
      return u
        ? { userId: uid, name: u.name, isOnline: true }
        : { userId: uid, name: "Unknown", isOnline: false };
    });
  };

  io.on("connection", (socket) => {
    console.log(`⚡ New connection: ${socket.id}`);

    // 🏠 Join Room
    socket.on("join-room", ({ roomId, userName, userId }) => {
      socket.join(roomId);
      if (!userId)
        return;
      // --- Participant Logic (Your existing) ---
      const existingUser = userMap.get(userId);
      if (existingUser && existingUser.socketId !== socket.id) {
        console.log(`♻️ ${userName} refreshed (new socket: ${socket.id})`);
      }
      userMap.set(userId, {
        socketId: socket.id,
        name: userName,
        roomId,
        lastSeen: Date.now(),
      });
      if (!roomParticipants.has(roomId)) {
        socket.emit("room-owner-assigned", { isOwner: true });
        roomOwners.set(roomId, userId); // 👑 First user is the owner
        console.log(`👑 ${userName} is the owner of room ${roomId}`);
        roomParticipants.set(roomId, new Set());
      }
      else {
        socket.emit("get-room-owner", { ownerId: roomOwners.get(roomId) });
      }
      roomParticipants.get(roomId).add(userId);
      console.log(`✅ ${userName} joined room ${roomId}`);

      // --- 🧠 UPDATED: Page Logic ---
      // If room is new, create its first page
      if (!roomPages.has(roomId)) {
        roomPages.set(roomId, [createNewPage("Page 1")]);
        console.log(`📄 Created default page for new room ${roomId}`);
      }
      // Send the current page list *only to the joining socket*
      socket.emit("pages-update", roomPages.get(roomId));

      // --- Participant Emits (Your existing) ---
      const users = getRoomUsers(roomId);
      // Send to everyone INCL. sender
      io.to(roomId).emit("participants-update", users);
      // Send to sender only
      socket.emit("self-joined", { userId, roomId, users });
      // Send to everyone EXCEPT sender
      socket.to(roomId).emit("user-joined", { userName, userId });
    });
    socket.on("leave-room", ({ roomId, userId }, callback) => {
      const userData = userMap.get(userId);
      const name = userData ? userData.name : "A user";

      console.log(`👋 ${name} is properly leaving room ${roomId}`);

      // --- Remove user logic (from your "disconnect" event) ---
      userMap.delete(userId);
      const set = roomParticipants.get(roomId);
      if (set) {
        set.delete(userId);
        if (set.size === 0) roomParticipants.delete(roomId);
      }

      // --- Update everyone else ---
      io.to(roomId).emit("participants-update", getRoomUsers(roomId));

      socket.leave(roomId);

      // --- This is the magic part ---
      // Tell the client "OK, I'm done, you can navigate now"
      if (callback) {
        callback({ status: "ok" });
      }
    });

    // 💬 Chat message (No changes)
    socket.on("send-message", (msg, callback) => {
      const { roomId, userName, message, time ,userId} = msg;
      socket.to(roomId).emit("receive-message", {
        userName,
        message,
        userId,
        sendtime: time,
        time: new Date().toISOString(),
      });
      if (callback) callback({ status: "delivered" });
    });

    // ----------------------------------------------------
    // 🧠 NEW: Page Sync Handlers
    // (Replaces your old "code-change" handler)
    // ----------------------------------------------------

    // 🧑‍💻 A user changed content (code, stdin, lang, output)
    socket.on("content-change", ({ roomId, pageId, updates }) => {
      const pages = roomPages.get(roomId);
      if (pages) {
        // Find and update the page data on the server
        const page = pages.find((p) => p.id === pageId);
        if (page) {
          Object.assign(page, updates); // e.g., page.code = updates.code
        }
        // Broadcast *only the change* to *other* users
        socket.broadcast.to(roomId).emit("content-update", { pageId, updates });
      }
    });

    // ➕ A user added a new page
    socket.on("add-page", ({ roomId, name }) => {
      const pages = roomPages.get(roomId);
      if (pages) {
        const newPage = createNewPage(name);
        pages.push(newPage);

        // Broadcast the *entire new list* to *everyone* in the room
        io.to(roomId).emit("pages-update", pages);
      }
    });


    // ❌ A user closed a page
    socket.on("close-page", ({ roomId, pageId }) => {
      const pages = roomPages.get(roomId);
      if (pages) {
        const newPages = pages.filter((p) => p.id !== pageId);
        roomPages.set(roomId, newPages);

        // Broadcast the new list to everyone
        io.to(roomId).emit("pages-update", newPages);
      }
    });

    // socket.on("end-room", ({ roomId, userId },callback) => {
    //   const ownerId = roomOwners.get(roomId);
    //   if (userId !== ownerId) {
    //     return;
    //   }
    //   if(callback) callback({ status: "ok"});
    //   console.log(`👑 Owner (${userId}) ended room ${roomId}`);
    //   io.in(roomId).disconnectSockets(true);

    //   // Clean up all data
    //   roomParticipants.delete(roomId);
    //   roomOwners.delete(roomId);
    //   roomPages.delete(roomId);
      
    // });
    socket.on("end-room", ({ roomId, userId }, callback) => {
      const ownerId = roomOwners.get(roomId);
      if (userId !== ownerId) {
        return;
      }
      console.log(`👑 Owner (${userId}) ended room ${roomId}`);

      io.to(roomId).emit("room-ended", {
        message: "The room has been ended by the owner."
      });

      // ⿢ Then acknowledge the owner
      if (callback) callback({ status: "ok" });

    
      setTimeout(() => {        
        // Get all users in this room and remove them
        const userIds = roomParticipants.get(roomId);
        if (userIds) {
          userIds.forEach((uid) => {
            userMap.delete(uid);
          });
        }
        
        // Clean up room data
        roomParticipants.delete(roomId);
        roomOwners.delete(roomId);
        roomPages.delete(roomId);
      }, 2000); // Give 2 seconds for graceful disconnect
    });

    // 🦶 Owner removes another participant
    socket.on("remove-participant", ({ roomId, userId, userIdToKick }) => {
      const ownerId = roomOwners.get(roomId);
      if (userId !== ownerId && !userIdToKick) return;


      const kickedUser = userMap.get(userIdToKick);

      if (kickedUser.roomId !== roomId) return;

      const kickedSocketId = kickedUser.socketId;
      console.log(`👢 Owner ${userId} kicked ${userIdToKick} from room ${roomId}`);

      // Tell the kicked client
      io.to(kickedSocketId).emit("kicked", { message: "You were removed from the room." });

      // Remove from maps
      userMap.delete(userIdToKick);
      const set = roomParticipants.get(roomId);
      if (set) set.delete(userIdToKick);

      // Notify others
      io.to(roomId).emit("participants-update", getRoomUsers(roomId));

      // Force disconnect that user's socket
      io.sockets.sockets.get(kickedSocketId)?.leave(roomId);
      io.sockets.sockets.get(kickedSocketId)?.disconnect(true);
    });

    // ❌ Disconnect (🧠 UPDATED with page cleanup)
    socket.on("disconnect", () => {
      const userEntry = Array.from(userMap.entries()).find(
        ([, v]) => v.socketId === socket.id
      );
      if (!userEntry) return;

      const [userId, userData] = userEntry;
      const { roomId, name } = userData;
      console.log(`🔌 ${name} disconnected (grace period: ${DISCONNECT_GRACE_MS}ms)`);
      const disconnectedSocketId = socket.id;

      setTimeout(() => {
        const currentUser = userMap.get(userId);
        if (currentUser && currentUser.socketId !== disconnectedSocketId) {
          console.log(`♻️ ${name} reconnected, not removing`);
          return;
        }
        if (!currentUser) {
          console.log(`⚠️ ${name} already removed`);
          return;
        }

        console.log(` ${name} timed out, removing from room ${roomId}`);
        userMap.delete(userId);

        const set = roomParticipants.get(roomId);
        if (set) {
          set.delete(userId);

          // 🧠 UPDATED: Clean up room data if empty
          if (set.size === 0) {
            roomParticipants.delete(roomId);
            roomPages.delete(roomId); // Also delete page data
            console.log(`🧹 Room ${roomId} is empty, cleaning up all data.`);
          }
        }

        io.to(roomId).emit("participants-update", getRoomUsers(roomId));
      }, DISCONNECT_GRACE_MS);
    });
  });

  return io;
};