"use client";

import { TelemetryEvent, AIIncidentResponse } from "@/lib/types";

interface AnalyticsPanelProps {
  events: TelemetryEvent[];
  responses: AIIncidentResponse[];
}

export default function AnalyticsPanel({ events, responses }: AnalyticsPanelProps) {
  const criticalCount = events.filter((e) => e.severity === "CRITICAL").length;
  const warningCount = events.filter((e) => e.severity === "WARNING").length;
  const infoCount = events.filter((e) => e.severity === "INFO").length;

  const eventTypeBreakdown = events.reduce(
    (acc, e) => {
      acc[e.eventType] = (acc[e.eventType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const reroutingCount = responses.filter((r) => r.reroutingAction.triggerDynamicRerouting).length;
  const volunteerCount = responses.reduce(
    (sum, r) => sum + (r.volunteerDeployment.actionRequired ? r.volunteerDeployment.quantityToDeploy : 0),
    0
  );

  const eventTypes: Record<string, { label: string; icon: string; textColor: string; barColor: string }> = {
    gate_failure: { label: "Gate Failures", icon: "🚧", textColor: "text-red-400", barColor: "bg-red-400" },
    crowd_spike: { label: "Crowd Surges", icon: "👥", textColor: "text-amber-400", barColor: "bg-amber-400" },
    transit_delay: { label: "Transit Delays", icon: "🚇", textColor: "text-blue-400", barColor: "bg-blue-400" },
    weather_alert: { label: "Weather Alerts", icon: "⛈️", textColor: "text-purple-400", barColor: "bg-purple-400" },
    medical: { label: "Medical", icon: "🏥", textColor: "text-pink-400", barColor: "bg-pink-400" },
    normal: { label: "Routine", icon: "📋", textColor: "text-slate-400", barColor: "bg-slate-400" },
  };

  return (
    <div className="glass-panel">
      <div className="px-4 py-3 border-b premium-divider flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">📊</span>
          <h2 className="text-sm font-semibold text-white">Analytics</h2>
        </div>
        <span className="text-[10px] text-slate-500">{events.length} total events</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Severity Breakdown */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Severity Distribution</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-red-500/10 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-red-400">{criticalCount}</p>
              <p className="text-[9px] text-red-400/70">Critical</p>
            </div>
            <div className="flex-1 bg-amber-500/10 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-amber-400">{warningCount}</p>
              <p className="text-[9px] text-amber-400/70">Warning</p>
            </div>
            <div className="flex-1 bg-blue-500/10 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-blue-400">{infoCount}</p>
              <p className="text-[9px] text-blue-400/70">Info</p>
            </div>
          </div>
        </div>

        {/* Event Type Breakdown */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Incident Types</p>
          <div className="space-y-1.5">
            {Object.entries(eventTypeBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const info = eventTypes[type] || { label: type, icon: "❓", textColor: "text-slate-400", barColor: "bg-slate-400" };
                const percent = events.length > 0 ? Math.round((count / events.length) * 100) : 0;
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-xs">{info.icon}</span>
                    <span className={`text-[11px] flex-1 ${info.textColor}`}>{info.label}</span>
                    <div className="w-20 bg-slate-700/50 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${info.barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/30 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-500 uppercase">Reroutes</p>
            <p className="text-lg font-bold text-blue-400">{reroutingCount}</p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-500 uppercase">Volunteers</p>
            <p className="text-lg font-bold text-emerald-400">{volunteerCount}</p>
          </div>
        </div>

        {/* Response Rate */}
        <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/15 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400">AI Analysis Rate</p>
              <p className="text-lg font-bold text-purple-400">
                {events.length > 0 ? Math.round((responses.length / Math.max(events.filter((e) => e.severity !== "INFO").length, 1)) * 100) : 0}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">Processed</p>
              <p className="text-sm text-white font-medium">{responses.length}/{events.filter((e) => e.severity !== "INFO").length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
