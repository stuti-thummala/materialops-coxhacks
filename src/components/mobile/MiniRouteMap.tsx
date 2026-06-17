import { MapPin, Flag } from "lucide-react";

interface MiniRouteMapProps {
  start: string;
  end: string;
}

export function MiniRouteMap({ start, end }: MiniRouteMapProps) {
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg border border-ops-border">
      <svg viewBox="0 0 400 160" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="miniMapGrad" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#16314a" />
            <stop offset="100%" stopColor="#0D2533" />
          </radialGradient>
        </defs>
        <rect width="400" height="160" fill="url(#miniMapGrad)" />
        <g opacity="0.14" stroke="#9fc3e6" strokeWidth="1">
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={160} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 50} x2={400} y2={i * 50} />
          ))}
        </g>
        <path
          d="M 60 110 C 140 60, 240 140, 330 50"
          fill="none"
          stroke="#1F9D66"
          strokeWidth="2.5"
          strokeDasharray="6 6"
        />
        <circle cx="60" cy="110" r="8" fill="#1F9D66" />
        <circle cx="330" cy="50" r="8" fill="#2F6FDB" />
      </svg>
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-ops-surface/95 px-2 py-1 text-xs font-medium text-ops-green backdrop-blur">
        <MapPin className="h-3.5 w-3.5 text-ops-green" />
        {start}
      </div>
      <div className="absolute right-2 top-2 flex items-center gap-1.5 rounded-md bg-ops-surface/95 px-2 py-1 text-xs font-medium text-ops-blue backdrop-blur">
        <Flag className="h-3.5 w-3.5 text-ops-blue" />
        {end}
      </div>
    </div>
  );
}
