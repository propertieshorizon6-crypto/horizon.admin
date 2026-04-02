"use client";

import React from "react";
import { Shield, ArrowRight, ChevronDown } from "lucide-react";
import logo from "../../../assets/logo.png";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32 bg-background">
      {/* Background Aurora / Gradient Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2b4b]/5 via-transparent to-[#f59e0b]/5 pointer-events-none" />

      {/* Radial Blur Shapes - Top Right (Accent) */}
      <motion.div
        className="absolute top-20 right-[5%] w-72 h-72 rounded-full bg-[#f59e0b]/10 blur-[80px] lg:blur-[120px] pointer-events-none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Radial Blur Shapes - Bottom Left (Primary) */}
      <motion.div
        className="absolute bottom-10 left-[5%] w-96 h-96 rounded-full bg-[#1a2b4b]/10 blur-[80px] lg:blur-[120px] pointer-events-none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
      />

      <div className="container mx-auto px-4 relative z-10 ">
        <div className="text-center max-w-4xl mx-auto">
          {/* Enterprise Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a2b4b]/10 text-[#1a2b4b] text-sm font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Shield className="w-4 h-4" />
            <span>Enterprise-Grade Real Estate Management</span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            className="mb-6 flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          >
            <img src={logo} alt="Horizon Properties" className="h-16 object-contain" />
            <h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a2b4b] leading-[1.1] tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
            >
              Admin Console
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p
            className="text-lg md:text-xl text-[#64748b] mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          >
            Manage leads, assignments, tours, and conversations — with complete
            auditability and role-based access control.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
          >
            <motion.button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-[#1a2b4b] text-white h-11 rounded-md px-8 group w-full sm:w-auto transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(26,43,75,0.2)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
             <Link
                  to="/auth"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-[#1a2b4b] text-white h-11 rounded-md px-8 group w-full sm:w-auto transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(26,43,75,0.2)]"
                >
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </motion.button>

            <motion.button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-[#e2e8f0] bg-white text-[#1a2b4b] hover:bg-[#f1f5f9] h-11 rounded-md px-8 w-full sm:w-auto transition-all duration-200"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn What&apos;s Inside
              <ChevronDown className="ml-2 w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
