import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIIncidentResponse } from "./types";
import { REROUTING_SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

const hasApiKey = !!process.env.GEMINI_API_KEY;
const genAI = hasApiKey
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  : null;

function cleanJsonOutput(raw: string): string {
  const trimmed = raw.trim();
  const markdownMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (markdownMatch) {
    return markdownMatch[1].trim();
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.substring(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

const FALLBACK_RESPONSES: Record<string, Omit<AIIncidentResponse, "incidentId" | "timestamp">> = {
  gate_failure: {
    severity: "CRITICAL",
    affectedZone: "Gate Entry Point",
    rootCause: "Automated turnstile hardware/software crash causing entry bottleneck",
    operationalImpact: "Severe bottleneck forming. Risk of crowd crush at gate perimeter. Fan agitation increasing.",
    reroutingAction: {
      triggerDynamicRerouting: true,
      divertFrom: "Affected Gate",
      divertTo: "Adjacent Available Gate",
      routingInstructions: "Direct all incoming fans away from the affected gate walkway. Funnel traffic through the nearest bypass corridor to the alternate gate turnstile arrays.",
    },
    volunteerDeployment: {
      actionRequired: true,
      quantityToDeploy: 12,
      targetLocation: "Affected gate approach intersection",
      briefingMessage: "Turnstiles are down. Actively intercept arriving fans. Verbally instruct and physically point them toward the bypass corridor to use the alternate gate. Stay calm, clear, and visible.",
    },
    publicAnnouncements: {
      en: "Attention FIFA fans: Entry points at the affected gate are temporarily experiencing technical delays. Please proceed to the alternate gate located via the bypass corridor, where wait times are under two minutes. Thank you for your cooperation.",
      es: "Atención aficionados de la FIFA: Los puntos de acceso están experimentando retrasos técnicos temporales. Por favor, diríjase a la puerta alternativa ubicada a través del corredor de desvío, donde el tiempo de espera es menor a dos minutos. Gracias por su cooperación.",
      fr: "Attention aux supporters de la FIFA : Les points d'accès connaissent des retards techniques temporaires. Veuillez vous diriger vers la porte alternative via le couloir de contournement, où le temps d'attente est inférieur à deux minutes. Merci de votre coopération.",
    },
  },
  crowd_spike: {
    severity: "WARNING",
    affectedZone: "Concourse Area",
    rootCause: "Unexpected crowd surge exceeding capacity projections",
    operationalImpact: "Density at elevated levels. Concourse flow rate dropping. Secondary bottleneck forming.",
    reroutingAction: {
      triggerDynamicRerouting: true,
      divertFrom: "Congested Concourse Section",
      divertTo: "Lower-density adjacent corridor",
      routingInstructions: "Redirect foot traffic to adjacent corridors with available capacity. Open additional access points to distribute crowd evenly.",
    },
    volunteerDeployment: {
      actionRequired: true,
      quantityToDeploy: 8,
      targetLocation: "Congested concourse junction",
      briefingMessage: "Guide fans toward less crowded corridors. Maintain calm flow. Redirect families with children to priority lanes.",
    },
    publicAnnouncements: {
      en: "For a smoother experience, please use the adjacent corridors which have shorter wait times. Staff members are available to guide you. Thank you for your patience.",
      es: "Para una experiencia más fluida, utilice los corredores adyacentes que tienen tiempos de espera más cortos. El personal está disponible para guiarle. Gracias por su paciencia.",
      fr: "Pour une expérience plus fluide, veuillez utiliser les couloirs adjacents qui disposent de temps d'attente plus courts. Le personnel est disponible pour vous guider. Merci de votre patience.",
    },
  },
  transit_delay: {
    severity: "WARNING",
    affectedZone: "Transit Hub",
    rootCause: "Public transit service disruption affecting fan arrival/departure",
    operationalImpact: "Passengers stranded. Alternative transit routes needed. Post-match egress may be delayed.",
    reroutingAction: {
      triggerDynamicRerouting: true,
      divertFrom: "Affected Transit Line Platform",
      divertTo: "Alternative transit lines",
      routingInstructions: "Direct passengers to alternative transit lines. Coordinate with transit authority for emergency bus shuttle service.",
    },
    volunteerDeployment: {
      actionRequired: true,
      quantityToDeploy: 6,
      targetLocation: "Transit hub information desk",
      briefingMessage: "Assist fans with alternative route planning. Distribute transit maps. Coordinate shuttle bus boarding.",
    },
    publicAnnouncements: {
      en: "Attention passengers: The affected transit line is experiencing delays. Alternative routes are available via alternate lines. Shuttle buses are being dispatched. Please follow volunteer directions.",
      es: "Atención pasajeros: La línea de tránsito afectada está experimentando retrasos. Rutas alternativas están disponibles a través de líneas alternativas. Autobuses de refuerzo están siendo enviados. Siga las instrucciones del personal.",
      fr: "Attention passagers : La ligne de transport affectée connaît des retards. Des itinéraires alternatifs sont disponibles via d'autres lignes. Des bus de substitution sont en cours d'envoi. Veuillez suivre les instructions du personnel.",
    },
  },
  weather_alert: {
    severity: "WARNING",
    affectedZone: "Outdoor Areas",
    rootCause: "Adverse weather conditions affecting outdoor stadium areas",
    operationalImpact: "Outdoor queue areas at risk. Temporary structures may need securing. Fan safety advisory for exposed walkways.",
    reroutingAction: {
      triggerDynamicRerouting: true,
      divertFrom: "Exposed outdoor walkways",
      divertTo: "Covered concourse areas",
      routingInstructions: "Move fans from exposed areas to covered concourse. Secure temporary structures. Activate weather contingency protocols.",
    },
    volunteerDeployment: {
      actionRequired: true,
      quantityToDeploy: 10,
      targetLocation: "Outdoor queue areas and walkways",
      briefingMessage: "Guide fans to covered areas immediately. Assist with securing loose items. Prioritize elderly and children for indoor shelter.",
    },
    publicAnnouncements: {
      en: "Due to weather conditions, please move to the nearest covered concourse area. Staff will guide you to sheltered locations. Your safety is our priority.",
      es: "Debido a las condiciones climáticas, por favor muévase al área cubierta más cercana. El personal le guiará a ubicaciones protegidas. Su seguridad es nuestra prioridad.",
      fr: "En raison des conditions météorologiques, veuillez vous déplacer vers la zone couverte la plus proche. Le personnel vous guidera vers des emplacements abrités. Votre sécurité est notre priorité.",
    },
  },
  medical: {
    severity: "CRITICAL",
    affectedZone: "Stadium Section",
    rootCause: "Medical emergency requiring immediate response",
    operationalImpact: "Emergency access required. Nearby aisles must be cleared. EMS response in progress.",
    reroutingAction: {
      triggerDynamicRerouting: true,
      divertFrom: "Emergency access aisle",
      divertTo: "Adjacent seating sections",
      routingInstructions: "Clear the affected aisle immediately. Redirect foot traffic away from emergency response area. Maintain clear corridor for EMS access.",
    },
    volunteerDeployment: {
      actionRequired: true,
      quantityToDeploy: 4,
      targetLocation: "Emergency access corridor",
      briefingMessage: "Clear the area immediately. Keep crowds back. Ensure unobstructed access for emergency medical services.",
    },
    publicAnnouncements: {
      en: "Attention: Medical personnel are responding to an incident in the affected section. Please clear the nearby aisles and allow emergency access. Thank you for your cooperation.",
      es: "Atención: El personal médico está respondiendo a un incidente en la sección afectada. Por favor, despeje los pasillos cercanos y permita el acceso de emergencia. Gracias por su cooperación.",
      fr: "Attention : Le personnel médical répond à un incident dans la section affectée. Veuillez dégager les allées à proximité et permettre l'accès d'urgence. Merci de votre coopération.",
    },
  },
};

function generateFallbackResponse(
  eventDescription: string,
  zoneContext: string
): AIIncidentResponse {
  const desc = eventDescription.toLowerCase();
  let matchedType = "crowd_spike";

  if (desc.includes("turnstile") || desc.includes("gate") || desc.includes("scanner") || desc.includes("power outage")) {
    matchedType = "gate_failure";
  } else if (desc.includes("transit") || desc.includes("train") || desc.includes("bus") || desc.includes("delay")) {
    matchedType = "transit_delay";
  } else if (desc.includes("weather") || desc.includes("lightning") || desc.includes("wind") || desc.includes("rain")) {
    matchedType = "weather_alert";
  } else if (desc.includes("medical") || desc.includes("emergency") || desc.includes("ems") || desc.includes("heat")) {
    matchedType = "medical";
  }

  const template = FALLBACK_RESPONSES[matchedType];
  const affectedZone = zoneContext.split("\n").find((l) => l.includes("critical") || l.includes("elevated"))?.split(":")[0]?.trim() || "Unknown Zone";

  return {
    incidentId: `INC-FB-${Date.now().toString(36).toUpperCase()}`,
    severity: template.severity,
    affectedZone,
    rootCause: template.rootCause,
    operationalImpact: template.operationalImpact,
    reroutingAction: {
      ...template.reroutingAction,
      divertFrom: affectedZone,
    },
    volunteerDeployment: template.volunteerDeployment,
    publicAnnouncements: template.publicAnnouncements,
    timestamp: new Date().toISOString(),
  };
}

export async function analyzeIncident(
  eventDescription: string,
  zoneContext: string
): Promise<AIIncidentResponse> {
  if (!genAI) {
    return generateFallbackResponse(eventDescription, zoneContext);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: REROUTING_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const userPrompt = buildUserPrompt(eventDescription, zoneContext);
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const rawText = response.text();
    const cleanedJson = cleanJsonOutput(rawText);
    const parsed = JSON.parse(cleanedJson) as AIIncidentResponse;
    parsed.timestamp = new Date().toISOString();
    return parsed;
  } catch (error) {
    console.error("Gemini API error:", error instanceof Error ? error.message : error);
    return generateFallbackResponse(eventDescription, zoneContext);
  }
}

export function isGeminiAvailable(): boolean {
  return hasApiKey;
}
