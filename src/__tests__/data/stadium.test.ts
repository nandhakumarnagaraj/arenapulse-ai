import { STADIUM_ZONES, MATCH_INFO, EVENT_SCENARIOS } from "@/data/stadium";

describe("STADIUM_ZONES", () => {
  it("has the expected number of zones", () => {
    expect(STADIUM_ZONES.length).toBe(6);
  });

  it("each zone has required fields", () => {
    STADIUM_ZONES.forEach((zone) => {
      expect(zone.id).toBeDefined();
      expect(zone.name).toBeDefined();
      expect(zone.capacity).toBeGreaterThan(0);
      expect(zone.currentOccupancy).toBeGreaterThanOrEqual(0);
      expect(zone.currentOccupancy).toBeLessThanOrEqual(zone.capacity);
      expect(["normal", "elevated", "critical"]).toContain(zone.status);
      expect(zone.waitTimeMinutes).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(zone.gates)).toBe(true);
      expect(Array.isArray(zone.transitLines)).toBe(true);
    });
  });

  it("zone IDs are unique", () => {
    const ids = STADIUM_ZONES.map((z) => z.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("total capacity matches MetLife Stadium", () => {
    const totalCapacity = STADIUM_ZONES.reduce((sum, z) => sum + z.capacity, 0);
    expect(totalCapacity).toBe(83000);
  });

  it("has correct zone names", () => {
    const names = STADIUM_ZONES.map((z) => z.name);
    expect(names).toContain("Gate A — North");
    expect(names).toContain("Gate B — East");
    expect(names).toContain("Gate C — South");
    expect(names).toContain("Gate D — West");
    expect(names).toContain("Main Concourse");
    expect(names).toContain("Transit Hub — South Plaza");
  });
});

describe("MATCH_INFO", () => {
  it("has all required fields", () => {
    expect(MATCH_INFO.homeTeam).toBe("Brazil");
    expect(MATCH_INFO.awayTeam).toBe("Argentina");
    expect(MATCH_INFO.venue).toBe("MetLife Stadium");
    expect(MATCH_INFO.city).toBe("New York / New Jersey");
    expect(MATCH_INFO.attendance).toBe(82500);
  });

  it("has valid kickoff time", () => {
    const kickoff = new Date(MATCH_INFO.kickoffTime);
    expect(kickoff.getTime()).not.toBeNaN();
  });
});

describe("EVENT_SCENARIOS", () => {
  it("has scenarios for all event types", () => {
    const types = EVENT_SCENARIOS.map((s) => s.eventType);
    expect(types).toContain("gate_failure");
    expect(types).toContain("crowd_spike");
    expect(types).toContain("transit_delay");
    expect(types).toContain("weather_alert");
    expect(types).toContain("medical");
    expect(types).toContain("normal");
  });

  it("each scenario has templates", () => {
    EVENT_SCENARIOS.forEach((scenario) => {
      expect(scenario.templates.length).toBeGreaterThan(0);
      scenario.templates.forEach((template) => {
        expect(template.length).toBeGreaterThan(10);
      });
    });
  });

  it("each scenario has valid severity", () => {
    const validSeverities = ["CRITICAL", "WARNING", "INFO"];
    EVENT_SCENARIOS.forEach((scenario) => {
      expect(validSeverities).toContain(scenario.severity);
    });
  });

  it("critical events are gate_failure and medical", () => {
    const criticalScenarios = EVENT_SCENARIOS.filter((s) => s.severity === "CRITICAL");
    const criticalTypes = criticalScenarios.map((s) => s.eventType);
    expect(criticalTypes).toContain("gate_failure");
    expect(criticalTypes).toContain("medical");
  });
});
