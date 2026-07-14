import { StadiumZone, MatchInfo } from "@/lib/types";

export const MATCH_INFO: MatchInfo = {
  homeTeam: "Brazil",
  awayTeam: "Argentina",
  venue: "MetLife Stadium",
  city: "New York / New Jersey",
  kickoffTime: "2026-07-19T20:00:00Z",
  attendance: 82500,
};

export const STADIUM_ZONES: StadiumZone[] = [
  {
    id: "gate-a",
    name: "Gate A — North",
    capacity: 12000,
    currentOccupancy: 8400,
    status: "normal",
    waitTimeMinutes: 3,
    gates: ["A1", "A2", "A3", "A4"],
    transitLines: ["Line 1", "Line 4"],
  },
  {
    id: "gate-b",
    name: "Gate B — East",
    capacity: 14000,
    currentOccupancy: 11200,
    status: "elevated",
    waitTimeMinutes: 12,
    gates: ["B1", "B2", "B3", "B4", "B5"],
    transitLines: ["Line 2"],
  },
  {
    id: "gate-c",
    name: "Gate C — South",
    capacity: 13000,
    currentOccupancy: 6500,
    status: "normal",
    waitTimeMinutes: 2,
    gates: ["C1", "C2", "C3", "C4"],
    transitLines: ["Line 3", "Line 5"],
  },
  {
    id: "gate-d",
    name: "Gate D — West",
    capacity: 11000,
    currentOccupancy: 9900,
    status: "elevated",
    waitTimeMinutes: 18,
    gates: ["D1", "D2", "D3"],
    transitLines: ["Line 6"],
  },
  {
    id: "concourse",
    name: "Main Concourse",
    capacity: 25000,
    currentOccupancy: 18750,
    status: "normal",
    waitTimeMinutes: 0,
    gates: [],
    transitLines: [],
  },
  {
    id: "transit-hub",
    name: "Transit Hub — South Plaza",
    capacity: 8000,
    currentOccupancy: 5600,
    status: "normal",
    waitTimeMinutes: 5,
    gates: [],
    transitLines: ["Line 2", "Line 3", "Line 5"],
  },
];

export const EVENT_SCENARIOS = [
  {
    eventType: "gate_failure" as const,
    severity: "CRITICAL" as const,
    templates: [
      "Gate {gate} automated turnstiles have crashed. Queue time spiked to {waitTime} minutes. Fans are getting frustrated and crowding the exterior plaza. Adjacent gates are currently at {adjacentCapacity}% capacity.",
      "Security scanner malfunction at Gate {gate}. All entry lanes blocked. {waitTime} minute backlog forming. Exterior crowd density increasing rapidly.",
      "Power outage at Gate {gate} ticketing system. Manual verification only. Throughput reduced by 80%. Queue extending {distance} meters from entrance.",
    ],
  },
  {
    eventType: "crowd_spike" as const,
    severity: "WARNING" as const,
    templates: [
      "Unexpected crowd surge detected at {zone}. Density at {density}% capacity. Concourse flow rate dropping. Secondary bottleneck forming near {adjacentZone}.",
      "Pre-match fan gathering exceeding projections at {zone}. Current occupancy {occupancy} of {capacity}. Volunteer repositioning recommended.",
      "Heavy foot traffic from {transitLine} passengers converging at {zone}. Queue time increased to {waitTime} minutes.",
    ],
  },
  {
    eventType: "transit_delay" as const,
    severity: "WARNING" as const,
    templates: [
      "{transitLine} experiencing {delayMinutes}-minute delay due to signal failure. {affectedPassengers} passengers stranded at station. Alternative routes via {alternativeLine} available.",
      "Service disruption on {transitLine} between {station1} and {station2}. Buses being dispatched. Expected resolution in {delayMinutes} minutes.",
    ],
  },
  {
    eventType: "weather_alert" as const,
    severity: "WARNING" as const,
    templates: [
      "Lightning detected {distance}km from venue. Severe weather watch in effect. Outdoor queue areas at {zones} may need evacuation to covered concourse.",
      "High winds advisory: {windSpeed} mph gusts expected. Temporary structures at {zone} may require securing. Fan safety advisory for exposed walkways.",
    ],
  },
  {
    eventType: "medical" as const,
    severity: "CRITICAL" as const,
    templates: [
      "Medical emergency reported at {zone} Section {section}. Fan requiring immediate assistance. EMS team dispatched. Nearby aisle {aisle} needs to be cleared for access.",
      "Heat-related incidents spiking at {zone}. {incidentCount} cases in last 15 minutes. Additional water distribution and cooling stations recommended.",
    ],
  },
  {
    eventType: "normal" as const,
    severity: "INFO" as const,
    templates: [
      "Routine gate rotation completed at {gate}. All turnstiles operational. Current wait time: {waitTime} minutes.",
      "Sector {sector} crowd density nominal. Flow rate within expected parameters. No action required.",
      "Volunteer shift changeover at {zone} completed successfully. All positions staffed.",
    ],
  },
];
