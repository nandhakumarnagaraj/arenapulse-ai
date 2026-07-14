import { generateTelemetryEvent, generateInitialZones } from "@/lib/telemetry";
import { StadiumZone } from "@/lib/types";
import {
  SSE_EVENT_INTERVAL_MIN_MS,
  SSE_EVENT_INTERVAL_MAX_MS,
  SSE_STREAM_DURATION_MS,
  ZONE_RESET_INTERVAL_MS,
  SSE_HEARTBEAT_INTERVAL_MS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

// Module-level state: only persists within a single serverless instance.
// Not shared across instances in production — suitable for demo purposes only.
let currentZones: StadiumZone[] = generateInitialZones();
let lastReset = Date.now();

function resetIfNeeded() {
  if (Date.now() - lastReset > ZONE_RESET_INTERVAL_MS) {
    currentZones = generateInitialZones();
    lastReset = Date.now();
  }
}

export async function GET() {
  resetIfNeeded();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial state
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            event: null,
            zones: currentZones,
            type: "init",
          })}\n\n`
        )
      );

      // Heartbeat to keep connection alive and let client distinguish "idle" from "dead"
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, SSE_HEARTBEAT_INTERVAL_MS);

      // Telemetry events at random intervals
      let eventTimeout: ReturnType<typeof setTimeout>;

      function scheduleNextEvent() {
        const delay = SSE_EVENT_INTERVAL_MIN_MS + Math.random() * (SSE_EVENT_INTERVAL_MAX_MS - SSE_EVENT_INTERVAL_MIN_MS);
        eventTimeout = setTimeout(() => {
          try {
            const { event, updatedZones } = generateTelemetryEvent(currentZones);
            currentZones = updatedZones;

            const payload = JSON.stringify({
              event,
              zones: currentZones,
            });

            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            scheduleNextEvent();
          } catch {
            cleanup();
          }
        }, delay);
      }

      scheduleNextEvent();

      // Auto-close stream after duration limit
      const streamTimeout = setTimeout(() => {
        cleanup();
      }, SSE_STREAM_DURATION_MS);

      function cleanup() {
        clearInterval(heartbeatInterval);
        clearTimeout(eventTimeout);
        clearTimeout(streamTimeout);
        try {
          controller.close();
        } catch {
          // Stream may already be closed
        }
      }
    },
    cancel() {
      // Client disconnected — no explicit cleanup needed since intervals
      // will fail on next enqueue and self-terminate
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
