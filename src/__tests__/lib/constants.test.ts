import {
  SSE_EVENT_INTERVAL_MIN_MS,
  SSE_EVENT_INTERVAL_MAX_MS,
  SSE_STREAM_DURATION_MS,
  ZONE_RESET_INTERVAL_MS,
  SSE_RECONNECT_DELAY_MS,
  SSE_HEARTBEAT_INTERVAL_MS,
  MAX_EVENT_HISTORY,
  MAX_AI_RESPONSE_HISTORY,
  MAX_PROCESSED_EVENT_IDS,
  PROCESSED_EVENT_IDS_TRIM_TARGET,
  MAX_EVENT_DESCRIPTION_LENGTH,
  MAX_ZONE_CONTEXT_LENGTH,
} from "@/lib/constants";

describe("constants", () => {
  it("SSE intervals are valid", () => {
    expect(SSE_EVENT_INTERVAL_MIN_MS).toBeGreaterThan(0);
    expect(SSE_EVENT_INTERVAL_MAX_MS).toBeGreaterThan(SSE_EVENT_INTERVAL_MIN_MS);
    expect(SSE_STREAM_DURATION_MS).toBeGreaterThan(SSE_EVENT_INTERVAL_MAX_MS);
  });

  it("SSE heartbeat is shorter than event interval", () => {
    expect(SSE_HEARTBEAT_INTERVAL_MS).toBeGreaterThan(0);
    expect(SSE_HEARTBEAT_INTERVAL_MS).toBeLessThanOrEqual(SSE_EVENT_INTERVAL_MAX_MS * 3);
  });

  it("zone reset interval is reasonable", () => {
    expect(ZONE_RESET_INTERVAL_MS).toBeGreaterThan(60000);
    expect(ZONE_RESET_INTERVAL_MS).toBeLessThan(SSE_STREAM_DURATION_MS);
  });

  it("reconnect delay is reasonable", () => {
    expect(SSE_RECONNECT_DELAY_MS).toBeGreaterThanOrEqual(1000);
    expect(SSE_RECONNECT_DELAY_MS).toBeLessThanOrEqual(10000);
  });

  it("event history limits are valid", () => {
    expect(MAX_EVENT_HISTORY).toBeGreaterThan(0);
    expect(MAX_AI_RESPONSE_HISTORY).toBeGreaterThan(0);
    expect(MAX_PROCESSED_EVENT_IDS).toBeGreaterThan(PROCESSED_EVENT_IDS_TRIM_TARGET);
  });

  it("input validation limits are reasonable", () => {
    expect(MAX_EVENT_DESCRIPTION_LENGTH).toBeGreaterThan(100);
    expect(MAX_ZONE_CONTEXT_LENGTH).toBeGreaterThan(MAX_EVENT_DESCRIPTION_LENGTH);
  });
});
