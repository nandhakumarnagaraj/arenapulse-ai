/**
 * API route integration tests for /api/announce
 */

describe("/api/announce route logic", () => {
  it("generates announcements in all three languages", async () => {
    const { analyzeIncident } = await import("@/lib/gemini");

    const response = await analyzeIncident(
      "Gate B scanners have failed. 500 fans waiting.",
      "Gate B — East: critical status, 13000/14000 capacity"
    );

    expect(response.publicAnnouncements).toBeDefined();
    expect(response.publicAnnouncements.en).toBeTruthy();
    expect(response.publicAnnouncements.es).toBeTruthy();
    expect(response.publicAnnouncements.fr).toBeTruthy();
  });

  it("English announcements are professional and informative", async () => {
    const { analyzeIncident } = await import("@/lib/gemini");

    const response = await analyzeIncident(
      "Transit Line 3 experiencing 30-minute delay",
      "Transit Hub: normal status"
    );

    const announcement = response.publicAnnouncements.en;
    expect(announcement.length).toBeGreaterThan(30);
    // Should not contain alarming language
    expect(announcement.toLowerCase()).not.toContain("panic");
    expect(announcement.toLowerCase()).not.toContain("danger");
  });

  it("handles different language selection", async () => {
    const { analyzeIncident } = await import("@/lib/gemini");

    const response = await analyzeIncident(
      "Crowd surge at main concourse",
      "Main Concourse: elevated"
    );

    const validLanguages = ["en", "es", "fr"] as const;
    for (const lang of validLanguages) {
      const announcement = response.publicAnnouncements[lang];
      expect(announcement).toBeDefined();
      expect(announcement.length).toBeGreaterThan(10);
    }
  });
});
