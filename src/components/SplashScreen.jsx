import { useEffect, useRef } from "react";
import { motion as Motion } from "framer-motion";
import horizonLogo from "../assets/horizon-only-logo.png";
import leadingReLogo from "../assets/Leading.png";
import auction from "../assets/auction_logo.png";
import village from "../assets/green_village.png";
import tree from "../assets/tree.png";

const TEXT = "Real\u00A0Property\u00A0Merchants";

const WATERMARKS = [
  { src: auction,      x: "70%", y: "88%", rotate: 0, scale: 1.19,  invertBlack: true  },
  { src: leadingReLogo,x: "7%",  y: "5%",  rotate: 0, scale: 1.7,  invertBlack: true  },
  { src: village,      x: "80%", y: "38%", rotate: 0, scale: 1.4,  invertBlack: false },
  { src: tree,         x: "70%", y: "2%",  rotate: 0, scale: 1.99, invertBlack: true  },
  { src: village,      x: "2%",  y: "35%", rotate: 0, scale: 1.4,  invertBlack: false },
  { src: village,      x: "7%",  y: "82%", rotate: 0, scale: 1.65, invertBlack: false },
  { src: auction,      x: "15%",  y: "58%", rotate: 0, scale: 1.2,  invertBlack: true  },
  { src: leadingReLogo,x: "70%", y: "63%", rotate: 0, scale: 1.5,  invertBlack: true  },
  { src: tree,         x: "30%", y: "45%", rotate: 0, scale: 1.99,  invertBlack: true  },
  // ── Extra fills for desktop empty zones ──
  // { src: village,      x: "40%", y: "68%", rotate: 0, scale: 0.9,  invertBlack: false },
  // { src: auction,      x: "80%", y: "15%", rotate: 0, scale: 0.95, invertBlack: true  },
  // { src: tree,         x: "40%", y: "93%", rotate: 0, scale: 1.6,  invertBlack: true  },
  // { src: leadingReLogo,x: "78%", y: "82%", rotate: 0, scale: 1,  invertBlack: true  },
  // { src: village,      x: "45%", y: "10%", rotate: 0, scale: 1, invertBlack: false },
];

export default function SplashScreen() {
  const textPathRef = useRef(null);

  useEffect(() => {
    const el = textPathRef.current;
    if (!el) return;
    el.innerHTML = "";
    TEXT.split("").forEach((ch, i) => {
      const ts = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      ts.textContent = ch === " " ? "\u00A0" : ch;
      ts.setAttribute("opacity", "0");
      ts.style.transition = "opacity 0.18s ease";
      el.appendChild(ts);
      setTimeout(() => ts.setAttribute("opacity", "1"), 950 + i * 52);
    });
  }, []);

  return (
    <Motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between"
      style={{ backgroundColor: "#2D368E", padding: "5vh 0" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background watermarks */}
      {WATERMARKS.map((wm, i) => (
        <Motion.img
          key={i}
          src={wm.src}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            left: wm.x,
            top: wm.y,
            width: "clamp(80px, 10vw, 160px)",
            objectFit: "contain",
            filter: wm.invertBlack
              ? "invert(1) hue-rotate(180deg)"
              : "brightness(0) invert(1)",
            transform: `rotate(${wm.rotate}deg) scale(${wm.scale})`,
            transformOrigin: "top left",
            pointerEvents: "none",
            userSelect: "none",
          }}
          initial={{ opacity: 0.1 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
        />
      ))}

      {/* ── TOP SECTION: Logo + arc text ── */}
      <Motion.div
        style={{ position: "relative", width: 270, height: 240 }}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
      >
        <img
          src={horizonLogo}
          alt="Horizon"
          style={{
            width: 230,
            objectFit: "contain",
            position: "absolute",
            top: 120,
            left: 20,
            zIndex: 1,
            clipPath: "inset(0% 0% 0% 0%)",
          }}
        />
        <svg
          width="320"
          height="250"
          viewBox="0 0 320 120"
          style={{ position: "absolute", top: 50, left: -30, zIndex: 2 }}
        >
          <defs>
            <path id="rpmArc" d="M 10,110 A 160,160 0 0,1 310,110" />
          </defs>
          <text fontFamily="'Great Vibes', cursive" fontSize="26" fill="white" letterSpacing="1px">
            <textPath
              ref={textPathRef}
              href="#rpmArc"
              startOffset="52%"
              textAnchor="middle"
              letterSpacing="1"
            />
          </text>
        </svg>
      </Motion.div>

      {/* ── MIDDLE: Bouncing dots ── */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <Motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
            transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>

      {/* ── BOTTOM SECTION: Member of ── */}
      {/* No marginTop needed — justify-between handles spacing */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Motion.p
          style={{
            color: "white",
            fontSize: 13,
            letterSpacing: 2,
            opacity: 0.85,
            textTransform: "uppercase",
            margin: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          A member of 
        </Motion.p>
        <Motion.img
          src={leadingReLogo}
          alt="LeadingRE"
          style={{
            width: "clamp(190px, 30vw, 240px)",
            // ↑ responsive logo width
            filter: "brightness(0) invert(1)",
            opacity: 0.9,
            marginBottom: 58,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.5, delay: 2.5 }}
        />
      </div>
    </Motion.div>
  );
}