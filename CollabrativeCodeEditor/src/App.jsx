// // import React from 'react';
// // import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// // import Navbar from './components/Navbar';
// // import HomePage from './pages/HomePage';
// // import RoomPage from './pages/RoomPage';
// // import LoginPage from './pages/LoginPage';
// // import RegisterPage from './pages/RegisterPage';
// // import ForgotPasswordPage from './pages/ForgotPasswordPage';
// // import About from './pages/About';

// // function App() {
// //   return (
// //     <Router>
// //       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
// //         <Navbar />
// //         <div className='pt-16'> {/* To offset the fixed navbar height */}
// //         <Routes>
// //           <Route path="/" element={<HomePage />} />
// //           <Route path="/room/:roomId" element={<RoomPage />} />
// //           <Route path="/about" element={<About />} />
// //           <Route path="/login" element={<LoginPage />} />
// //           <Route path="/register" element={<RegisterPage />} />
// //           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
// //         </Routes>
// //         </div>
// //       </div>
// //     </Router>
// //   );
// // }

// // export default App;

// // import React from 'react';
// // import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// // import Navbar from './components/Navbar';
// // import HomePage from './pages/HomePage';
// // import RoomPage from './pages/RoomPage';
// // import LoginPage from './pages/LoginPage';
// // import RegisterPage from './pages/RegisterPage';
// // import ForgotPasswordPage from './pages/ForgotPasswordPage';
// // import About from './pages/About';

// // function Layout() {
// //   const location = useLocation();

// //   // Hide navbar on room page
// //   const hideNavbar = location.pathname.startsWith('/room/');

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-16">
// //       {!hideNavbar && <Navbar />}
// //       <Routes>
// //         <Route path="/" element={<HomePage />} />
// //         <Route path="/room/:roomId" element={<RoomPage />} />
// //         <Route path="/about" element={<About />} />
// //         <Route path="/login" element={<LoginPage />} />
// //         <Route path="/register" element={<RegisterPage />} />
// //         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
// //       </Routes>
// //     </div>
// //   );
// // }

// // function App() {
// //   return (
// //     <Router>
// //       <Layout />
// //     </Router>
// //   );
// // }

// // export default App;

// // src/App.jsx
// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   useLocation,
// } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import HomePage from "./pages/HomePage";
// import RoomPage from "./pages/RoomPage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import ForgotPasswordPage from "./pages/ForgotPasswordPage";
// import About from "./pages/About";
// import CodeEditorPage from "./pages/CodeEditorPage";
// import { AuthProvider } from "./context/AuthContext";
// import DashboardPage from "./pages/Dashboard";
// import ProtectedRoute from "./components/ProtectedRoute.jsx";
// import CodeEditorPage2 from "./pages/CodeEditorPage2.jsx";
// import { Toaster } from 'react-hot-toast';

// function Layout() {
//   const location = useLocation();

//   // Hide navbar and footer on room page
//   const hiddenPaths = ["/room/", "/login", "/register", "/forgot-password"];
//   const hideNavAndFooter = hiddenPaths.some((path) =>
//     location.pathname.startsWith(path)
//   );

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b text-white">
//       {!hideNavAndFooter && <Navbar />}

//       {/* Main content area grows to push footer down */}
//       <main className={`flex-grow ${!hideNavAndFooter ? "pt-16" : ""}`}>
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/room/:roomId" element={<RoomPage />} />
//           <Route path="/about" element={<About />} />
//           {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <DashboardPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//           {/* <Route path="/code-editor" element={<CodeEditorPage />} /> */}
//           <Route
//             path="/code-editor"
//             element={
//               <ProtectedRoute>
//                 <CodeEditorPage2 />
//               </ProtectedRoute>
//             }
//           />
//           {/* <Route path="/code-editor" element={<CodeEditorPage2 />} /> */}
//         </Routes>
//       </main>

//       {!hideNavAndFooter && <Footer />}
//     </div>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//     <Toaster
//         position="Bottom-right"
//         toastOptions={{
//           // Define default options
//           success: {
//             duration: 3000,
//             style: {
//               background: '#28a745', 
//               color: '#ffffff',
//             },
//           },
//           error: {
//             duration: 5000,
//             style: {
//               background: '#dc3545',
//               color: '#ffffff',
//             },
//           },
//         }}
//       />
//       <Router>
//         <Layout />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import About from "./pages/About";
import { AuthProvider } from "./context/AuthContext";
import DashboardPage from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CodeEditorPage2 from "./pages/CodeEditorPage2.jsx";
import { Toaster } from 'react-hot-toast';
import ResetPassword from "./pages/ResetPasswords.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

function Layout() {
  const location = useLocation();

  // --- 1. Paths where the NAVBAR should be hidden ---
  const navHiddenPaths = ["/room/", "/login", "/register", "/forgot-password"];
  const hideNavbar = navHiddenPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  // --- 2. Paths where the FOOTER should be hidden ---
  // Hide footer if Navbar is hidden, OR if the path is exactly /about
  const hideFooter = hideNavbar || location.pathname === "/about";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b text-white">
      {/* --- 3. Use hideNavbar logic --- */}
      {!hideNavbar && <Navbar />}

      {/* Main content area grows to push footer down */}
      {/* --- 4. Use hideNavbar logic for padding --- */}
      <main className={`flex-grow ${!hideNavbar ? "pt-16" : ""}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/about" element={<About />} />
          {/* <Route path="/dashboard" element={<DashboardPage />} /> */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* <Route path="/code-editor" element={<CodeEditorPage />} /> */}
          <Route
            path="/code-editor"
// ... existing code ...
            element={
              <ProtectedRoute>
                <CodeEditorPage2 />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/code-editor" element={<CodeEditorPage2 />} /> */}
        </Routes>
      </main>

      {/* --- 5. Use hideFooter logic --- */}
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
    <Toaster
        position="Bottom-right"
        toastOptions={{
          // Define default options
          success: {
            duration: 3000,
            style: {
              background: '#28a745', 
              color: '#ffffff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#dc3545',
              color: '#ffffff',
            },
          },
        }}
      />
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;