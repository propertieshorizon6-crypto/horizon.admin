
import React, { useState } from "react";
import { Users, Calendar, Shield, ArrowRight, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

const features = [
  {
    title: "Lead Command Center",
    description: "Lead intake, assignment, and SLA tracking",
    icon: Users,
    gradient: "from-[#1A2B4B] to-[#1A2B4B]/70",
    iconColor: "text-white",
    details: [
      "Multi-source lead capture (app, website, call, WhatsApp)",
      "Intelligent agent assignment",
      "Priority-based SLA monitoring",
      "Lead status lifecycle management",
      "Bulk actions for efficiency",
    ],
  },
  {
    title: "Tours & Inquiries",
    description: "Schedule, confirm, and manage your pipeline",
    icon: Calendar,
    gradient: "from-[#F59E0B] to-[#F59E0B]/70",
    iconColor: "text-white",
    details: [
      "Automated tour scheduling & reminders",
      "Calendar sync with Google & Outlook",
      "Inquiry tracking and follow-up automation",
      "Pipeline stage visualization",
      "Performance analytics per agent",
    ],
  },
  {
    title: "Governance",
    description: "Audit logs, exports, and access control",
    icon: Shield,
    gradient: "from-[#22C55E] to-[#22C55E]/70",
    iconColor: "text-white",
    details: [
      "Comprehensive audit trail logging",
      "Role-based access control (RBAC)",
      "Data export in multiple formats",
      "Compliance reporting dashboards",
      "Activity monitoring and alerts",
    ],
  },
];

const Features = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [selectedFeature, setSelectedFeature] = useState(null);


  return (
    <section id="features" className="py-20 bg-[#F6F7F9]/30">
      <div className="container mx-auto px-4 max-w-[1280px]" ref={ref}>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
            Powerful Features
          </h2>
          <p className="text-[#64748B] max-w-2xl mx-auto text-base">
            Everything you need to manage your real estate operations efficiently
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 ">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: 0.15 * index + 0.2,
              }}
            >
              <motion.div
                className="rounded-lg border border-[#E2E8F0]/50 bg-white text-[#0F172A] shadow-sm group cursor-pointer h-full transition-colors duration-300"
                whileHover={{
                  y: -8,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  borderColor: "#E2E8F0",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex flex-col space-y-1.5 p-6">
                  <motion.div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <feature.icon
                      className={`w-7 h-7 ${feature.iconColor}`}
                    />
                  </motion.div>
                  <h3 className="font-semibold tracking-tight text-xl mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#64748B]">
                    {feature.description}
                  </p>
                </div>
                <div className="p-6 pt-0">
                  <button
                    onClick={() => setSelectedFeature(index)}
                    className="text-sm text-[#1A2B4B] font-medium flex items-center gap-1"
                  >
                    View Details
                    <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedFeature !== null && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/90 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeature(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeature(null)}
            >
              <motion.div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {(() => {
                  const feature = features[selectedFeature];
                  return (
                    <>
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                      >
                        <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold text-[#0F172A] mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#64748B] mb-6 pb-4 border-b border-[#E2E8F0]">
                        {feature.description}
                      </p>
                      <div className="space-y-3">
                        {feature.details.map((detail, i) => (
                          <motion.div
                            key={i}
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i + 0.1 }}
                          >
                            <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
                            <span className="text-sm text-[#334155]">{detail}</span>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Features;
