// import dotenv from "dotenv";
// dotenv.config(); // This must be at the very top, before any other imports
// console.log(process.env.JWT_SECRET);
// console.log(process.env.JWT_REFRESH_SECRET);
// import express from "express";
// import cors from "cors";
import cookieParser from "cookie-parser";
// import authRoutes from "./src/routes/auth.routes.js";

// // Import DB and Firebase initialization (runs on import)
// import { connectDB } from "./src/config/db.js";
// import "./src/config/firebaseAdmin.js"; // just import, no need to assign

// const app = express();
// app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
// app.use(express.json());
// // Connect to MongoDB before starting the server
// connectDB()
//   .then(() => {
//     // Middlewares

//     // Routes
//     app.use("/auth", authRoutes);
//     app.get("/", (req, res) => res.send("Server is running 🚀"));

//     // Start server
//     const PORT = process.env.PORT;
//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("Failed to connect to DB", err);
//   });

import dotenv from "dotenv";
dotenv.config(); // This must be at the very top, before any other imports
import express from "express";
import cors from "cors"
import authRoutes from "./src/routes/auth.routes.js"
import streamRoutes from "./src/routes/stream.routes.js";
import http from "http";
import { initSocket } from "./socket.js";
// Import DB and Firebase initialization (runs on import)
import { connectDB } from "./src/config/db.js"
import "./src/config/firebaseAdmin.js" // just import, no need to assign


const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
// Connect to MongoDB before starting the server
connectDB()
  .then(() => {
    // Middlewares
    app.use("/auth", authRoutes);
    app.use("/stream", streamRoutes); 
    app.get("/", (req, res) => res.send("Server is running 🚀"));

    // Start server
    const PORT = process.env.PORT;
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
  });