// Stylised assistant avatar — illustrated, not a real face. Soft gradients,
// closed-eye smile, headset detail to read clearly as "AI travel assistant"
// rather than a real staffer. Built-in SMIL animations (blink, sparkle
// pulse, mic-boom thinking glow) so the face feels alive even without JS.
//
// Pure SVG, no React state — safe to import from server or client components.

interface Props {
  size?: number;
  className?: string;
}

export default function AriaFace({ size = 40, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aria, AI travel assistant"
      className={className}
    >
      <defs>
        <radialGradient id="ariaBg" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FBE7C2" />
          <stop offset="100%" stopColor="#E8B86F" />
        </radialGradient>
        <linearGradient id="ariaSkin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5D3A8" />
          <stop offset="100%" stopColor="#E5B589" />
        </linearGradient>
        <linearGradient id="ariaHair" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A2417" />
          <stop offset="100%" stopColor="#1F1208" />
        </linearGradient>
      </defs>

      {/* Background disc */}
      <circle cx="40" cy="40" r="40" fill="url(#ariaBg)" />

      {/* Hair back silhouette */}
      <path
        d="M40 16c-13 0-22 10-22 22 0 8 3 14 7 18v6h30v-6c4-4 7-10 7-18 0-12-9-22-22-22z"
        fill="url(#ariaHair)"
      />

      {/* Face — gentle breathing scale */}
      <g transform="translate(40 42)">
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.012;1"
          dur="3.6s"
          additive="sum"
          repeatCount="indefinite"
        />
        <ellipse cx="0" cy="0" rx="14" ry="16.5" fill="url(#ariaSkin)" />
        <ellipse cx="-11" cy="6" rx="3.5" ry="2.2" fill="#F4A0A0" opacity="0.45" />
        <ellipse cx="11"  cy="6" rx="3.5" ry="2.2" fill="#F4A0A0" opacity="0.45" />

        {/* Blinking eyes */}
        <path stroke="#2A1B0E" strokeWidth="2" strokeLinecap="round" fill="none">
          <animate
            attributeName="d"
            values="M-10 -3 Q-7 -6 -4 -3; M-10 -3 Q-7 -3 -4 -3; M-10 -3 Q-7 -6 -4 -3"
            keyTimes="0;0.5;1"
            dur="0.18s"
            begin="0s;4s;8s;12s;16s"
            fill="freeze"
          />
          <set attributeName="d" to="M-10 -3 Q-7 -6 -4 -3" begin="0s" />
        </path>
        <path stroke="#2A1B0E" strokeWidth="2" strokeLinecap="round" fill="none">
          <animate
            attributeName="d"
            values="M4 -3 Q7 -6 10 -3; M4 -3 Q7 -3 10 -3; M4 -3 Q7 -6 10 -3"
            keyTimes="0;0.5;1"
            dur="0.18s"
            begin="0s;4s;8s;12s;16s"
            fill="freeze"
          />
          <set attributeName="d" to="M4 -3 Q7 -6 10 -3" begin="0s" />
        </path>

        {/* Smile — gentle widening on the breath beat */}
        <path stroke="#B36A52" strokeWidth="2" strokeLinecap="round" fill="none">
          <animate
            attributeName="d"
            values="M-4 9 Q0 12 4 9; M-5 9 Q0 13 5 9; M-4 9 Q0 12 4 9"
            keyTimes="0;0.5;1"
            dur="3.6s"
            repeatCount="indefinite"
          />
          <set attributeName="d" to="M-4 9 Q0 12 4 9" />
        </path>
      </g>

      {/* Headset arc */}
      <path
        d="M22 36 Q22 16 40 16 Q58 16 58 36"
        stroke="#0E7C7B"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="19" y="34" width="6" height="9" rx="2" fill="#0E7C7B" />
      <rect x="55" y="34" width="6" height="9" rx="2" fill="#0E7C7B" />
      <path d="M55 41 Q49 44 47 50" stroke="#0E7C7B" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Mic tip — pulsing teal "active" dot */}
      <circle cx="46.5" cy="50.5" r="1.6" fill="#0E7C7B">
        <animate attributeName="r" values="1.6;2.4;1.6" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.55;1" dur="1.8s" repeatCount="indefinite" />
      </circle>

      {/* Sparkle accent — twinkles every 2.6 s */}
      <g transform="translate(58 18)">
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.35;1"
          dur="2.6s"
          additive="sum"
          repeatCount="indefinite"
        />
        <path d="M0 -5 L1 -1 L5 0 L1 1 L0 5 L-1 1 L-5 0 L-1 -1 Z" fill="#E5B547" />
      </g>
    </svg>
  );
}
