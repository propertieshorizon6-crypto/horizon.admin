import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../../../assets/logo.png";

export default function AuthCard({
  children,
  title = "Welcome Back",
  subtitle = "Sign in to access the admin portal",
}) {
  return (
    <motion.div
      className="w-full max-w-[448px] rounded-2xl bg-white shadow-[0_24px_40px_-8px_rgba(0,0,0,0.12)] overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="p-8 sm:p-10 flex flex-col">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to landing
        </Link>

        {/* Mobile Only Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
          <img
            src={logo}
            alt="Horizon Properties"
            style={{ height: 64, width: "auto", userSelect: "none" }}
            draggable={false}
          />
        </div>

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h3 className="text-2xl font-bold text-[#0F172A] mb-1 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-[#64748B]">
            {subtitle}
          </p>
        </motion.div>

        {children}

      </div>
    </motion.div>
  );
}
