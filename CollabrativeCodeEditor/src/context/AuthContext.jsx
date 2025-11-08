// import { createContext, useContext, useState } from 'react';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [accessToken, setAccessToken] = useState(null);

//   return (
//     <AuthContext.Provider value={{ accessToken, setAccessToken }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


// import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [accessToken, setAccessToken] = useState(null);

//   // ✅ On mount, check for token in localStorage or cookies
//   useEffect(() => {
//     const storedToken = localStorage.getItem("accessToken");
//     if (storedToken) {
//       setAccessToken(storedToken);
//     }
//   }, []);

//   // ✅ Keep token in sync with localStorage whenever it changes
//   useEffect(() => {
//     if (accessToken) {
//       localStorage.setItem("accessToken", accessToken);
//     } else {
//       localStorage.removeItem("accessToken");
//     }
//   }, [accessToken]);

//   return (
//     <AuthContext.Provider value={{ accessToken, setAccessToken }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


// change no.1
// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- CHANGE 1: Store the 'user' object, not the token ---
  const [user, setUser] = useState(null);
  // Add a loading state to prevent flickers on protected routes
  const [loading, setLoading] = useState(true);

  // --- CHANGE 2: Remove all localStorage logic ---
  // The httpOnly cookie is the source of truth,
  // verified by the /current-user endpoint.

  useEffect(() => {
    // --- CHANGE 3: Check auth status on app load ---
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:4000/auth/current-user", {
          method: "GET",
          credentials: "include", // This is crucial for sending httpOnly cookies
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data); // Store the user object
        } else {
          setUser(null); // Not authenticated
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
