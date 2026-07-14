/**
 * API route integration tests for /api/ai
 */

describe("/api/ai route", () => {
  // We test the logic that the route uses, since testing Next.js API routes
  // directly requires a running server. These validate the input/output contract.

  it("validates that analyzeIncident returns correct structure", async () => {
    const { analyzeIncident } = await import("@/lib/gemini");

    const result = await analyzeIncident(
      "Gate A turnstiles crashed",
      "Gate A: critical, Gate B: normal"
    );

    expect(result).toMatchObject({
      incidentId: expect.any(String),
      severity: expect.stringMatching(/^(CRITICAL|WARNING|INFO)$/),
      affectedZone: expect.any(String),
      rootCause: expect.any(String),
      operationalImpact: expect.any(String),
      reroutingAction: expect.objectContaining({
        triggerDynamicRerouting: expect.any(Boolean),
        divertFrom: expect.any(String),
        divertTo: expect.any(String),
        routingInstructions: expect.any(String),
      }),
      volunteerDeployment: expect.objectContaining({
        actionRequired: expect.any(Boolean),
        quantityToDeploy: expect.any(Number),
        targetLocation: expect.any(String),
        briefingMessage: expect.any(String),
      }),
      publicAnnouncements: expect.objectContaining({
        en: expect.any(String),
        es: expect.any(String),
        fr: expect.any(String),
      }),
      timestamp: expect.any(String),
    });
  });

  it("handles empty event description gracefully", async () => {
    const { analyzeIncident } = await import("@/lib/gemini");
    const result = await analyzeIncident("", "All zones normal");
    expect(result).toBeDefined();
    expect(result.incidentId).toBeDefined();
  });

  it("input length validation constants are defined", async () => {
    const { MAX_EVENT_DESCRIPTION_LENGTH, MAX_ZONE_CONTEXT_LENGTH } = await import("@/lib/constants");
    expect(MAX_EVENT_DESCRIPTION_LENGTH).toBe(2000);
    expect(MAX_ZONE_CONTEXT_LENGTH).toBe(5000);
  });
});

describe("/api/ai rate limiting", () => {
  it("rate limiter allows requests within limit", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const key = `api-ai-test-${Date.now()}`;
    const result = checkRateLimit(key, 30, 60000);
    expect(result.allowed).toBe(true);
  });

  it("rate limiter blocks after exceeding limit", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const key = `api-ai-block-${Date.now()}`;

    for (let i = 0; i < 31; i++) {
      checkRateLimit(key, 30, 60000);
    }

    const result = checkRateLimit(key, 30, 60000);
    expect(result.allowed).toBe(false);
  });
});
