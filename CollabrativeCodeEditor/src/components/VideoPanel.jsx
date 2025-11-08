// import React, { useEffect } from "react";
// import {
//   StreamCall,
//   StreamTheme,
//   StreamVideo,
//   CallControls,
// } from "@stream-io/video-react-sdk";
// import "@stream-io/video-react-sdk/dist/css/styles.css";
// import PaginatedVerticalLayout from "./CustomLayout";

// const VideoPanel = ({ client, call, onStartCall, onLeaveCall }) => {
//   const [isConnecting, setIsConnecting] = React.useState(false);

//   useEffect(() => {
//     if (!call) return;

//     const setupMedia = async () => {
//       try {
//         setIsConnecting(true);
//         await call.camera.enable();
//         await call.microphone.enable();
//         setIsConnecting(false);
//       } catch (error) {
//         console.error("Error setting up media:", error);
//         setIsConnecting(false);
//       }
//     };

//     setupMedia();

//     return () => {
//       call.camera.disable();
//       call.microphone.disable();
//     };
//   }, [call]);

//   if (!client || !call) {
//     return (
//       <div className="h-full flex flex-col justify-center items-center bg-gray-900 rounded-lg text-white">
//         <p className="text-gray-400 mb-3">Not connected to a call</p>
//         <button
//           onClick={onStartCall}
//           className="bg-green-600 px-4 py-2 rounded-md hover:bg-green-500 transition-all"
//         >
//           Join the Call
//         </button>
//       </div>
//     );
//   }

//   if (isConnecting) {
//     return (
//       <div className="h-full flex flex-col justify-center items-center bg-gray-900 rounded-lg text-white">
//         <div className="flex flex-col items-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//           <p className="text-lg text-gray-300">Connecting...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <StreamVideo client={client}>
//       <StreamTheme>
//         <StreamCall call={call}>
//           <div className="h-full flex flex-col bg-gray-900 rounded-lg">
//             {/* Paginated layout */}
//             <div className="flex-1 min-h-0">
//               <PaginatedVerticalLayout />
//             </div>
            
//             {/* Call controls */}
//             <div className="flex justify-center py-2 border-t border-gray-700">
//               <CallControls
//                 onLeave={() => {
//                   console.log("✅ User left the call");
//                   sessionStorage.removeItem("activeCallId");
//                   onLeaveCall?.();
//                 }}
//               />
//             </div>
//           </div>
//         </StreamCall>
//       </StreamTheme>
//     </StreamVideo>
//   );
// };

// export default VideoPanel;

// import React, { useEffect } from "react";
// import {
//   StreamCall,
//   StreamTheme,
//   StreamVideo,
//   CallControls,
// } from "@stream-io/video-react-sdk";
// import "@stream-io/video-react-sdk/dist/css/styles.css";
// import PaginatedVerticalLayout from "./CustomLayout";

// // --- 1. IMPORT YOUR IMAGE ---
// // 
// // Adjust this path to match your project structure and file name.
// // This example assumes 'VideoPanel.js' is in 'src/components/'
// // and your image is in 'src/assets/'.
// //
// import connectCallImage from "../assets/Image.png"; // <-- ADJUST THIS PATH

// const VideoPanel = ({ client, call, onStartCall, onLeaveCall }) => {
//   const [isConnecting, setIsConnecting] = React.useState(false);

//   useEffect(() => {
//     if (!call) return;

//     const setupMedia = async () => {
//       try {
//         setIsConnecting(true);
//         await call.camera.enable();
//         await call.microphone.enable();
//         setIsConnecting(false);
//       } catch (error) {
//         console.error("Error setting up media:", error);
//         setIsConnecting(false);
//       }
//     };

//     setupMedia();

//     return () => {
//       call.camera.disable();
//       call.microphone.disable();
//     };
//   }, [call]);

//   if (!client || !call) {
//     return (
//       <div className="h-full flex flex-col justify-center items-center bg-gray-900 rounded-lg text-white">
        
//         {/* --- 2. USE THE IMPORTED IMAGE --- */}
//         <img
//           src={connectCallImage} // <-- Use the imported variable here
//           alt="Join call"
//           className="w-75 h-80 object-cover rounded-lg mb-6"
//         />

