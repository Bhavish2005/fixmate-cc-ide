
// import React from "react";
// import { Mail, Github, Instagram, Twitter, MapPin } from "lucide-react";

// const developers = [
//   {
//     name: "Dev One",
//     email: "dev1@example.com",
//     github: "https://github.com/dev1",
//     instagram: "https://instagram.com/dev1",
//     twitter: "https://twitter.com/dev1",
//   },
//   {
//     name: "Dev Two",
//     email: "dev2@example.com",
//     github: "https://github.com/dev2",
//     instagram: "https://instagram.com/dev2",
//     twitter: "https://twitter.com/dev2",
//   },
//   {
//     name: "Dev Three",
//     email: "dev3@example.com",
//     github: "https://github.com/dev3",
//     instagram: "https://instagram.com/dev3",
//     twitter: "https://twitter.com/dev3",
//   },
//   {
//     name: "Dev Four",
//     email: "dev4@example.com",
//     github: "https://github.com/dev4",
//     instagram: "https://instagram.com/dev4",
//     twitter: "https://twitter.com/dev4",
//   },
// ];

// const Footer = () => {
//   return (
//     <div className="bg-gradient-to-br from-slate-900 via-white-800 to-slate-900 text-gray-300 ">
//       <div className="max-w-7xl mx-auto px-6 py-8">
        
//         {/* Top Title */}
//         <h2 className="text-xl font-bold text-white text-center mb-6">We are here to Hear your Reviews and Feedback for Fixmate</h2>

//         {/* Developers Section */}
//         <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
//           {developers.map((dev, idx) => (
//             <div
//               key={idx}
//               className="bg-slate-900/70 rounded-xl p-4 shadow-sm hover:shadow-md transition"
//             >
//               <h4 className="text-sm font-semibold text-white mb-2">{dev.name}</h4>
//               <div className="flex justify-center gap-3">
//                 <a href={`mailto:${dev.email}`} className="hover:text-white" aria-label="Email">
//                   <Mail className="w-4 h-4 text-blue-400" />
//                 </a>
//                 <a href={dev.github} target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="GitHub">
//                   <Github className="w-4 h-4 text-gray-300" />
//                 </a>
//                 <a href={dev.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Instagram">
//                   <Instagram className="w-4 h-4 text-pink-400" />
//                 </a>
//                 <a href={dev.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Twitter">
//                   <Twitter className="w-4 h-4 text-sky-400" />
//                 </a>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Office Section */}
//         <div className="mt-8 flex flex-col items-center text-center text-gray-400">
//           <p className="flex items-center gap-2 text-sm">
//             <MapPin className="w-4 h-4 text-red-400" />
//             123 Tech Park, Innovation Street, Bangalore, India
//           </p>
//         </div>

//         {/* Bottom Bar */}
//         <div className="border-t border-slate-800 text-center py-3 text-xs text-gray-500 mt-6">
//           © {new Date().getFullYear()} FixMate. All Rights Reserved.
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Footer;

import React from "react";
import { Mail, Github, Instagram, Twitter, MapPin } from "lucide-react";

const developers = [
  {
    name: "Bhavish Pushkarna",
    email: "bhavish.pushkarna2005@gmail.com",
    github: "https://github.com/Bhavish2005",
    instagram: "https://instagram.com/pushkarnabhavish",
    twitter: "https://twitter.com/Bhavish0",
  },
  {
    name: "Pranav Chaudhary",
    email: "dev2@example.com",
    github: "https://github.com/dev2",
    instagram: "https://instagram.com/dev2",
    twitter: "https://twitter.com/dev2",
  },
  {
    name: "Devkaran Singh",
    email: "dev3@example.com",
    github: "https://github.com/dev3",
    instagram: "https://instagram.com/dev3",
    twitter: "https://twitter.com/dev3",
  },
  {
    name: "Shreyash Tripathi",
    email: "dev4@example.com",
    github: "https://github.com/dev4",
    instagram: "https://instagram.com/dev4",
    twitter: "https://twitter.com/dev4",
  },
];

const Footer = () => {
  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-gray-300 border-t border-slate-800">
      {/* Subtle glowing top divider */}
      <div className="absolute top-0 left-0 w-full h-[1px]  bg-gradient-to-r from-slate-900 via-cyan-600 to-slate-900" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Top Title */}
        <h2 className="text-xl font-bold text-white text-center mb-6">
          Your reviews and feedback are important for  <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">FixMate</span> to improve.
        </h2>

        {/* Developers Section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {developers.map((dev, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-slate-800/80 transition"
            >
              <h4 className="text-sm font-semibold text-white mb-2">{dev.name}</h4>
              <div className="flex justify-center gap-3">
                <a href={`mailto:${dev.email}`} className="hover:text-white" aria-label="Email">
                  <Mail className="w-4 h-4 text-blue-400" />
                </a>
                <a href={dev.github} target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="GitHub">
                  <Github className="w-4 h-4 text-gray-300" />
                </a>
                <a href={dev.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Instagram">
                  <Instagram className="w-4 h-4 text-pink-400" />
                </a>
                <a href={dev.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Twitter">
                  <Twitter className="w-4 h-4 text-sky-400" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Office Section */}
        <div className="mt-8 flex flex-col items-center text-center text-gray-400">
          <p className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-red-400" />
            123 Tech Park, Innovation Street, Bangalore, India
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 text-center py-3 text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} FixMate. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;

