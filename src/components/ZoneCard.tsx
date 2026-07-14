"use client";

import React from "react";
import { StadiumZone } from "@/lib/types";

interface ZoneCardProps {
  zone: StadiumZone;
  isSelected: boolean;
  onClick: () => void;
}

const statusConfig = {
  normal: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    label: "Normal",
    text: "text-emerald-400",
    bar: "bg-emerald-500",
  },
  elevated: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
    label: "Elevated",
    text: "text-amber-400",
    bar: "bg-amber-500",
  },
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    dot: "bg-red-500",
    label: "Critical",
    text: "text-red-400",
    bar: "bg-red-500",
  },
};

export default React.memo(function ZoneCard({ zone, isSelected, onClick }: ZoneCardProps) {
  const config = statusConfig[zone.status];
  const occupancyPercent = Math.round(
    (zone.currentOccupancy / zone.capacity) * 100
  );

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-xl border p-4 transition-all duration-200
        ${config.bg} ${config.border}
        ${isSelected ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 scale-[1.02]" : "hover:scale-[1.01]"}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-sm">{zone.name}</h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Capacity: {zone.capacity.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${config.dot} ${zone.status === "critical" ? "animate-pulse" : ""}`} />
          <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Occupancy</span>
            <span className="text-white font-medium">{occupancyPercent}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${config.bar}`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Wait Time</span>
          <span className={`font-medium ${zone.waitTimeMinutes > 15 ? "text-red-400" : zone.waitTimeMinutes > 8 ? "text-amber-400" : "text-white"}`}>
            {zone.waitTimeMinutes} min
          </span>
        </div>

        {zone.gates.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {zone.gates.map((gate) => (
              <span
                key={gate}
                className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 text-[10px]"
              >
                {gate}
              </span>
            ))}
          </div>
        )}

        {zone.transitLines.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {zone.transitLines.map((line) => (
              <span
                key={line}
                className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px]"
              >
                {line}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
});