//         <p className="text-gray-400 mb-3">Not connected to a call</p>
//         <button
//           onClick={onStartCall}
//           className="bg-green-600 px-4 py-2 rounded-md hover:bg-green-500 transition-all"
//         >
//           Join the Call
//         </button>
//       </div>
//     );
//   }

//   if (isConnecting) {
//     return (
//       <div className="h-full flex flex-col justify-center items-center bg-gray-900 rounded-lg text-white">
//         <div className="flex flex-col items-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//           <p className="text-lg text-gray-300">Connecting...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <StreamVideo client={client}>
//       <StreamTheme>
//         <StreamCall call={call}>
//           <div className="h-full flex flex-col bg-gray-900 rounded-lg">
//             {/* Paginated layout */}
//             <div className="flex-1 min-h-0">
//               <PaginatedVerticalLayout />
//             </div>
            
//             {/* Call controls */}
//             <div className="flex justify-center py-2 border-t border-gray-700">
//               <CallControls
//                 onLeave={() => {
//                   console.log("✅ User left the call");
//                   sessionStorage.removeItem("activeCallId");
//                   onLeaveCall?.();
//                 }}
//               />
//             </div>
//           </div>
//         </StreamCall>
//       </StreamTheme>
//     </StreamVideo>
//   );
// };

// export default VideoPanel;

import React, { useEffect } from "react";
import {
  StreamCall,
  StreamTheme,
  StreamVideo,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import PaginatedVerticalLayout from "./CustomLayout";
// Import your image
import connectCallImage from "../assets/Image.png"; // <-- Make sure this path is correct

const VideoPanel = ({ client, call, onStartCall, onLeaveCall,isJoiningCall }) => {
  const [isConnecting, setIsConnecting] = React.useState(false);

  useEffect(() => {
    if (!call) return;

    const setupMedia = async () => {
      try {
        setIsConnecting(true);
        await call.camera.enable();
        await call.microphone.enable();
        setIsConnecting(false);
      } catch (error) {
        console.error("Error setting up media:", error);
        setIsConnecting(false);
      }
    };

    setupMedia();

    return () => {
      call.camera.disable();
      call.microphone.disable();
    };
  }, [call]);

  if (!client || !call) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-gray-900 rounded-lg text-white p-4">
        
        {/* --- 1. IMAGE STYLE UPDATED ---
          * 'w-75 h-80' is not standard Tailwind.
          * Replaced with 'w-3/4 max-w-xs' for responsive width.
          * 'h-auto' maintains aspect ratio.
          * 'object-contain' ensures the whole image fits.
        */}
        <img
          src={connectCallImage}
          alt="Join call"
          className="w-3/4 max-w-xs h-auto object-contain rounded-lg "
        />

        {/* --- 2. TEXT PHRASE CHANGED --- */}
        <p className="text-gray-300 text-lg mb-4">Ready to join the meeting?</p>

        {/* --- 3. BUTTON STYLIZED --- */}
        {/* <button
          onClick={onStartCall}
          className="px-6 py-2 rounded-lg text-white font-semibold 
                     bg-gradient-to-r from-green-500 to-blue-500 
                     hover:from-green-600 hover:to-blue-600 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 
                     shadow-lg transform transition-all duration-200 hover:scale-105"
        >
          Join Now
        </button> */}
        <button
          onClick={onStartCall}
          disabled={isJoiningCall}
          className={`px-6 py-2 rounded-lg text-white font-semibold 
                      bg-gradient-to-r from-green-500 to-blue-500 
                      hover:from-green-600 hover:to-blue-600 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 
                      shadow-lg transform transition-all duration-200 hover:scale-105
                      ${isJoiningCall ? "opacity-75 cursor-not-allowed" : ""}`}
        >
          {isJoiningCall ? "Joining..." : "Join Now"}
        </button>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-gray-900 rounded-lg text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-lg text-gray-300">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <StreamCall call={call}>
          <div className="h-full flex flex-col bg-gray-900 rounded-lg">
            {/* Paginated layout */}
            <div className="flex-1 min-h-0">
              <PaginatedVerticalLayout />
            </div>
            
            {/* Call controls */}
            <div className="flex justify-center py-2 border-t border-gray-700">
              <CallControls
                onLeave={() => {
                  console.log("✅ User left the call");
                  sessionStorage.removeItem("activeCallId");
                  onLeaveCall?.();
                }}
              />
            </div>
          </div>
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
};

export default VideoPanel;