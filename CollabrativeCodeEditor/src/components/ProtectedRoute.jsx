// // src/components/ProtectedRoute.jsx
// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const ProtectedRoute = ({ children }) => {
//   const { accessToken } = useAuth();

//   if (!accessToken) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

// src/components/ProtectedRoute.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  // --- CHANGE: Use 'user' and 'loading' from context ---
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Show a loading indicator while auth is being checked
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div> {/* Or a spinner component */}
      </div>
    );
  }

  // 2. If not loading and no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
      
  }

  // 3. If user exists, render the protected component
  return children;
};

export default ProtectedRoute;