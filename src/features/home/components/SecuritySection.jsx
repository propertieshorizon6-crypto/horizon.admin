import React from "react";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const tags = ["RBAC", "Audit Logs", "Export Ready", "Secure Sessions"];

const SecuritySection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section className="py-16 bg-[#2D368E] text-[#FFFFFF]" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center">
          {/* Lock Icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Lock className="w-12 h-12 opacity-80" strokeWidth={1.5} />
          </motion.div>

          {/* Heading */}
          <motion.h2
            className="font-display text-2xl md:text-[32px] font-bold mb-4 tracking-normal leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            Security & Compliance Built-In
          </motion.h2>

          {/* Subtext */}
          <motion.p
            className="text-[#FFFFFF]/80 max-w-2xl mx-auto mb-8 text-base md:text-lg leading-relaxed font-sans"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            Role-based access, comprehensive audit logging, and data exports —
            everything you need for enterprise governance.
          </motion.p>

          {/* Feature Tags */}
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {tags.map((tag, index) => (
              <motion.div
                key={tag}
                className="px-[16px] py-[8px] rounded-full bg-[#FFFFFF]/10 border border-[#FFFFFF]/20 text-sm font-medium font-sans"
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                  delay: 0.35 + index * 0.1,
                }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                {tag}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
