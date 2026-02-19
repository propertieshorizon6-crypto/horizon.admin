
import React from "react";
import { Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4 max-w-[1280px]">
        {/* Logo Section */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-[0_0_20px_0_rgba(245,159,10,0.3)] transition-transform hover:scale-105"
            aria-hidden="true"
          >
            <Building2 className="w-6 h-6 text-black" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground leading-none tracking-tight font-sans">
              Horizon
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-none font-sans">
              Admin Console
            </p>
          </div>
        </motion.div>

        {/* Global Navigation / Actions */}
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/login">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 
              bg-[#1A2B4B] text-white hover:bg-[#1A2B4B]/90 h-10 px-5 py-2
              hover:shadow-[0_10px_15px_-3px_rgba(26,43,75,0.2)] hover:scale-105 active:scale-95
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2B4B] focus-visible:ring-offset-2
              disabled:pointer-events-none disabled:opacity-50"
          >
            Sign In
          </button>
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
}
