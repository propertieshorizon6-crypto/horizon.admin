
import { Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Footer = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <motion.footer
      ref={ref}
      className="py-12 bg-[#f8fafc] border-t border-[#e2e8f0]"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] flex items-center justify-center shadow-[0_0_20px_0_rgba(245,159,10,0.3)]">
              <Building2
                className="w-6 h-6 text-white"
                aria-hidden="true"
              />
            </div>
            <div>
              <h3 className="font-bold text-[#0f172a] text-base leading-tight">
                Horizon Properties
              </h3>
              <p className="text-[12px] text-[#64748b] leading-tight">
                Admin Console
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center flex-wrap gap-x-6 gap-y-3 text-[14px] justify-center md:justify-start">
            <a
              href="#"
              className="text-[#64748b] hover:text-[#0f172a] transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-[#64748b] hover:text-[#0f172a] transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="mailto:admin-support@horizon.properties"
              className="text-[#64748b] hover:text-[#0f172a] transition-colors duration-200"
            >
              Support
            </a>
          </div>

          {/* Copyright Section */}
          <p className="text-[14px] text-[#64748b]">
            &copy; 2026 Horizon Properties
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
