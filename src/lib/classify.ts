import { TelemetryEvent, Severity } from "./types";

type EventType = TelemetryEvent["eventType"];

/**
 * Keyword-based event classification.
 * Single source of truth used by both manual triggers and fallback responses.
 */
const EVENT_KEYWORDS: Record<EventType, string[]> = {
  gate_failure: ["turnstile", "gate", "scanner", "power outage", "ticketing"],
  transit_delay: ["transit", "train", "bus", "delay", "signal failure", "service disruption"],
  weather_alert: ["weather", "lightning", "wind", "rain", "storm", "thunder"],
  medical: ["medical", "emergency", "ems", "heat", "ambulance", "paramedic"],
  crowd_spike: ["crowd", "surge", "density", "congestion", "bottleneck", "occupancy"],
  normal: ["routine", "nominal", "shift change", "all clear"],
};

/**
 * Classify an event description into an event type based on keywords.
 * Falls back to "crowd_spike" if no keywords match.
 */
export function classifyEventType(description: string): EventType {
  const desc = description.toLowerCase();

  for (const [type, keywords] of Object.entries(EVENT_KEYWORDS)) {
    if (type === "normal" || type === "crowd_spike") continue; // check these last
    if (keywords.some((kw) => desc.includes(kw))) {
      return type as EventType;
    }
  }

  // Check normal last
  if (EVENT_KEYWORDS.normal.some((kw) => desc.includes(kw))) {
    return "normal";
  }

  return "crowd_spike";
}

/**
 * Infer severity from a description string.
 */
export function classifySeverity(description: string): Severity {
  const desc = description.toLowerCase();
  const criticalKeywords = ["crash", "medical", "emergency", "power outage", "stampede", "crush", "critical"];
  if (criticalKeywords.some((kw) => desc.includes(kw))) {
    return "CRITICAL";
  }
  return "WARNING";
}
