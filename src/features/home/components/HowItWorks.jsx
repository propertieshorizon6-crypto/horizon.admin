import React from "react";
import {
  Phone,
  Globe,
  MessageSquare,
  Users,
  ClipboardCheck,
  Calendar,
  FileText,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const steps = [
  {
    id: 1,
    title: "Receive Lead",
    description: "Leads flow in from app, website, call, or WhatsApp",
    icon: <Phone className="w-5 h-5 text-[#1A2B4B]" />,
    subIcons: [
      <Globe key="globe" className="w-4 h-4 text-[#64748B]" />,
      <Phone key="phone" className="w-4 h-4 text-[#64748B]" />,
      <MessageSquare key="msg" className="w-4 h-4 text-[#64748B]" />,
    ],
  },
  {
    id: 2,
    title: "Assign Agent",
    description: "Smart assignment based on territory and workload",
    icon: <Users className="w-5 h-5 text-[#1A2B4B]" />,
    subIcons: [<Users key="users" className="w-4 h-4 text-[#64748B]" />],
  },
  {
    id: 3,
    title: "Track Outcomes",
    description: "Monitor tours, inquiries, and conversation progress",
    icon: <ClipboardCheck className="w-5 h-5 text-[#1A2B4B]" />,
    subIcons: [
      <Calendar key="cal" className="w-4 h-4 text-[#64748B]" />,
      <ClipboardCheck key="clip" className="w-4 h-4 text-[#64748B]" />,
    ],
  },
  {
    id: 4,
    title: "Export & Audit",
    description: "Generate reports and maintain compliance",
    icon: <FileText className="w-5 h-5 text-[#1A2B4B]" />,
    subIcons: [
      <FileText key="file" className="w-4 h-4 text-[#64748B]" />,
      <Lock key="lock" className="w-4 h-4 text-[#64748B]" />,
    ],
  },
];

const HowItWorks = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1A2B4B] mb-4">
            How It Works
          </h2>
          <p className="text-[#64748B] max-w-2xl mx-auto font-sans">
            A streamlined workflow from lead capture to successful conversion
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Central Vertical Line (Base) */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#E2E8F0] md:-translate-x-1/2" />

          {/* Central Vertical Line (Gradient) - animated grow */}
          <motion.div
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 md:-translate-x-1/2 origin-top"
            style={{
              background:
                "linear-gradient(to bottom, #f59e0b, #1a2b4b, #22c55e)",
            }}
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => {
              const isEven = index % 2 !== 0;

              return (
                <motion.div
                  key={step.id}
                  className={`relative flex items-center gap-6 md:flex-row ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                  initial={{
                    opacity: 0,
                    x: isEven ? 60 : -60,
                  }}
                  animate={
                    inView
                      ? {
                          opacity: 1,
                          x: 0,
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    delay: 0.2 * index + 0.4,
                  }}
                >
                  {/* Number Indicator */}
                  <motion.div
                    className="absolute left-8 md:left-1/2 w-10 h-10 rounded-full bg-white border-4 border-[#F59E0B] flex items-center justify-center z-10 -translate-x-1/2 md:-translate-x-1/2 shadow-sm"
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                      delay: 0.2 * index + 0.5,
                    }}
                  >
                    <span className="text-sm font-bold text-[#F59E0B]">
                      {step.id}
                    </span>
                  </motion.div>

                  {/* Card Content Wrapper */}
                  <div
                    className={`ml-14 sm:ml-20 md:ml-0 md:w-5/12 ${
                      !isEven ? "md:pr-8 md:text-right" : "md:pl-8"
                    }`}
                  >
                    <motion.div
                      className="rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm"
                      whileHover={{
                        y: -4,
                        boxShadow:
                          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <div className="flex flex-col space-y-1.5 p-6 pb-2">
                        <h3
                          className={`font-semibold tracking-tight text-lg flex items-center gap-2 ${
                            !isEven
                              ? "md:justify-end md:flex-row"
                              : "md:justify-start"
                          }`}
                        >
                          <span className={!isEven ? "md:order-last" : ""}>
                            {step.title}
                          </span>
                          {step.icon}
                        </h3>
                      </div>
                      <div className="p-6 pt-0">
                        <p className="text-sm text-[#64748B] font-sans">
                          {step.description}
                        </p>

                        {/* Sub-icons at bottom of card */}
                        <div
                          className={`flex gap-2 mt-3 ${
                            !isEven ? "md:justify-end" : "md:justify-start"
                          }`}
                        >
                          {step.subIcons.map((icon, idx) => (
                            <motion.div
                              key={idx}
                              className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={
                                inView ? { opacity: 1, scale: 1 } : {}
                              }
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 15,
                                delay: 0.2 * index + 0.6 + idx * 0.1,
                              }}
                            >
                              {icon}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Spacer for desktop layout */}
                  <div className="hidden md:block md:w-5/12"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
