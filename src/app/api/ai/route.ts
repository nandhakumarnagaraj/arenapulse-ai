import { analyzeIncident, isGeminiAvailable } from "@/lib/gemini";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventDescription, zoneContext } = body;

    if (!eventDescription || !zoneContext) {
      return Response.json(
        { error: "Missing eventDescription or zoneContext" },
        { status: 400 }
      );
    }

    const response = await analyzeIncident(eventDescription, zoneContext);
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
  return Response.json({
    status: "operational",
    mode: isGeminiAvailable() ? "gemini-live" : "fallback",
    model: isGeminiAvailable() ? "gemini-2.0-flash" : "rule-based-fallback",
    timestamp: new Date().toISOString(),
  });
}
