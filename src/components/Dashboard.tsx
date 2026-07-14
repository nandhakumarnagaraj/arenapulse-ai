"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { StadiumZone, TelemetryEvent, AIIncidentResponse } from "@/lib/types";
import { STADIUM_ZONES } from "@/data/stadium";
import Header from "./Header";
import ZoneCard from "./ZoneCard";
import StadiumMap from "./StadiumMap";
import AlertPanel from "./AlertPanel";
import AIConsole from "./AIConsole";
import AnnouncementBar from "./AnnouncementBar";
import ManualTrigger from "./ManualTrigger";
import AnalyticsPanel from "./AnalyticsPanel";
import MatchTimeline from "./MatchTimeline";

export default function Dashboard() {
  const [zones, setZones] = useState<StadiumZone[]>(STADIUM_ZONES);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [aiResponses, setAiResponses] = useState<AIIncidentResponse[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<"gemini-live" | "fallback" | "loading">("loading");
  const [sseConnected, setSseConnected] = useState(false);
  const [latestAnnouncement, setLatestAnnouncement] = useState<{
    en: string;
    es: string;
    fr: string;
  } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const processedEventIds = useRef(new Set<string>());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const analyzeEvent = useCallback(async (event: TelemetryEvent, currentZones: StadiumZone[]) => {
    if (processedEventIds.current.has(event.id)) return;
    if (event.severity === "INFO") return;
    processedEventIds.current.add(event.id);

    setIsAiLoading(true);
    try {
      const zoneContext = currentZones
        .map((z) => `${z.name}: ${z.status} status, ${z.currentOccupancy}/${z.capacity} capacity, ${z.waitTimeMinutes}min wait`)
        .join("\n");

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventDescription: event.description,
          zoneContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiResponse = data as AIIncidentResponse & { _meta?: { mode: string } };
        setAiResponses((prev) => [aiResponse, ...prev].slice(0, 20));
        setLatestAnnouncement(aiResponse.publicAnnouncements);
        if (aiResponse._meta?.mode) {
          setAiMode(aiResponse._meta.mode as "gemini-live" | "fallback");
        }
      }
    } catch (err) {
      console.error("AI analysis failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const handleManualTrigger = useCallback(async (description: string, zoneId: string) => {
    const manualEvent: TelemetryEvent = {
      id: `MANUAL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      zoneId,
      eventType: description.toLowerCase().includes("turnstile") || description.toLowerCase().includes("gate")
        ? "gate_failure"
        : description.toLowerCase().includes("transit") || description.toLowerCase().includes("train")
          ? "transit_delay"
          : description.toLowerCase().includes("weather") || description.toLowerCase().includes("lightning")
            ? "weather_alert"
            : description.toLowerCase().includes("medical") || description.toLowerCase().includes("ems")
              ? "medical"
              : "crowd_spike",
      description,
      severity: description.toLowerCase().includes("crash") || description.toLowerCase().includes("medical") || description.toLowerCase().includes("emergency")
        ? "CRITICAL"
        : "WARNING",
      metrics: {
        density: Math.floor(Math.random() * 30) + 70,
        waitTime: Math.floor(Math.random() * 30) + 10,
        flowRate: Math.floor(Math.random() * 40) + 20,
      },
    };

    setEvents((prev) => [manualEvent, ...prev].slice(0, 50));
    await analyzeEvent(manualEvent, zones);
  }, [analyzeEvent, zones]);

  useEffect(() => {
    function connectSSE() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource("/api/events");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setSseConnected(true);
      };

      eventSource.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);

          if (data.type === "init" && data.zones) {
            setZones(data.zones);
            return;
          }

          if (data.event && data.zones) {
            setZones(data.zones);
            setEvents((prev) => [data.event, ...prev].slice(0, 50));

            if (data.event.severity !== "INFO") {
              analyzeEvent(data.event, data.zones);
            }
          }
        } catch {
          // Skip malformed messages
        }
      };

      eventSource.onerror = () => {
        setSseConnected(false);
        eventSource.close();
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, 3000);
      };
    }

    connectSSE();

    fetch("/api/ai")
      .then((res) => res.json())
      .then((data) => {
        setAiMode(data.mode || "fallback");
      })
      .catch(() => {
        setAiMode("fallback");
      });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [analyzeEvent]);

  const handleZoneClick = (zoneId: string) => {
    setSelectedZoneId(zoneId === selectedZoneId ? null : zoneId);
  };

  const totalOccupancy = zones.reduce((sum, z) => sum + z.currentOccupancy, 0);
  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const criticalZones = zones.filter((z) => z.status === "critical").length;
  const avgWaitTime = Math.round(
    zones.reduce((sum, z) => sum + z.waitTimeMinutes, 0) / zones.length
  );

  return (
    <div className="min-h-screen bg-slate-950 bg-grid">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        {/* Status Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${sseConnected ? "bg-emerald-500" : "bg-red-500"} ${sseConnected ? "animate-pulse" : ""}`} />
              <span className={sseConnected ? "text-emerald-400" : "text-red-400"}>
                {sseConnected ? "Telemetry Connected" : "Reconnecting..."}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold ${
                aiMode === "gemini-live"
                  ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                  : "bg-slate-700 text-slate-300"
              }`}>
                AI
              </div>
              <span className={aiMode === "gemini-live" ? "text-blue-300" : "text-slate-400"}>
                {aiMode === "loading"
                  ? "Detecting AI engine..."
                  : aiMode === "gemini-live"
                    ? "Gemini 2.0 Flash — Live"
                    : "Fallback Mode — Rule-based"}
              </span>
            </div>
          </div>
          {aiMode === "fallback" && (
            <div className="text-[10px] text-amber-400/70 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Add GEMINI_API_KEY to .env.local for live AI responses
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Occupancy</p>
            <p className="text-2xl font-bold text-white mt-1">
              {totalOccupancy.toLocaleString()}
              <span className="text-sm text-slate-500 font-normal ml-1">
                /{totalCapacity.toLocaleString()}
              </span>
            </p>
            <div className="mt-2 w-full bg-slate-700/50 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  totalOccupancy / totalCapacity > 0.85 ? "bg-red-500" : totalOccupancy / totalCapacity > 0.65 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.round((totalOccupancy / totalCapacity) * 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Avg Wait Time</p>
            <p className={`text-2xl font-bold mt-1 ${avgWaitTime > 15 ? "text-red-400" : avgWaitTime > 8 ? "text-amber-400" : "text-emerald-400"}`}>
              {avgWaitTime}<span className="text-sm font-normal ml-1">min</span>
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Critical Zones</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className={`text-2xl font-bold ${criticalZones > 0 ? "text-red-400" : "text-emerald-400"}`}>
                {criticalZones}
              </p>
              <p className="text-xs text-slate-500">of {zones.length}</p>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">AI Responses</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-purple-400">{aiResponses.length}</p>
              {isAiLoading && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Stadium Map + Zone Cards */}
          <div className="lg:col-span-3 space-y-4">
            <StadiumMap
              zones={zones}
              selectedZoneId={selectedZoneId}
              onZoneClick={handleZoneClick}
            />
            <div className="grid grid-cols-2 gap-3">
              {zones.map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  isSelected={selectedZoneId === zone.id}
                  onClick={() => handleZoneClick(zone.id)}
                />
              ))}
            </div>
          </div>

          {/* Center-Left: Demo Control + Analytics */}
          <div className="lg:col-span-3 space-y-4">
            <ManualTrigger
              zones={zones}
              onTrigger={handleManualTrigger}
              isProcessing={isAiLoading}
            />
            <AnalyticsPanel events={events} responses={aiResponses} />
            <MatchTimeline events={events} />
          </div>

          {/* Center: AI Console + Announcements */}
          <div className="lg:col-span-4 space-y-4">
            <AnnouncementBar latestAnnouncement={latestAnnouncement} />
            <AIConsole responses={aiResponses} isLoading={isAiLoading} />
          </div>

          {/* Right: Alert Feed */}
          <div className="lg:col-span-2">
            <AlertPanel events={events} />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/50 py-4 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 flex items-center justify-between text-[10px] text-slate-600">
          <span>ArenaPulse AI — Smart Stadium Operations Copilot</span>
          <span>FIFA World Cup 2026 | Powered by Google Gemini</span>
        </div>
      </footer>
    </div>
  );
}
