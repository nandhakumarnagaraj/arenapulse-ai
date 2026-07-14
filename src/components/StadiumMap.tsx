"use client";

import { StadiumZone } from "@/lib/types";

interface StadiumMapProps {
  zones: StadiumZone[];
  selectedZoneId: string | null;
  onZoneClick: (zoneId: string) => void;
}

const zonePositions: Record<string, { x: number; y: number; w: number; h: number }> = {
  "gate-a": { x: 150, y: 20, w: 200, h: 80 },
  "gate-b": { x: 420, y: 140, w: 80, h: 200 },
  "gate-c": { x: 150, y: 400, w: 200, h: 80 },
  "gate-d": { x: 0, y: 140, w: 80, h: 200 },
  "concourse": { x: 120, y: 140, w: 260, h: 200 },
  "transit-hub": { x: 150, y: 500, w: 200, h: 60 },
};

const statusColors = {
  normal: { fill: "#059669", stroke: "#10b981", text: "text-emerald-400" },
  elevated: { fill: "#d97706", stroke: "#f59e0b", text: "text-amber-400" },
  critical: { fill: "#dc2626", stroke: "#ef4444", text: "text-red-400" },
};

export default function StadiumMap({ zones, selectedZoneId, onZoneClick }: StadiumMapProps) {
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Stadium Layout — MetLife</h2>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Elevated</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
        </div>
      </div>

      <div className="relative w-full aspect-[5/6] max-h-[560px]">
        <svg
          viewBox="0 0 500 580"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stadium outer oval */}
          <ellipse
            cx="250"
            cy="270"
            rx="240"
            ry="250"
            fill="none"
            stroke="#334155"
            strokeWidth="2"
            strokeDasharray="4,4"
          />

          {/* Field */}
          <rect
            x="140"
            y="180"
            width="220"
            height="160"
            rx="8"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1"
          />
          <text x="250" y="265" textAnchor="middle" className="fill-slate-600 text-[14px] font-medium">
            FIELD
          </text>
          <text x="250" y="282" textAnchor="middle" className="fill-slate-700 text-[9px]">
            105m × 68m
          </text>

          {/* Zone rectangles */}
          {zones.map((zone) => {
            const pos = zonePositions[zone.id];
            if (!pos) return null;
            const colors = statusColors[zone.status];
            const isSelected = selectedZoneId === zone.id;
            const occupancyPercent = Math.round((zone.currentOccupancy / zone.capacity) * 100);

            return (
              <g
                key={zone.id}
                onClick={() => onZoneClick(zone.id)}
                className="cursor-pointer"
              >
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={pos.w}
                  height={pos.h}
                  rx="6"
                  fill={colors.fill}
                  fillOpacity={isSelected ? 0.35 : 0.15}
                  stroke={isSelected ? "#3b82f6" : colors.stroke}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeOpacity={isSelected ? 1 : 0.6}
                />
                {zone.status === "critical" && (
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={pos.w}
                    height={pos.h}
                    rx="6"
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="1"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.3;0.8;0.3"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}
                <text
                  x={pos.x + pos.w / 2}
                  y={pos.y + pos.h / 2 - 8}
                  textAnchor="middle"
                  className="fill-white text-[10px] font-semibold"
                >
                  {zone.name.split(" — ")[0]}
                </text>
                <text
                  x={pos.x + pos.w / 2}
                  y={pos.y + pos.h / 2 + 5}
                  textAnchor="middle"
                  className="fill-slate-300 text-[8px]"
                >
                  {occupancyPercent}% · {zone.waitTimeMinutes}m wait
                </text>
                {pos.w > 120 && (
                  <text
                    x={pos.x + pos.w / 2}
                    y={pos.y + pos.h / 2 + 18}
                    textAnchor="middle"
                    className={`text-[8px] font-medium ${colors.text}`}
                  >
                    {zone.status.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}

          {/* Directional arrows */}
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#475569" />
            </marker>
          </defs>
          <line x1="250" y1="105" x2="250" y2="140" stroke="#475569" strokeWidth="1" markerEnd="url(#arrowhead)" />
          <line x1="250" y1="440" x2="250" y2="475" stroke="#475569" strokeWidth="1" markerEnd="url(#arrowhead)" />
          <line x1="90" y1="270" x2="115" y2="270" stroke="#475569" strokeWidth="1" markerEnd="url(#arrowhead)" />
          <line x1="385" y1="270" x2="410" y2="270" stroke="#475569" strokeWidth="1" markerEnd="url(#arrowhead)" />
        </svg>
      </div>
    </div>
  );
}
