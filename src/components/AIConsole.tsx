"use client";

import { AIIncidentResponse } from "@/lib/types";

interface AIConsoleProps {
  responses: AIIncidentResponse[];
  isLoading: boolean;
}

const severityBadge = {
  CRITICAL: "bg-red-500/20 text-red-300 border-red-500/30",
  WARNING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  INFO: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const severityPulse = {
  CRITICAL: "animate-pulse",
  WARNING: "",
  INFO: "",
};

export default function AIConsole({ responses, isLoading }: AIConsoleProps) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-[10px] text-white font-black">AI</span>
          </div>
          <h2 className="text-sm font-semibold text-white">Decision Console</h2>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              <span className="text-xs text-purple-300">Analyzing...</span>
            </div>
          )}
          <span className="text-xs text-slate-500">{responses.length} analyzed</span>
        </div>
      </div>

      <div className="max-h-[520px] overflow-y-auto">
        {responses.length === 0 ? (
          <div className="p-10 text-center">
            {isLoading ? (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-purple-300">Processing incident data...</p>
                <p className="text-xs text-slate-600">Gemini AI is analyzing the situation</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/50 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <p className="text-sm text-slate-500">Waiting for incidents</p>
                <p className="text-xs text-slate-600">AI will analyze non-routine events automatically</p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-700/20">
            {[...responses].reverse().map((response) => (
              <div key={response.incidentId} className="p-4 space-y-3 hover:bg-slate-800/20 transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                      {response.incidentId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${severityBadge[response.severity]} ${severityPulse[response.severity]}`}
                    >
                      {response.severity}
                    </span>
                    {response._meta && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                        response._meta.mode === "gemini-live"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-slate-700/50 text-slate-400"
                      }`}>
                        {response._meta.mode === "gemini-live" ? "Gemini" : "Fallback"}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(response.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Affected Zone + Root Cause */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Affected Zone</p>
                    <p className="text-sm text-white font-medium">{response.affectedZone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Root Cause</p>
                    <p className="text-xs text-slate-300 line-clamp-2">{response.rootCause}</p>
                  </div>
                </div>

                {/* Impact */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Operational Impact</p>
                  <p className="text-xs text-slate-400">{response.operationalImpact}</p>
                </div>

                {/* Rerouting */}
                {response.reroutingAction.triggerDynamicRerouting && (
                  <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-blue-400">🔄</span>
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                        Dynamic Rerouting
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs mb-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 text-[10px] font-medium">
                        {response.reroutingAction.divertFrom}
                      </span>
                      <span className="text-blue-400">→</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-medium">
                        {response.reroutingAction.divertTo}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {response.reroutingAction.routingInstructions}
                    </p>
                  </div>
                )}

                {/* Volunteer Deployment */}
                {response.volunteerDeployment.actionRequired && (
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-emerald-400">👤</span>
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        Volunteer Deployment
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs mb-1.5">
                      <span className="text-emerald-200">
                        <span className="font-bold">{response.volunteerDeployment.quantityToDeploy}</span> volunteers
                      </span>
                      <span className="text-slate-600">→</span>
                      <span className="text-emerald-200">{response.volunteerDeployment.targetLocation}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic leading-relaxed">
                      &quot;{response.volunteerDeployment.briefingMessage}&quot;
                    </p>
                  </div>
                )}

                {/* Multilingual Announcements */}
                <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-indigo-400">📢</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Public Announcements
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="text-[10px] text-blue-400 font-bold w-5 shrink-0 pt-0.5">EN</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{response.publicAnnouncements.en}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] text-amber-400 font-bold w-5 shrink-0 pt-0.5">ES</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{response.publicAnnouncements.es}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] text-purple-400 font-bold w-5 shrink-0 pt-0.5">FR</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{response.publicAnnouncements.fr}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
