import { NextRequest, NextResponse } from "next/server";
import {
  chatWithAI,
  translateText,
  governmentAssistant,
  healthAssistant,
  agricultureAssistant,
  summarize,
  explainImage,
} from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, language = "te" } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
    }

    let result;

    switch (action) {
      case "chat": {
        const { messages, model } = body;
        if (!messages || !Array.isArray(messages)) {
          return NextResponse.json({ error: "Invalid messages parameter" }, { status: 400 });
        }
        result = await chatWithAI(messages, model, language);
        break;
      }

      case "translate": {
        const { text, direction } = body;
        if (!text || !direction) {
          return NextResponse.json({ error: "Missing text or direction parameter" }, { status: 400 });
        }
        result = await translateText(text, direction);
        break;
      }

      case "government": {
        const { query, category } = body;
        if (!query) {
          return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
        }
        result = await governmentAssistant(query, category, language);
        break;
      }

      case "health": {
        const { query } = body;
        if (!query) {
          return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
        }
        result = await healthAssistant(query, language);
        break;
      }

      case "agriculture": {
        const { query } = body;
        if (!query) {
          return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
        }
        result = await agricultureAssistant(query, language);
        break;
      }

      case "summarize": {
        const { text } = body;
        if (!text) {
          return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
        }
        result = await summarize(text, language);
        break;
      }

      case "explain-image": {
        const { imageBase64, mimeType, prompt } = body;
        if (!imageBase64 || !mimeType) {
          return NextResponse.json({ error: "Missing imageBase64 or mimeType parameter" }, { status: 400 });
        }
        result = await explainImage(imageBase64, mimeType, prompt, language);
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during API processing" },
      { status: 500 }
    );
  }
}
