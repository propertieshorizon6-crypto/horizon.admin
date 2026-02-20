import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";

export default function AuthCard({ children }) {
  return (
    <motion.div
      className="w-full max-w-[448px] rounded-xl bg-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-8 sm:p-10 flex flex-col">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 mb-6"
        >
          <ArrowLeft size={16} />
          Back to landing
        </Link>

        {/* Mobile Only Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#F59F0A] flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7 text-[#1A2744]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A2744]">
              Horizon Properties
            </h1>
          </div>

        <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h3 className="text-2xl font-semibold text-[#0F172A] mb-2 tracking-tight">
                  Welcome Back
                </h3>
                <p className="text-sm text-[#64748B]">
                  
                  Sign in to access the admin portal
                </p>
              </motion.div>

        {/* Google Button */}
        <motion.button
                className="flex items-center justify-center gap-3 w-full h-12 px-4 py-2 border border-[#E2E8F0] rounded-lg bg-white text-sm font-medium text-[#0F172A] hover:bg-[#F1F5F9] transition-all duration-200"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </motion.button>

        {/* Divider */}
        <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2E8F0]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-[#64748B] font-medium tracking-wider">
                    or continue with email
                  </span>
                </div>
              </div>

        {children}

      </div>
    </motion.div>
  );
}
