import { analyzeIncident, isGeminiAvailable } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { MAX_EVENT_DESCRIPTION_LENGTH, MAX_ZONE_CONTEXT_LENGTH } from "@/lib/constants";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Rate limiting (30 requests per minute per IP)
  const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
  const { allowed, resetInMs } = checkRateLimit(clientIp, 30, 60000);
  if (!allowed) {
    return Response.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(resetInMs / 1000)) },
      }
    );
  }

  try {
    const body = await request.json();
    const { eventDescription, zoneContext } = body;

    if (!eventDescription || !zoneContext) {
      return Response.json(
        { error: "Missing eventDescription or zoneContext" },
        { status: 400 }
      );
    }

    // Input validation — prevent excessively large payloads
    if (typeof eventDescription !== "string" || typeof zoneContext !== "string") {
      return Response.json(
        { error: "eventDescription and zoneContext must be strings" },
        { status: 400 }
      );
    }

    const trimmedDescription = eventDescription.slice(0, MAX_EVENT_DESCRIPTION_LENGTH);
    const trimmedContext = zoneContext.slice(0, MAX_ZONE_CONTEXT_LENGTH);

    const response = await analyzeIncident(trimmedDescription, trimmedContext);
    return Response.json({
      ...response,
      _meta: {
        mode: isGeminiAvailable() ? "gemini-live" : "fallback",
        model: isGeminiAvailable() ? "gemini-2.0-flash" : "rule-based",
      },
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return Response.json(
      { error: "Failed to analyze incident" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json(
    {
      status: "operational",
      mode: isGeminiAvailable() ? "gemini-live" : "fallback",
      model: isGeminiAvailable() ? "gemini-2.0-flash" : "rule-based-fallback",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      },
    }
  );
}
