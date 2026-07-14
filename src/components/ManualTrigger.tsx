"use client";

import { useState } from "react";
import { StadiumZone } from "@/lib/types";

interface ManualTriggerProps {
  zones: StadiumZone[];
  onTrigger: (description: string, zoneId: string) => void;
  isProcessing: boolean;
}

const incidentTypes = [
  {
    id: "gate_crash",
    label: "Gate Turnstile Crash",
    icon: "🚧",
    severity: "CRITICAL",
    color: "red",
    descriptions: [
      "Gate {gate} automated turnstiles have crashed. Queue time spiked to {wait} minutes. Fans are getting frustrated and crowding the exterior plaza.",
      "Security scanner malfunction at Gate {gate}. All entry lanes blocked. {wait} minute backlog forming rapidly.",
      "Power outage at Gate {gate} ticketing system. Manual verification only. Throughput reduced by 80%.",
    ],
  },
  {
    id: "crowd_surge",
    label: "Crowd Surge",
    icon: "👥",
    severity: "WARNING",
    color: "amber",
    descriptions: [
      "Unexpected crowd surge at {zone}. Density at {density}% capacity. Concourse flow rate dropping. Bottleneck forming.",
      "Pre-match fan gathering exceeding projections at {zone}. Occupancy rising fast. Volunteer repositioning needed.",
      "Heavy foot traffic converging at {zone}. Wait time increased to {wait} minutes. Secondary congestion detected.",
    ],
  },
  {
    id: "transit_delay",
    label: "Transit Delay",
    icon: "🚇",
    severity: "WARNING",
    color: "amber",
    descriptions: [
      "{line} experiencing {wait}-minute delay due to signal failure. Passengers stranded at station. Alternative routes needed.",
      "Service disruption on {line}. Buses being dispatched. Expected resolution in {wait} minutes.",
    ],
  },
  {
    id: "weather",
    label: "Weather Alert",
    icon: "⛈️",
    severity: "WARNING",
    color: "amber",
    descriptions: [
      "Lightning detected 5km from venue. Severe weather watch in effect. Outdoor queue areas may need evacuation.",
      "High winds advisory: 50 mph gusts expected. Temporary structures at {zone} may require securing.",
    ],
  },
  {
    id: "medical",
    label: "Medical Emergency",
    icon: "🏥",
    severity: "CRITICAL",
    color: "red",
    descriptions: [
      "Medical emergency reported at {zone}. Fan requiring immediate assistance. EMS team dispatched. Aisle needs clearing.",
      "Heat-related incidents spiking at {zone}. Multiple cases in last 15 minutes. Additional water stations recommended.",
    ],
  },
];

export default function ManualTrigger({ zones, onTrigger, isProcessing }: ManualTriggerProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>(zones[0]?.id || "");
  const [customDescription, setCustomDescription] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTrigger = () => {
    if (selectedType) {
      const incident = incidentTypes.find((t) => t.id === selectedType);
      if (incident) {
        const zone = zones.find((z) => z.id === selectedZone);
        const template = incident.descriptions[Math.floor(Math.random() * incident.descriptions.length)];
        const description = template
          .replace("{gate}", zone?.gates[0] || "A1")
          .replace("{zone}", zone?.name || "Main Concourse")
          .replace("{wait}", String(Math.floor(Math.random() * 30) + 10))
          .replace("{density}", String(Math.floor(Math.random() * 30) + 70))
          .replace("{line}", zone?.transitLines[0] || "Line 1");
        onTrigger(description, selectedZone);
      }
    } else if (customDescription.trim()) {
      onTrigger(customDescription.trim(), selectedZone);
      setCustomDescription("");
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🎮</span>
          <h2 className="text-sm font-semibold text-white">Demo Control Panel</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Manual Trigger</span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-slate-700/50 space-y-4">
          {/* Zone Selector */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 block">
              Target Zone
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} ({zone.status})
                </option>
              ))}
            </select>
          </div>

          {/* Incident Type Grid */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 block">
              Incident Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {incidentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedType === type.id
                      ? type.color === "red"
                        ? "bg-red-500/10 border-red-500/40 ring-1 ring-red-500/30"
                        : "bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30"
                      : "bg-slate-800/30 border-slate-600/30 hover:border-slate-500/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{type.icon}</span>
                    <div>
                      <p className="text-[11px] font-medium text-white">{type.label}</p>
                      <p className={`text-[9px] ${type.color === "red" ? "text-red-400" : "text-amber-400"}`}>
                        {type.severity}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Description */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 block">
              Or Write Custom Incident
            </label>
            <textarea
              value={customDescription}
              onChange={(e) => { setCustomDescription(e.target.value); setSelectedType(null); }}
              placeholder="e.g., Gate B scanners failing, 200 fans stuck in rain..."
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none h-20"
            />
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleTrigger}
            disabled={isProcessing || (!selectedType && !customDescription.trim())}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
              isProcessing || (!selectedType && !customDescription.trim())
                ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with Gemini...
              </span>
            ) : (
              "Trigger Incident & Analyze"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
