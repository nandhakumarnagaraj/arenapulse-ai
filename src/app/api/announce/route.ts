import { analyzeIncident } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { MAX_EVENT_DESCRIPTION_LENGTH, MAX_ZONE_CONTEXT_LENGTH } from "@/lib/constants";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Rate limiting (20 requests per minute per IP)
  const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
  const { allowed, resetInMs } = checkRateLimit(`announce-${clientIp}`, 20, 60000);
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
    const { eventDescription, zoneContext, language } = body;

    if (!eventDescription) {
      return Response.json(
        { error: "Missing eventDescription" },
        { status: 400 }
      );
    }

    if (typeof eventDescription !== "string") {
      return Response.json(
        { error: "eventDescription must be a string" },
        { status: 400 }
      );
    }

    const trimmedDescription = eventDescription.slice(0, MAX_EVENT_DESCRIPTION_LENGTH);
    const trimmedContext = typeof zoneContext === "string"
      ? zoneContext.slice(0, MAX_ZONE_CONTEXT_LENGTH)
      : "All zones operational.";

    const validLanguages = ["en", "es", "fr"] as const;
    const selectedLang = validLanguages.includes(language as typeof validLanguages[number])
      ? (language as "en" | "es" | "fr")
      : "en";

    const response = await analyzeIncident(trimmedDescription, trimmedContext);

    const announcement = response.publicAnnouncements[selectedLang];

    return Response.json({
      announcement,
      severity: response.severity,
      incidentId: response.incidentId,
      allLanguages: response.publicAnnouncements,
    });
  } catch (error) {
    console.error("Announcement generation error:", error);
    return Response.json(
      { error: "Failed to generate announcement" },
      { status: 500 }
    );
  }
}
