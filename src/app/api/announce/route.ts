import { analyzeIncident } from "@/lib/gemini";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventDescription, zoneContext, language } = body;

    if (!eventDescription) {
      return Response.json(
        { error: "Missing eventDescription" },
        { status: 400 }
      );
    }

    const response = await analyzeIncident(eventDescription, zoneContext || "All zones operational.");

    const announcement = response.publicAnnouncements[language as keyof typeof response.publicAnnouncements]
      || response.publicAnnouncements.en;

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
