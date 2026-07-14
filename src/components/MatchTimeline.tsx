"use client";

import { TelemetryEvent } from "@/lib/types";
import { MATCH_INFO } from "@/data/stadium";

interface MatchTimelineProps {
  events: TelemetryEvent[];
}

const matchPhases = [
  { label: "Pre-Match", startMin: -60, icon: "🏟️" },
  { label: "Gates Open", startMin: -120, icon: "🚪" },
  { label: "Kickoff", startMin: 0, icon: "⚽" },
  { label: "First Half", startMin: 0, icon: "⏱️" },
  { label: "Halftime", startMin: 45, icon: "☕" },
  { label: "Second Half", startMin: 45, icon: "⏱️" },
  { label: "Full Time", startMin: 90, icon: "🏁" },
  { label: "Post-Match", startMin: 90, icon: "🎉" },
];

export default function MatchTimeline({ events }: MatchTimelineProps) {
  const now = new Date();
  const matchStart = new Date(MATCH_INFO.kickoffTime);
  const minutesSinceKickoff = Math.floor((now.getTime() - matchStart.getTime()) / 60000);

  const currentPhase = minutesSinceKickoff < -120
    ? matchPhases[0]
    : minutesSinceKickoff < 0
      ? matchPhases[1]
      : minutesSinceKickoff < 45
        ? matchPhases[3]
        : minutesSinceKickoff < 50
          ? matchPhases[4]
          : minutesSinceKickoff < 90
            ? matchPhases[5]
            : matchPhases[7];

  const displayMinute = Math.max(0, minutesSinceKickoff);

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">⏱️</span>
          <h2 className="text-sm font-semibold text-white">Match Timeline</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">{currentPhase.icon} {currentPhase.label}</span>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            {displayMinute}&apos;
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Match Progress Bar */}
        <div className="relative mb-4">
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(0, (displayMinute / 90) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] text-slate-600">
            <span>0&apos;</span>
            <span>45&apos;</span>
            <span>90&apos;</span>
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
            Recent Activity ({events.length} events)
          </p>
          {events.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-3">No events yet — match is quiet</p>
          ) : (
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {[...events].slice(0, 10).map((event, idx) => {
                const eventTime = new Date(event.timestamp);
                const minsAgo = Math.floor((now.getTime() - eventTime.getTime()) / 60000);
                const severityColor =
                  event.severity === "CRITICAL"
                    ? "bg-red-500"
                    : event.severity === "WARNING"
                      ? "bg-amber-500"
                      : "bg-blue-500";

                return (
                  <div
                    key={event.id}
                    className={`flex items-center gap-2 py-1.5 ${idx === 0 ? "animate-[fadeIn_0.3s_ease-out]" : ""}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${severityColor} ${idx === 0 ? "animate-pulse" : ""}`} />
                    <span className="text-[10px] text-slate-500 w-12 font-mono">
                      {minsAgo < 1 ? "now" : `${minsAgo}m ago`}
                    </span>
                    <span className="text-[11px] text-slate-300 flex-1 truncate">
                      {event.description.slice(0, 60)}...
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
