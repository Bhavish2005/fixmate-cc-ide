import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { registerSchema } from "../utils/zod-schema.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt-setup.js";
import admin from "../config/firebaseAdmin.js";
import axios from "axios";

import { GoogleGenerativeAI } from "@google/generative-ai"; // <-- 1. ADD THIS IMPORT
import { RunLog } from "../models/error.model.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// --- Gemini Setup ---
// Make sure .env file is loaded in your main index.js


// This is the core of your request: the educational prompt
const systemPrompt = `
You are 'Debug-Buddy', a friendly, encouraging, and expert coding assistant.
Your primary goal is NOT to just give the answer, but to help the user learn and improve their thinking skills.

Follow these rules STRICTLY:
1.  **Be Friendly & Encouraging:** Always use a positive, helpful tone.
2.  **Explain Concepts Simply:** If the user has an error (like 'TypeError' or 'ReferenceError'), first explain what that error *means* in simple, easy-to-understand terms.
3.  **Guide, Don't Just Solve:**
    * NEVER just provide the final, corrected code block.
    * INSTEAD, point the user to the *area* of the problem.
    * ASK guiding questions. (e.g., "It looks like the error is on line 10. That error often means 'user' is undefined. Have you checked if 'user' has a value before you try to access 'user.name'?")
4.  **Promote Critical Thinking:** When asked for help or "how to," explain the *'why'* behind the concept. Help the user understand the *principles* so they can solve it themselves.
5.  **Keep it Clear & Concise:** Use simple language. Avoid overly technical jargon. Use bullet points or short paragraphs.
`;
// --- End Gemini Setup ---

export const firebaseLogin = async (req, res) => {
  try {
    console.log("Received Firebase login request");
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (!idToken) {
      return res.status(401).json({ message: "No ID token provided" });
    }

    console.log("Verifying ID token...");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // Find user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId: uid }, { email: email }],
    });

    if (user) {
      // If user exists but googleId is missing → link account
      if (!user.googleId) {
        user.googleId = uid;
        await user.save();
        console.log("Linked Google account to existing user");
      }
    } else {
      // Create new Google user
      user = await User.create({
        name: name || "New User",
        email,
        googleId: uid,
      });
      console.log("Created new Google user");
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .status(200)
      .json({
        message: "Login successful",
        accessToken,
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          // Add the username property just like in getCurrentUser
          username: user.username || user.name.split(" ")[0] 
        },
      });
  } catch (error) {
    console.error("Firebase login error:", error);
    return res.status(401).json({ message: `Firebase login error: ${error}` });
  }
};

// export const registerUser = async (req, res) => {
//   try {
//     const result = registerSchema.safeParse(req.body);
//     console.log(typeof result);
//     console.log(result);
//     if (!result.success) {
//       console.log(result.error.ZodError);
//       return res
//         .status(400)
//         .json({ errors: result.error.ZodError.map((issue) => issue.message) });
//     }

//     const { name, username, password } = result.data; // ✅ FIXED HERE

//     // Check if username already exists
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ message: "Username already taken" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const user = await User.create({
//       username,
//       name,
//       password: hashedPassword,
//     });

//     // Generate tokens
//     const accessToken = generateAccessToken(user);
//     const refreshToken = generateRefreshToken(user);

//     // Set refresh token in cookies
//     return res
//       .cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         path: "/",
//       })
//       .cookie("accessToken", accessToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         path: "/",
//       })
//       .status(201)
//       .json({
//         message: "User registered successfully",
//         accessToken,
//         user: {
//           id: user._id,
//           username: user.username,
//           name: user.name,
//         },
//       });
//   } catch (error) {
//     console.error("Registration error:", error);
//     return res
//       .status(500)
//       .json({ message: "Something went wrong. Please try again." });
//   }
// };

export const registerUser = async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);
    console.log(typeof result);
    console.log(result);
    if (!result.success) {
      console.log(result.error); // Log the whole error
      // --- 1. FIX ZOD ERROR MAPPING (was .ZodError, should be .issues) ---
      return res
        .status(400)
        .json({ errors: result.error.issues.map((issue) => issue.message) });
    }

    // --- 2. ADD 'email' to be read from the form data ---
    const { name, username, password, email } = result.data;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // --- 3. ADD THIS CHECK for existing email ---
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- 4. ADD 'email' when creating the user ---
    const user = await User.create({
      username,
      name,
      email, // <-- THIS IS THE FIX
      password: hashedPassword,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token in cookies
    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .status(201)
      .json({
        message: "User registered successfully",
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email, // <-- Also good to return the email here
        },
      });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
export const loginUser = async (req, res) => {
  try {
    const parsedData = req.body;
    if (!parsedData) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const { username, password } = parsedData;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token in cookies
    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .status(200)
      .json({
        message: "Login successful",
        accessToken,
        user,
      });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

export const logOutUser = async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })
    .status(200)
    .json({ message: "User Logout successful" });
};

export const checkUser = async (req, res) => {
  const { username } = req.query;
  const userExists = await User.findOne({ username });
  return res.json({ available: !userExists });
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email || "",
    username: req.user.username || req.user.name.split(" ")[0],
  });
};

