import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows first request", () => {
    const result = checkRateLimit("test-user-1", 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks request count correctly", () => {
    const key = `test-user-${Date.now()}`;
    const r1 = checkRateLimit(key, 3, 60000);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, 3, 60000);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(key, 3, 60000);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests beyond the limit", () => {
    const key = `test-block-${Date.now()}`;
    checkRateLimit(key, 2, 60000);
    checkRateLimit(key, 2, 60000);
    const r3 = checkRateLimit(key, 2, 60000);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("returns reset time information", () => {
    const key = `test-reset-${Date.now()}`;
    const result = checkRateLimit(key, 10, 30000);
    expect(result.resetInMs).toBeGreaterThan(0);
    expect(result.resetInMs).toBeLessThanOrEqual(30000);
  });

  it("uses different limits for different identifiers", () => {
    const key1 = `user-a-${Date.now()}`;
    const key2 = `user-b-${Date.now()}`;

    checkRateLimit(key1, 1, 60000);
    const r1 = checkRateLimit(key1, 1, 60000);
    expect(r1.allowed).toBe(false);

    const r2 = checkRateLimit(key2, 1, 60000);
    expect(r2.allowed).toBe(true);
  });
});
