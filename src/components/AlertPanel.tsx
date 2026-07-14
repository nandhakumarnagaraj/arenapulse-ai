"use client";

import { TelemetryEvent } from "@/lib/types";

interface AlertPanelProps {
  events: TelemetryEvent[];
}

const severityStyles = {
  CRITICAL: {
    bg: "bg-red-500/5",
    border: "border-l-red-500",
    badge: "bg-red-500/20 text-red-300",
    dot: "bg-red-500",
    icon: "🔴",
  },
  WARNING: {
    bg: "bg-amber-500/5",
    border: "border-l-amber-500",
    badge: "bg-amber-500/20 text-amber-300",
    dot: "bg-amber-500",
    icon: "🟡",
  },
  INFO: {
    bg: "bg-blue-500/5",
    border: "border-l-blue-500",
    badge: "bg-blue-500/20 text-blue-300",
    dot: "bg-blue-500",
    icon: "🔵",
  },
};

const eventTypeLabels: Record<string, { label: string; icon: string }> = {
  gate_failure: { label: "Gate Failure", icon: "🚧" },
  crowd_spike: { label: "Crowd Surge", icon: "👥" },
  transit_delay: { label: "Transit Delay", icon: "🚇" },
  weather_alert: { label: "Weather Alert", icon: "⛈️" },
  medical: { label: "Medical", icon: "🏥" },
  normal: { label: "Routine", icon: "📋" },
};

export default function AlertPanel({ events }: AlertPanelProps) {
  const criticalCount = events.filter((e) => e.severity === "CRITICAL").length;
  const warningCount = events.filter((e) => e.severity === "WARNING").length;

  return (
    <div className="glass-panel h-full flex flex-col">
      <div className="px-4 py-3 border-b premium-divider">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">📡</span>
            <h2 className="text-sm font-semibold text-white">Live Telemetry</h2>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
            {events.length} events
          </span>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <span className="text-[10px] bg-red-500/10 text-red-300 px-2 py-0.5 rounded-full border border-red-500/20">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
              {warningCount} warnings
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[500px]">
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
              <span className="text-lg">📡</span>
            </div>
            <p className="text-sm text-slate-500">Monitoring stadium...</p>
            <p className="text-[10px] text-slate-600 mt-1">Events will appear here in real-time</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/20">
            {events.map((event, idx) => {
              const style = severityStyles[event.severity];
              const typeInfo = eventTypeLabels[event.eventType] || { label: event.eventType, icon: "❓" };
              return (
                <div
                  key={event.id}
                  className={`p-3 ${style.bg} border-l-2 ${style.border} transition-all duration-300 ${
                    idx === 0 ? "animate-[fadeIn_0.3s_ease-out]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${event.severity === "CRITICAL" ? "animate-pulse" : ""}`} />
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${style.badge}`}>
                        {event.severity}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-600 whitespace-nowrap font-mono">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="flex gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-600">Density</span>
                      <span className={`text-[10px] font-medium ${
                        event.metrics.density > 85 ? "text-red-400" : event.metrics.density > 65 ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {event.metrics.density}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-600">Wait</span>
                      <span className={`text-[10px] font-medium ${
                        event.metrics.waitTime > 20 ? "text-red-400" : event.metrics.waitTime > 10 ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {event.metrics.waitTime}m
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-600">Flow</span>
                      <span className="text-[10px] font-medium text-slate-300">
                        {event.metrics.flowRate}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
