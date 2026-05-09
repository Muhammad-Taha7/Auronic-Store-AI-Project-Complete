import React, { useState } from "react";
import { MoveLeft, Home, Search, AlertCircle } from "lucide-react";

export const NotFound = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Logic for searching your site
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] text-white px-6 overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>

      <div className="relative z-10 text-center max-w-xl w-full">
        
        {/* Visual Indicator */}
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10">
          <AlertCircle className="w-8 h-8 text-white/80" />
        </div>

        {/* Big 404 with Gradient Mask */}
        <h1 className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter bg-gradient-to-b from-white/20 to-transparent bg-clip-text text-transparent select-none">
          404
        </h1>

        {/* Title & Description */}
        <div className="-mt-8 md:-mt-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Lost in the digital void?
          </h2>
          <p className="mt-4 text-white/50 text-base md:text-lg leading-relaxed">
            The page you’re looking for has either moved to a new galaxy or never existed in this dimension.
          </p>
        </div>

        {/* Professional Search "Form" Integration */}
        <form onSubmit={handleSearch} className="mt-10 relative group max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Search our site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
          />
        </form>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/"
            className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 w-full sm:w-auto justify-center"
          >
            <Home size={18} />
            Back to Home
          </a>

          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all active:scale-95 w-full sm:w-auto justify-center"
          >
            <MoveLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Subtle Footer Link */}
        <p className="mt-12 text-white/20 text-xs uppercase tracking-widest">
          Error Code: NULL_POINTER_LOCATION
        </p>
      </div>
    </div>
  );
};