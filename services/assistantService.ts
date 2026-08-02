import { chatWithAI, explainImage } from "@/lib/openrouter";
import { retrieveKnowledge } from "@/lib/rag/retriever";
import {
  AppLanguage,
  GovernmentEligibilityInput,
  KnowledgeDomain,
  PlantDiseaseResult,
  RetrievedChunk,
} from "@/types/assistant";

const serializeContext = (chunks: RetrievedChunk[]): string =>
  chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}] ${chunk.title}\n${chunk.content}\n(Score: ${chunk.score.toFixed(3)})`
    )
    .join("\n\n");

const domainLabel = (domain: KnowledgeDomain, language: AppLanguage): string => {
  if (language === "en") {
    if (domain === "agriculture") return "agriculture";
    if (domain === "government") return "government welfare schemes";
    return "healthcare";
  }
  if (domain === "agriculture") return "వ్యవసాయం";
  if (domain === "government") return "ప్రభుత్వ పథకాలు";
  return "ఆరోగ్యం";
};

export const runGroundedAssistant = async (
  query: string,
  domain: KnowledgeDomain,
  language: AppLanguage
): Promise<string> => {
  const chunks = retrieveKnowledge(query, domain);
  const context = serializeContext(chunks);
  const area = domainLabel(domain, language);

  const prompt =
    language === "en"
      ? `You are Saarathi AI for ${area}. You must only answer using the context below.

Rules:
1. Do not invent facts not present in context.
2. If context is insufficient, clearly say so and ask the user to verify on official sources.
3. Give practical step-by-step guidance for rural users.
4. End with "Grounded Sources Used" and list source titles.

Context:
${context}

User query: ${query}`
      : `${area} కోసం మీరు Saarathi AI. కింద ఇచ్చిన కాంటెక్స్ట్ ఆధారంగా మాత్రమే సమాధానం ఇవ్వాలి.

నియమాలు:
1. కాంటెక్స్ట్‌లో లేని విషయాలు ఊహించి చెప్పవద్దు.
2. సరిపడ సమాచారం లేకపోతే స్పష్టంగా చెప్పి అధికారిక వనరులు చూసుకోమని సూచించండి.
3. గ్రామీణ వినియోగదారులకు అర్థమయ్యేలా దశలవారీగా చెప్పండి.
4. చివరలో "Grounded Sources Used" అని పెట్టి వాడిన source శీర్షికలు ఇవ్వండి.

Context:
${context}

