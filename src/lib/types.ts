export type ZoneStatus = "normal" | "elevated" | "critical";
export type Severity = "CRITICAL" | "WARNING" | "INFO";

export interface StadiumZone {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  status: ZoneStatus;
  waitTimeMinutes: number;
  gates: string[];
  transitLines: string[];
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  zoneId: string;
  eventType: "crowd_spike" | "gate_failure" | "transit_delay" | "weather_alert" | "medical" | "normal";
  description: string;
  severity: Severity;
  metrics: {
    density: number;
    waitTime: number;
    flowRate: number;
  };
}

export interface ReroutingAction {
  triggerDynamicRerouting: boolean;
  divertFrom: string;
  divertTo: string;
  routingInstructions: string;
}

export interface VolunteerDeployment {
  actionRequired: boolean;
  quantityToDeploy: number;
  targetLocation: string;
  briefingMessage: string;
}

export interface PublicAnnouncements {
  en: string;
  es: string;
  fr: string;
}

export interface AIMeta {
  mode: "gemini-live" | "fallback";
  model: string;
}

export interface AIIncidentResponse {
  incidentId: string;
  severity: Severity;
  affectedZone: string;
  rootCause: string;
  operationalImpact: string;
  reroutingAction: ReroutingAction;
  volunteerDeployment: VolunteerDeployment;
  publicAnnouncements: PublicAnnouncements;
  timestamp: string;
  _meta?: AIMeta;
}

export interface MatchInfo {
  homeTeam: string;
  awayTeam: string;
  venue: string;
  city: string;
  kickoffTime: string;
  attendance: number;
}
