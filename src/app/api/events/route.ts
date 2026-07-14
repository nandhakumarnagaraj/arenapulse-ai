import { generateTelemetryEvent, generateInitialZones } from "@/lib/telemetry";
import { StadiumZone } from "@/lib/types";

export const dynamic = "force-dynamic";

let currentZones: StadiumZone[] = generateInitialZones();
let lastReset = Date.now();

function resetIfNeeded() {
  if (Date.now() - lastReset > 120000) {
    currentZones = generateInitialZones();
    lastReset = Date.now();
  }
}

export async function GET() {
  resetIfNeeded();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        try {
          const { event, updatedZones } = generateTelemetryEvent(currentZones);
          currentZones = updatedZones;

          const payload = JSON.stringify({
            event,
            zones: currentZones,
          });

          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 5000 + Math.random() * 5000);

      setTimeout(() => {
        clearInterval(interval);
        controller.close();
      }, 300000);

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            event: null,
            zones: currentZones,
            type: "init",
          })}\n\n`
        )
      );
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
