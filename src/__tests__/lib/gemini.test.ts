import { analyzeIncident, isGeminiAvailable } from "@/lib/gemini";

describe("isGeminiAvailable", () => {
  it("returns a boolean", () => {
    expect(typeof isGeminiAvailable()).toBe("boolean");
  });
});

describe("analyzeIncident (fallback mode)", () => {
  const zoneContext = `Gate A — North: elevated status, 10000/12000 capacity, 15min wait
Gate B — East: normal status, 8000/14000 capacity, 3min wait
Gate C — South: normal status, 6000/13000 capacity, 2min wait`;

  it("returns a valid response for gate failure", async () => {
    const response = await analyzeIncident(
      "Gate A automated turnstiles have crashed. Queue time spiked to 25 minutes.",
      zoneContext
    );
    expect(response.incidentId).toBeDefined();
    expect(response.severity).toBe("CRITICAL");
    expect(response.affectedZone).toBeDefined();
    expect(response.rootCause).toBeDefined();
    expect(response.operationalImpact).toBeDefined();
    expect(response.reroutingAction.triggerDynamicRerouting).toBe(true);
    expect(response.volunteerDeployment.actionRequired).toBe(true);
    expect(response.publicAnnouncements.en).toBeDefined();
    expect(response.publicAnnouncements.es).toBeDefined();
    expect(response.publicAnnouncements.fr).toBeDefined();
    expect(response.timestamp).toBeDefined();
  });

  it("returns a valid response for crowd spike", async () => {
    const response = await analyzeIncident(
      "Unexpected crowd surge at Main Concourse. Density at 90% capacity.",
      zoneContext
    );
    expect(response.severity).toBe("WARNING");
    expect(response.reroutingAction).toBeDefined();
    expect(response.volunteerDeployment).toBeDefined();
  });

  it("returns a valid response for transit delay", async () => {
    const response = await analyzeIncident(
      "Line 2 transit experiencing 20-minute delay due to signal failure.",
      zoneContext
    );
    expect(response.severity).toBe("WARNING");
    expect(response.publicAnnouncements.en.length).toBeGreaterThan(10);
  });

  it("returns a valid response for weather alert", async () => {
    const response = await analyzeIncident(
      "Lightning detected 5km from venue. Severe weather watch in effect.",
      zoneContext
    );
    expect(response.severity).toBe("WARNING");
    expect(response.reroutingAction.triggerDynamicRerouting).toBe(true);
  });

  it("returns a valid response for medical emergency", async () => {
    const response = await analyzeIncident(
      "Medical emergency reported at Section 12. Fan requiring immediate assistance.",
      zoneContext
    );
    expect(response.severity).toBe("CRITICAL");
    expect(response.volunteerDeployment.actionRequired).toBe(true);
  });

  it("returns valid ISO timestamp", async () => {
    const response = await analyzeIncident("Crowd surge detected", zoneContext);
    const timestamp = new Date(response.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  it("generates unique incident IDs", async () => {
    const r1 = await analyzeIncident("Gate crash at A1", zoneContext);
    // Small delay to ensure different timestamp
    await new Promise((r) => setTimeout(r, 5));
    const r2 = await analyzeIncident("Transit delay on Line 3", zoneContext);
    expect(r1.incidentId).not.toBe(r2.incidentId);
  });

  it("returns multilingual announcements with meaningful content", async () => {
    const response = await analyzeIncident(
      "Gate B scanners have failed completely",
      zoneContext
    );
    expect(response.publicAnnouncements.en.length).toBeGreaterThan(20);
    expect(response.publicAnnouncements.es.length).toBeGreaterThan(20);
    expect(response.publicAnnouncements.fr.length).toBeGreaterThan(20);
  });

  it("picks affected zone from context when available", async () => {
    const contextWithElevated = `Gate A — North: elevated status, 10000/12000 capacity, 15min wait
Gate B — East: critical status, 13000/14000 capacity, 30min wait`;
    const response = await analyzeIncident("Turnstile failure detected", contextWithElevated);
    expect(response.affectedZone).toBeDefined();
    expect(response.affectedZone.length).toBeGreaterThan(0);
  });
});
