import { motion } from "framer-motion";
import React from "react";

import logo from "../../../assets/horizon-logo.png";
const LOGO_SRC = logo;
const BRAND_ORANGE = "#CA5428";
const BRAND_NAVY   = "#22225E";

export default function AuthLayout({ children }) {
  return (
    <div className="flex w-full min-h-screen">

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${BRAND_NAVY} 0%, #1a1a4e 60%, #1E293B 100%)` }}
      >
        {/* Glow circles */}
        <motion.div
          className="absolute inset-0 opacity-10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 rounded-full blur-[128px]"
            style={{ background: BRAND_ORANGE }}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-[128px]"
            style={{ background: BRAND_ORANGE }}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
          />
        </motion.div>

        {/* Logo */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <img
            src={LOGO_SRC}
            alt="Horizon Properties"
            style={{ height: 90, width: "auto", userSelect: "none", filter: "brightness(1.08)" }}
            draggable={false}
          />  
                </motion.div>

        {/* Hero text */}
        <motion.div
          className="relative z-10 mt-auto mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        >
          <h2 className="font-display text-[40px] font-semibold text-white mb-6 leading-[1.15] tracking-tight">
            Elevate Your<br />Real Estate Operations
          </h2>
          <p className="text-white/70 text-lg max-w-md leading-relaxed font-sans">
            Manage leads, properties, and agents with our comprehensive admin
            portal designed for modern real estate professionals.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="relative z-10 flex items-center gap-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.8 }}
        >
          {[
            { value: "500+", label: "Active Listings" },
            { value: "50+",  label: "Expert Agents"   },
            { value: "24/7", label: "Lead Tracking"   },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div className="w-px h-12 bg-white/20" />}
              <motion.div
                className="flex flex-col"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.15 }}
              >
                <p className="text-[32px] font-bold leading-none mb-2" style={{ color: BRAND_ORANGE }}>
                  {stat.value}
                </p>
                <p className="text-white/60 text-sm font-medium">{stat.label}</p>
              </motion.div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* ── Right — login form ── */}
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
        {children}
      </div>

    </div>
  );
}