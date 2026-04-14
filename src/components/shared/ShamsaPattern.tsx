export function ShamsaPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 z-0 pointer-events-none opacity-[0.04] ${className}`}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="shamsa" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M30 0 L34.5 15 L45 6 L42 21 L57 15 L48 27 L60 30 L48 33 L57 45 L42 39 L45 54 L34.5 45 L30 60 L25.5 45 L15 54 L18 39 L3 45 L12 33 L0 30 L12 27 L3 15 L18 21 L15 6 L25.5 15 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#shamsa)" />
      </svg>
    </div>
  );
}
