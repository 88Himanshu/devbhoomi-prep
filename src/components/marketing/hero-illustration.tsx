/** Original inline illustration: Himalayan ridgeline, saffron sun, a study desk with book, laptop and checklist. */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 420" className={className} role="img" aria-label="Student preparing for Uttarakhand exams with mountains in the background">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef3fb" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="ridgeFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b3c8ee" />
          <stop offset="100%" stopColor="#d9e4f7" />
        </linearGradient>
        <linearGradient id="ridgeNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#163e86" />
          <stop offset="100%" stopColor="#1e4fa3" />
        </linearGradient>
        <linearGradient id="hills" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#23905c" />
          <stop offset="100%" stopColor="#166a42" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="560" height="420" rx="28" fill="url(#sky)" />
      {/* sun */}
      <circle cx="430" cy="92" r="34" fill="#ffc352" opacity="0.9" />
      <circle cx="430" cy="92" r="48" fill="#f4a300" opacity="0.12" />
      {/* far ridge */}
      <path d="M0 232 L70 170 L120 205 L180 140 L240 200 L300 150 L360 215 L420 165 L480 210 L560 160 L560 300 L0 300 Z" fill="url(#ridgeFar)" />
      {/* snow caps */}
      <path d="M180 140 L196 160 L172 162 Z M300 150 L316 170 L288 170 Z M420 165 L436 182 L406 182 Z" fill="#ffffff" opacity="0.9" />
      {/* near ridge */}
      <path d="M0 290 L60 236 L110 262 L170 214 L230 268 L290 226 L350 280 L410 240 L470 284 L560 228 L560 330 L0 330 Z" fill="url(#ridgeNear)" />
      {/* green hills */}
      <path d="M0 330 C 90 296, 160 300, 240 322 C 320 344, 400 300, 560 318 L560 420 L0 420 Z" fill="url(#hills)" />
      {/* desk */}
      <rect x="120" y="318" width="320" height="14" rx="6" fill="#0f2f6b" />
      <rect x="140" y="332" width="10" height="70" rx="3" fill="#0b2559" />
      <rect x="410" y="332" width="10" height="70" rx="3" fill="#0b2559" />
      {/* laptop */}
      <rect x="300" y="252" width="118" height="72" rx="8" fill="#ffffff" stroke="#b3c8ee" strokeWidth="2" />
      <rect x="310" y="262" width="98" height="46" rx="4" fill="#eef3fb" />
      <rect x="318" y="270" width="56" height="6" rx="3" fill="#1e4fa3" />
      <rect x="318" y="282" width="80" height="4" rx="2" fill="#b3c8ee" />
      <rect x="318" y="291" width="64" height="4" rx="2" fill="#b3c8ee" />
      <rect x="318" y="299" width="40" height="5" rx="2.5" fill="#1b7f4f" />
      <rect x="290" y="318" width="138" height="6" rx="3" fill="#d9e4f7" />
      {/* open book */}
      <path d="M150 300 Q 200 284 250 300 L250 322 Q 200 306 150 322 Z" fill="#ffffff" stroke="#b3c8ee" strokeWidth="2" />
      <path d="M200 292 L200 316" stroke="#b3c8ee" strokeWidth="2" />
      <path d="M160 302 L190 297 M160 310 L190 305 M210 297 L240 302 M210 305 L240 310" stroke="#7fa3e0" strokeWidth="2" strokeLinecap="round" />
      {/* checklist card */}
      <rect x="440" y="196" width="88" height="112" rx="10" fill="#ffffff" stroke="#b3c8ee" strokeWidth="2" />
      <rect x="452" y="210" width="40" height="6" rx="3" fill="#0b2559" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(452 ${228 + i * 18})`}>
          <rect width="12" height="12" rx="3" fill={i < 3 ? "#1b7f4f" : "#ffffff"} stroke={i < 3 ? "#1b7f4f" : "#b3c8ee"} strokeWidth="2" />
          {i < 3 && <path d="M3 6 L5.5 8.5 L9.5 3.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />}
          <rect x="18" y="3" width="46" height="5" rx="2.5" fill="#d9e4f7" />
        </g>
      ))}
      {/* student */}
      <circle cx="230" cy="216" r="22" fill="#f4c7a1" />
      <path d="M208 214 Q 230 186 252 214 Q 240 200 230 202 Q 220 200 208 214 Z" fill="#0b2559" />
      <path d="M190 318 L196 262 Q 230 236 264 262 L270 318 Z" fill="#1e4fa3" />
      <path d="M196 268 L170 300 Q 176 312 190 306 L206 284 Z" fill="#1e4fa3" />
      <path d="M264 268 L296 292 Q 300 304 288 304 L258 284 Z" fill="#1e4fa3" />
      <circle cx="176" cy="304" r="7" fill="#f4c7a1" />
      <circle cx="292" cy="298" r="7" fill="#f4c7a1" />
      {/* floating score chip */}
      <g transform="translate(40 60)">
        <rect width="132" height="52" rx="12" fill="#ffffff" stroke="#d9e4f7" strokeWidth="2" />
        <rect x="12" y="12" width="28" height="28" rx="8" fill="#ecf8f1" />
        <path d="M18 30 L24 24 L28 28 L36 18" stroke="#1b7f4f" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="24" fontSize="11" fill="#64748b" fontFamily="Inter, sans-serif">Accuracy</text>
        <text x="50" y="41" fontSize="15" fontWeight="700" fill="#0f172a" fontFamily="Inter, sans-serif">82% ↑</text>
      </g>
      <g transform="translate(60 150)">
        <rect width="120" height="44" rx="12" fill="#ffffff" stroke="#d9e4f7" strokeWidth="2" />
        <circle cx="22" cy="22" r="10" fill="#fff7e6" />
        <path d="M17 22 L21 26 L28 18" stroke="#b07200" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="40" y="19" fontSize="10" fill="#64748b" fontFamily="Inter, sans-serif">Mock test</text>
        <text x="40" y="33" fontSize="12" fontWeight="700" fill="#0f172a" fontFamily="Inter, sans-serif">Submitted</text>
      </g>
    </svg>
  );
}
