/**
 * Application-wide constants.
 * Centralizes magic numbers and configuration values.
 */

// --- SSE / Telemetry ---
/** Minimum interval between telemetry events (ms) */
export const SSE_EVENT_INTERVAL_MIN_MS = 5000;
/** Maximum interval between telemetry events (ms) */
export const SSE_EVENT_INTERVAL_MAX_MS = 10000;
/** How long an SSE stream stays open before auto-closing (ms) */
export const SSE_STREAM_DURATION_MS = 300000; // 5 minutes
/** Zone state reset interval (ms) */
export const ZONE_RESET_INTERVAL_MS = 120000; // 2 minutes
/** SSE reconnect delay on client (ms) */
export const SSE_RECONNECT_DELAY_MS = 3000;
/** SSE heartbeat interval (ms) */
export const SSE_HEARTBEAT_INTERVAL_MS = 15000;

// --- Event / Response Limits ---
/** Max events to keep in the client-side event history */
export const MAX_EVENT_HISTORY = 50;
/** Max AI responses to keep in the client-side history */
export const MAX_AI_RESPONSE_HISTORY = 20;
/** Max processed event IDs to track for deduplication */
export const MAX_PROCESSED_EVENT_IDS = 200;
/** Trim processed event IDs down to this count when max is reached */
export const PROCESSED_EVENT_IDS_TRIM_TARGET = 150;

// --- Input Validation ---
/** Max character length for event descriptions in API requests */
export const MAX_EVENT_DESCRIPTION_LENGTH = 2000;
/** Max character length for zone context in API requests */
export const MAX_ZONE_CONTEXT_LENGTH = 5000;