function mapLanguage(lang) {
  switch (lang) {
    case "javascript":
      return { jdoodleLang: "nodejs", versionIndex: "4" };
    case "typescript":
      return { jdoodleLang: "typescript", versionIndex: "0" };
    case "python":
      return { jdoodleLang: "python3", versionIndex: "0" };
    case "java":
      return { jdoodleLang: "java", versionIndex: "3" };
    case "cpp":
      return { jdoodleLang: "cpp17", versionIndex: "0" };
    case "c":
      return { jdoodleLang: "c", versionIndex: "0" };
    case "go":
      return { jdoodleLang: "go", versionIndex: "0" };
    case "rust":
      return { jdoodleLang: "rust", versionIndex: "0" };
    default:
      return { jdoodleLang: "nodejs", versionIndex: "4" };
  }
}

export const runCode = async (req, res) => {
  const { code, language } = req.body;

  try {
    const { jdoodleLang, versionIndex } = mapLanguage(language);
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: code,
      language: jdoodleLang,
      versionIndex: versionIndex,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "JDoodle API call failed:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Failed to run code" });
  }
};


export const askBuddy = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    // Construct the full prompt for the model
    const fullPrompt = `${systemPrompt}\n\nHere is the user's question:\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Send the answer back in the format the frontend expects
    res.json({ answer: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to get response from AI" }); // Use 500 for server error
  }
};

// Error Log Saving>>>>

// src/controllers/auth.controller.js
// 1. IMPORT THE NEW MODEL
// ... (all your other imports) ...

// ... (all your existing functions like firebaseLogin, registerUser, etc.) ...

// --- 2. REPLACE 'logError' WITH 'logRun' ---
export const logRun = async (req, res) => {
  try {
    const { isSuccess, language, code, error, category } = req.body;
    const userId = req.user._id; // From verifyJWT middleware

    if (isSuccess === undefined || !language || !code) {
      return res.status(400).json({ message: "Missing required run fields" });
    }

    // If it's an error, category/error text are also required
    if (!isSuccess && (!error || !category)) {
      return res.status(400).json({ message: "Error log must include error and category" });
    }

    const newLog = await RunLog.create({
      user: userId,
      isSuccess,
      language,
      code,
      error: isSuccess ? undefined : error,
      category: isSuccess ? undefined : category,
    });

    res.status(201).json({ message: "Run logged successfully", log: newLog });
  } catch (err) {
    console.error("Error logging run:", err);
    res.status(500).json({ message: "Server error while logging run" });
  }
};

// --- 3. REPLACE 'getErrorLogs' WITH 'getRunLogs' ---
export const getRunLogs = async (req, res) => {
  try {
    const userId = req.user._id; // From verifyJWT middleware
    // Find all logs, not just errors
    const logs = await RunLog.find({ user: userId }).sort({ createdAt: -1 }); 
    res.status(200).json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Server error while fetching logs" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });

    // We send a generic success message even if the user isn't found
    // This prevents attackers from checking which emails are registered.
    if (!user) {
      return res
        .status(200)
        .json({ message: "If that email is registered, a reset link has been sent." });
    }

    // 2. Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 3. Hash the token and save it to the database
    // We save the HASH, not the token, for security.
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token to expire in 10 minutes
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; 

    await user.save();

    // 4. Create the reset URL for the frontend
    // Make sure your frontend URL is correct (e.g., localhost:5173 for Vite)
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // 5. Send the email
    const message = `
      <h1>You requested a password reset</h1>
      <p>Please click this link to set a new password:</p>
      <a href="${resetURL}" target="_blank">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: "Your FixMate Password Reset Link",
      message,
    });

    res
      .status(200)
      .json({ message: "If that email is registered, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot Password error:", error);
    // Clear the token if anything went wrong
    if (req.user) { // Check if user was found before erroring
      req.user.resetPasswordToken = undefined;
      req.user.resetPasswordExpires = undefined;
      await req.user.save();
    }
    res.status(500).json({ message: "Error sending reset email." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
       return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // 1. Hash the incoming token from the URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2. Find the user by the HASHED token and check if it's expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // $gt = greater than
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or has expired." });
    }

    // 3. Set the new password
    user.password = await bcrypt.hash(password, 10);

    // 4. Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // 5. Send success response
    res.status(200).json({ message: "Password reset successful! You can now log in." });

  } catch (error) {
    console.error("Reset Password error:", error);
    res.status(500).json({ message: "Error resetting password." });
  }
};