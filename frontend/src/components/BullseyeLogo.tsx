export function BullseyeLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5" />
      
      {/* Middle ring */}
      <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="5" />
      
      {/* Inner ring */}
      <circle cx="50" cy="50" r="19" fill="none" stroke="currentColor" strokeWidth="5" />
      
      {/* Bullseye center */}
      <circle cx="50" cy="50" r="8" fill="currentColor" />
      
      {/* Arrow shaft */}
      <line
        x1="90"
        y1="10"
        x2="50"
        y2="50"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      
      {/* Arrow head - top part */}
      <line
        x1="50"
        y1="50"
        x2="58"
        y2="38"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Arrow head - bottom part */}
      <line
        x1="50"
        y1="50"
        x2="62"
        y2="42"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Arrow fletching - top */}
      <line
        x1="90"
        y1="10"
        x2="86"
        y2="3"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Arrow fletching - bottom */}
      <line
        x1="90"
        y1="10"
        x2="97"
        y2="14"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
