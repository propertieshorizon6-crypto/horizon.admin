import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import React from "react";



export default function AuthLayout({ children }) {
  return (
    <div className="flex w-full min-h-screen">
      {/* Left Blue Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1A2744] via-[#1A2744] to-[#1E293B] p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Glowing Circles */}
        <motion.div
          className="absolute inset-0 opacity-10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 rounded-full bg-[#FBBF24] blur-[128px]"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-[#FBBF24] blur-[128px]"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
          />
        </motion.div>

        {/* Logo Section */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#F59F0A] flex items-center justify-center shadow-[0_0_20px_0_rgba(245,159,10,0.3)]"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.3,
              }}
            >
              <Building2 className="w-8 h-8 text-[#1A2744]" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Horizon
              </h1>
              <p className="text-white/60 text-sm uppercase tracking-[0.15em] font-medium leading-tight">
                Properties
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hero Text */}
        <motion.div
          className="relative z-10 mt-auto mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        >
          <h2 className="font-display text-[40px] font-semibold text-white mb-6 leading-[1.15] tracking-tight">
            Elevate Your
            <br />
            Real Estate Operations
          </h2>
          <p className="text-white/70 text-lg max-w-md leading-relaxed font-sans">
            Manage leads, properties, and agents with our comprehensive admin
            portal designed for modern real estate professionals.
          </p>
        </motion.div>

        {/* Statistics Bar */}
        <motion.div
          className="relative z-10 flex items-center gap-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.8 }}
        >
          {[
            { value: "500+", label: "Active Listings" },
            { value: "50+", label: "Expert Agents" },
            { value: "24/7", label: "Lead Tracking" },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div className="w-px h-12 bg-white/20" />}
              <motion.div
                className="flex flex-col"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.15 }}
              >
                <p className="text-[32px] font-bold text-[#FBBF24] leading-none mb-2">
                  {stat.value}
                </p>
                <p className="text-white/60 text-sm font-medium">
                  {stat.label}
                </p>
              </motion.div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
        {children}
      </div>
    </div>
  );
}
