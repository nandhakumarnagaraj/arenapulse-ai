import { TelemetryEvent, StadiumZone } from "./types";
import { STADIUM_ZONES, EVENT_SCENARIOS } from "@/data/stadium";

let eventCounter = 0;

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillTemplate(template: string, vars: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }
  return result;
}

export function generateTelemetryEvent(zones: StadiumZone[]): {
  event: TelemetryEvent;
  updatedZones: StadiumZone[];
} {
  eventCounter++;
  const scenario = randomChoice(EVENT_SCENARIOS);
  const zone = randomChoice(zones);
  const template = randomChoice(scenario.templates);

  const gates = ["A", "B", "C", "D"];

  const lines = ["Line 1", "Line 2", "Line 3", "Line 4", "Line 5", "Line 6"];
  const otherLines = lines.filter((l) => !zone.transitLines.includes(l));

  const waitTime = randomInt(5, 45);
  const density = randomInt(60, 98);
  const occupancy = randomInt(
    Math.floor(zone.capacity * 0.5),
    zone.capacity
  );

  const vars: Record<string, string | number> = {
    gate: randomChoice(["A1", "A2", "B3", "C2", "D1"]),
    waitTime,
    adjacentCapacity: randomInt(30, 70),
    zone: zone.name,
    density,
    occupancy,
    capacity: zone.capacity,
    adjacentZone: `${randomChoice(["Gate", "Concourse"])} ${randomChoice(gates)}`,
    transitLine: randomChoice(lines),
    delayMinutes: randomInt(5, 30),
    affectedPassengers: randomInt(200, 2000),
    alternativeLine: randomChoice(otherLines),
    station1: "Central",
    station2: "Eastside",
    distance: randomInt(2, 15),
    windSpeed: randomInt(35, 60),
    section: `${randomInt(1, 50)}`,
    aisle: randomChoice(["A", "B", "C", "D"]) + randomInt(1, 20),
    incidentCount: randomInt(3, 12),
    sector: `Sector ${randomInt(1, 8)}`,
  };

  const description = fillTemplate(template, vars);

  const updatedZones = zones.map((z) => {
    if (z.id !== zone.id) return z;

    const newOccupancy = scenario.severity === "CRITICAL"
      ? Math.min(z.capacity, z.currentOccupancy + randomInt(500, 2000))
      : scenario.severity === "WARNING"
        ? Math.min(z.capacity, z.currentOccupancy + randomInt(200, 800))
        : z.currentOccupancy;

    const newWaitTime = scenario.severity === "CRITICAL"
      ? Math.max(z.waitTimeMinutes, waitTime)
      : scenario.severity === "WARNING"
        ? Math.max(z.waitTimeMinutes, randomInt(8, 20))
        : Math.max(0, z.waitTimeMinutes - 1);

    const occupancyRatio = newOccupancy / z.capacity;
    const newStatus =
      occupancyRatio > 0.85 || scenario.severity === "CRITICAL"
        ? "critical"
        : occupancyRatio > 0.65 || scenario.severity === "WARNING"
          ? "elevated"
          : "normal";

    return {
      ...z,
      currentOccupancy: newOccupancy,
      waitTimeMinutes: newWaitTime,
      status: newStatus as "normal" | "elevated" | "critical",
    };
  });

  const event: TelemetryEvent = {
    id: `EVT-${Date.now()}-${eventCounter}`,
    timestamp: new Date().toISOString(),
    zoneId: zone.id,
    eventType: scenario.eventType,
    description,
    severity: scenario.severity,
    metrics: {
      density,
      waitTime,
      flowRate: randomInt(20, 100),
    },
  };

  return { event, updatedZones };
}

export function generateInitialZones(): StadiumZone[] {
  return STADIUM_ZONES.map((z) => ({
    ...z,
    currentOccupancy: randomInt(
      Math.floor(z.capacity * 0.3),
      Math.floor(z.capacity * 0.7)
    ),
    waitTimeMinutes: randomInt(1, 8),
    status: "normal" as const,
  }));
}
