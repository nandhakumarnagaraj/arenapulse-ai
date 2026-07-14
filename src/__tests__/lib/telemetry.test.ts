import { generateTelemetryEvent, generateInitialZones } from "@/lib/telemetry";
import { STADIUM_ZONES } from "@/data/stadium";

describe("generateInitialZones", () => {
  it("returns all zones from stadium data", () => {
    const zones = generateInitialZones();
    expect(zones).toHaveLength(STADIUM_ZONES.length);
  });

  it("initializes all zones with normal status", () => {
    const zones = generateInitialZones();
    zones.forEach((zone) => {
      expect(zone.status).toBe("normal");
    });
  });

  it("initializes occupancy within valid range", () => {
    const zones = generateInitialZones();
    zones.forEach((zone) => {
      expect(zone.currentOccupancy).toBeGreaterThanOrEqual(Math.floor(zone.capacity * 0.3));
      expect(zone.currentOccupancy).toBeLessThanOrEqual(Math.floor(zone.capacity * 0.7));
    });
  });

  it("initializes wait times within valid range", () => {
    const zones = generateInitialZones();
    zones.forEach((zone) => {
      expect(zone.waitTimeMinutes).toBeGreaterThanOrEqual(1);
      expect(zone.waitTimeMinutes).toBeLessThanOrEqual(8);
    });
  });

  it("preserves zone metadata from stadium data", () => {
    const zones = generateInitialZones();
    zones.forEach((zone, idx) => {
      expect(zone.id).toBe(STADIUM_ZONES[idx].id);
      expect(zone.name).toBe(STADIUM_ZONES[idx].name);
      expect(zone.capacity).toBe(STADIUM_ZONES[idx].capacity);
      expect(zone.gates).toEqual(STADIUM_ZONES[idx].gates);
      expect(zone.transitLines).toEqual(STADIUM_ZONES[idx].transitLines);
    });
  });
});

describe("generateTelemetryEvent", () => {
  it("returns an event and updated zones", () => {
    const zones = generateInitialZones();
    const result = generateTelemetryEvent(zones);
    expect(result).toHaveProperty("event");
    expect(result).toHaveProperty("updatedZones");
  });

  it("generates event with required fields", () => {
    const zones = generateInitialZones();
    const { event } = generateTelemetryEvent(zones);
    expect(event.id).toBeDefined();
    expect(event.timestamp).toBeDefined();
    expect(event.zoneId).toBeDefined();
    expect(event.eventType).toBeDefined();
    expect(event.description).toBeDefined();
    expect(event.severity).toBeDefined();
    expect(event.metrics).toBeDefined();
    expect(event.metrics.density).toBeDefined();
    expect(event.metrics.waitTime).toBeDefined();
    expect(event.metrics.flowRate).toBeDefined();
  });

  it("generates valid event types", () => {
    const validTypes = ["crowd_spike", "gate_failure", "transit_delay", "weather_alert", "medical", "normal"];
    const zones = generateInitialZones();

    for (let i = 0; i < 20; i++) {
      const { event } = generateTelemetryEvent(zones);
      expect(validTypes).toContain(event.eventType);
    }
  });

  it("generates valid severity levels", () => {
    const validSeverities = ["CRITICAL", "WARNING", "INFO"];
    const zones = generateInitialZones();

    for (let i = 0; i < 20; i++) {
      const { event } = generateTelemetryEvent(zones);
      expect(validSeverities).toContain(event.severity);
    }
  });

  it("returns same number of zones", () => {
    const zones = generateInitialZones();
    const { updatedZones } = generateTelemetryEvent(zones);
    expect(updatedZones).toHaveLength(zones.length);
  });

  it("updates zone status based on events", () => {
    const zones = generateInitialZones();
    const validStatuses = ["normal", "elevated", "critical"];
    const { updatedZones } = generateTelemetryEvent(zones);
    updatedZones.forEach((zone) => {
      expect(validStatuses).toContain(zone.status);
    });
  });

  it("never exceeds zone capacity", () => {
    let zones = generateInitialZones();
    for (let i = 0; i < 50; i++) {
      const result = generateTelemetryEvent(zones);
      zones = result.updatedZones;
      zones.forEach((zone) => {
        expect(zone.currentOccupancy).toBeLessThanOrEqual(zone.capacity);
      });
    }
  });

  it("generates unique event IDs", () => {
    const zones = generateInitialZones();
    const ids = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const { event } = generateTelemetryEvent(zones);
      expect(ids.has(event.id)).toBe(false);
      ids.add(event.id);
    }
  });

  it("generates valid timestamps", () => {
    const zones = generateInitialZones();
    const { event } = generateTelemetryEvent(zones);
    const timestamp = new Date(event.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  it("generates metrics within reasonable ranges", () => {
    const zones = generateInitialZones();
    for (let i = 0; i < 20; i++) {
      const { event } = generateTelemetryEvent(zones);
      expect(event.metrics.density).toBeGreaterThanOrEqual(0);
      expect(event.metrics.density).toBeLessThanOrEqual(100);
      expect(event.metrics.waitTime).toBeGreaterThanOrEqual(0);
      expect(event.metrics.flowRate).toBeGreaterThanOrEqual(0);
    }
  });
});
