export default function HorizonLogo({ height = 160 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 560 560"
      style={{ height, width: "auto", userSelect: "none" }}
      draggable={false}
    >
      <defs>
        <pattern id="brick" x="80" y="300" width="56" height="22" patternUnits="userSpaceOnUse">
          <rect width="56" height="22" fill="#7A3510"/>
          <rect x="1" y="1"  width="53" height="9" fill="#C96C38"/>
          <rect x="29" y="12" width="53" height="9" fill="#C96C38"/>
          <rect x="-27" y="12" width="53" height="9" fill="#C96C38"/>
        </pattern>
        <path id="topArc" d="M 64,185 A 247,247 0 0,1 496,185" fill="none"/>
      </defs>

      {/* "Real Property Merchants" arched */}
      <text
        fontFamily="'Dancing Script', cursive"
        fontWeight="700"
        fontSize="38"
        fill="#ffffff"
      >
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">
          Real Property Merchants
        </textPath>
      </text>

      {/* Apex knob */}
      <circle cx="280" cy="196" r="10" fill="#2D368E"/>

      {/* Roof */}
      <polygon points="280,206 46,302 514,302" fill="#2D368E"/>

      {/* Brick wall */}
      <rect x="80" y="300" width="400" height="132" fill="url(#brick)"/>

      {/* HORIZON */}
      <text
        x="280" y="396"
        fontFamily="'Rye', serif"
        fontWeight="400"
        fontSize="76"
        letterSpacing="1"
        textAnchor="middle"
        fill="#ffffff"
        stroke="#2D368E"
        strokeWidth="3"
        paintOrder="stroke fill"
      >HORIZON</text>

      {/* Properties® */}
      <text
        x="280" y="490"
        fontFamily="'Dancing Script', cursive"
        fontWeight="700"
        fontSize="58"
        textAnchor="middle"
        fill="#ffffff"
      >Properties®</text>
    </svg>
  );
}