వినియోగదారు ప్రశ్న: ${query}`;

  return chatWithAI([{ role: "user", content: prompt }], undefined, language);
};

const emergencyKeywords = [
  "chest pain",
  "breathing",
  "seizure",
  "stroke",
  "severe bleeding",
  "శ్వాస",
  "ఛాతి నొప్పి",
  "పట్టు",
  "పక్షవాతం",
];

const hasEmergencySignals = (query: string): boolean => {
  const text = query.toLowerCase();
  return emergencyKeywords.some((word) => text.includes(word));
};

export const runHealthAssistant = async (query: string, language: AppLanguage): Promise<string> => {
  const grounded = await runGroundedAssistant(query, "healthcare", language);
  const emergencyNotice = hasEmergencySignals(query)
    ? language === "en"
      ? "\n\n⚠️ Emergency caution: Symptoms may require urgent medical care. Please contact emergency services or go to the nearest hospital immediately."
      : "\n\n⚠️ అత్యవసర హెచ్చరిక: లక్షణాలు తీవ్రంగా ఉండవచ్చు. వెంటనే సమీప ఆసుపత్రికి వెళ్లండి లేదా అత్యవసర సేవలను సంప్రదించండి."
    : "";

  const mandatoryDisclaimer =
    language === "en"
      ? "\n\nMedical Disclaimer: I am an AI assistant, not a doctor. This is informational support only. Please consult a qualified doctor."
      : "\n\nవైద్య హెచ్చరిక: నేను AI సహాయకుడిని మాత్రమే, వైద్యుడు కాదు. ఇది సమాచారం కోసం మాత్రమే. దయచేసి అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.";

  return `${grounded}${emergencyNotice}${mandatoryDisclaimer}`;
};

interface SchemeRule {
  id: string;
  name: string;
  minAge?: number;
  maxIncome?: number;
  minLand?: number;
  allowedOccupations?: string[];
  categories?: string[];
}

const schemeRules: SchemeRule[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    maxIncome: 300000,
    minLand: 0.1,
    allowedOccupations: ["farmer", "agriculture", "cultivator"],
  },
  {
    id: "old-age-pension",
    name: "Old Age Pension",
    minAge: 60,
    maxIncome: 200000,
  },
  {
    id: "bc-welfare",
    name: "Backward Class Welfare Grant",
    maxIncome: 250000,
    categories: ["bc", "obc"],
  },
];

export const runGovernmentEligibilityAssistant = (
  input: GovernmentEligibilityInput,
  language: AppLanguage
): string => {
  const occupation = input.occupation.toLowerCase();
  const category = input.category.toLowerCase();

  const eligible = schemeRules.filter((rule) => {
    if (rule.minAge !== undefined && input.age < rule.minAge) return false;
    if (rule.maxIncome !== undefined && input.annualIncome > rule.maxIncome) return false;
    if (rule.minLand !== undefined && input.landOwnedAcres < rule.minLand) return false;
    if (rule.allowedOccupations && !rule.allowedOccupations.some((item) => occupation.includes(item))) {
      return false;
    }
    if (rule.categories && !rule.categories.includes(category)) return false;
    return true;
  });

  if (language === "en") {
    if (eligible.length === 0) {
      return "No schemes matched the provided profile in current local rules. Please verify district-specific options on official portals.";
    }
    return `Eligible schemes based on provided details:\n${eligible
      .map((item) => `- ${item.name}`)
      .join("\n")}\n\nPlease verify final eligibility and documents at your district MeeSeva/official portal.`;
  }

  if (eligible.length === 0) {
    return "మీరు ఇచ్చిన వివరాలకు సరిపడే పథకాలు ప్రస్తుత నియమాల్లో కనిపించలేదు. జిల్లా అధికారిక పోర్టల్‌లో తప్పనిసరిగా చెక్ చేయండి.";
  }

  return `మీ వివరాల ఆధారంగా సూచించిన అర్హత కలిగిన పథకాలు:\n${eligible
    .map((item) => `- ${item.name}`)
    .join("\n")}\n\nచివరి అర్హత మరియు అవసరమైన పత్రాల కోసం జిల్లా MeeSeva/అధికారిక పోర్టల్ తప్పనిసరిగా పరిశీలించండి.`;
};

const parsePlantDiseaseResult = (raw: string, language: AppLanguage): PlantDiseaseResult => {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as PlantDiseaseResult;
      return parsed;
    } catch {
      // Fall through to safe fallback response.
    }
  }

  return {
    disease: language === "en" ? "Uncertain" : "ఖచ్చితంగా తెలియదు",
    confidence: 0.25,
    treatments: [
      language === "en"
        ? "Consult local agriculture extension officer before applying pesticides."
        : "పెస్టిసైడ్ వాడకానికి ముందు స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి.",
    ],
    preventiveMeasures: [
      language === "en"
        ? "Maintain field hygiene and remove infected leaves."
        : "పొలంలో శుభ్రత పాటించండి, సోకిన ఆకులను తొలగించండి.",
    ],
    teluguExplanation:
      language === "en"
        ? "System could not confidently parse disease details."
        : "వ్యాధి వివరాలను ఖచ్చితంగా గుర్తించలేకపోయింది.",
    disclaimer:
      language === "en"
        ? "AI result is advisory only; verify with agricultural experts."
        : "ఇది సూచన మాత్రమే; వ్యవసాయ నిపుణులతో ధృవీకరించండి.",
  };
};

export const runPlantDiseaseAssistant = async (
  imageBase64: string,
  mimeType: string,
  language: AppLanguage
): Promise<PlantDiseaseResult> => {
  const prompt =
    language === "en"
      ? `Analyze this plant/leaf image and return only JSON with keys:
disease (string), confidence (0 to 1), treatments (string[]), preventiveMeasures (string[]), teluguExplanation (string), disclaimer (string).
If uncertain, clearly mark disease as "Uncertain".`
      : `ఈ ఆకు/మొక్క చిత్రాన్ని విశ్లేషించి కేవలం JSON మాత్రమే ఇవ్వండి. keys:
disease (string), confidence (0 to 1), treatments (string[]), preventiveMeasures (string[]), teluguExplanation (string), disclaimer (string).
ఖచ్చితంగా తెలియకపోతే disease ను "Uncertain" అని ఇవ్వండి.`;

  const raw = await explainImage(imageBase64, mimeType, prompt, language);
  return parsePlantDiseaseResult(raw, language);
};
