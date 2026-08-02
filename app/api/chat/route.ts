import { NextRequest, NextResponse } from "next/server";
import { chatWithAI, explainImage, summarize, translateText } from "@/lib/openrouter";
import {
  runGovernmentEligibilityAssistant,
  runGroundedAssistant,
  runHealthAssistant,
  runPlantDiseaseAssistant,
} from "@/services/assistantService";
import { AppLanguage, GovernmentEligibilityInput, KnowledgeDomain } from "@/types/assistant";

const parseLanguage = (value: unknown): AppLanguage => (value === "en" ? "en" : "te");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;
    const language = parseLanguage(body.language);

    if (typeof action !== "string" || action.length === 0) {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
    }

    let result: unknown;

    switch (action) {
      case "chat": {
        const { messages, model } = body as {
          messages?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
          model?: string;
        };
        if (!messages || !Array.isArray(messages)) {
          return NextResponse.json({ error: "Invalid messages parameter" }, { status: 400 });
        }
        result = await chatWithAI(messages, model, language);
        break;
      }
      case "translate": {
        const { text, direction } = body as { text?: string; direction?: "en-te" | "te-en" | "roman-te" };
        if (!text || !direction) {
          return NextResponse.json({ error: "Missing text or direction parameter" }, { status: 400 });
        }
        result = await translateText(text, direction);
        break;
      }
      case "government":
      case "health":
      case "agriculture": {
        const { query } = body as { query?: string };
        if (!query) {
          return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
        }
        const domainMap: Record<"government" | "health" | "agriculture", KnowledgeDomain> = {
          government: "government",
          health: "healthcare",
          agriculture: "agriculture",
        };
        result =
          action === "health"
            ? await runHealthAssistant(query, language)
            : await runGroundedAssistant(query, domainMap[action], language);
        break;
      }
      case "government-eligibility": {
        const input = body.input as GovernmentEligibilityInput | undefined;
        if (!input) {
          return NextResponse.json({ error: "Missing eligibility input" }, { status: 400 });
        }
        result = runGovernmentEligibilityAssistant(input, language);
        break;
      }
      case "summarize": {
        const { text } = body as { text?: string };
        if (!text) {
          return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
        }
        result = await summarize(text, language);
        break;
      }
      case "explain-image": {
        const { imageBase64, mimeType, prompt } = body as {
          imageBase64?: string;
          mimeType?: string;
          prompt?: string;
        };
        if (!imageBase64 || !mimeType) {
          return NextResponse.json({ error: "Missing imageBase64 or mimeType parameter" }, { status: 400 });
        }
        result = await explainImage(imageBase64, mimeType, prompt, language);
        break;
      }
      case "plant-disease": {
        const { imageBase64, mimeType } = body as { imageBase64?: string; mimeType?: string };
        if (!imageBase64 || !mimeType) {
          return NextResponse.json({ error: "Missing imageBase64 or mimeType parameter" }, { status: 400 });
        }
        result = await runPlantDiseaseAssistant(imageBase64, mimeType, language);
        break;
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred during API processing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
