import { NextRequest, NextResponse } from "next/server";
import { explainImage, summarize, translateText } from "@/lib/openrouter";
import {
  runGovernmentEligibilityAssistant,
  runHealthAssistant,
  runPlantDiseaseAssistant,
} from "@/services/assistantService";
import { runGemmaOrchestration, runGemmaOrchestrationStream, parseStructuredAssistantJson, formatStructuredAnswer } from "@/services/gemmaOrchestrator";
import { AppLanguage, GovernmentEligibilityInput } from "@/types/assistant";

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
        const { messages, stream, conversationId, profile } = body as {
          messages?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
          stream?: boolean;
          conversationId?: string;
          profile?: {
            district?: string;
            state?: "Telangana" | "Andhra Pradesh";
            occupation?: string;
            age?: number;
            landOwnedAcres?: number;
          };
        };
        if (!messages || !Array.isArray(messages)) {
          return NextResponse.json({ error: "Invalid messages parameter" }, { status: 400 });
        }
        const query = messages[messages.length - 1]?.content ?? "";

        if (stream) {
          const encoder = new TextEncoder();
          const responseStream = new ReadableStream({
            async start(controller) {
              try {
                const streamGenerator = runGemmaOrchestrationStream({
                  conversationId: conversationId || "default-conversation",
                  language,
                  query,
                  history: messages
                    .filter((message) => message.role !== "system")
                    .map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content })),
                  profile,
                });

                let lastMetadata: any = null;
                let rawText = "";

                for await (const data of streamGenerator) {
                  if (data.metadata) {
                    lastMetadata = data.metadata;
                  }
                  if (data.chunk) {
                    rawText += data.chunk;
                    // If it is a domain prompt that returns structured JSON, do not stream the raw braces directly to the user if we want clean text.
                    // However, we can stream the text as it is. Let's stream the chunk.
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: data.chunk })}\n\n`));
                  }
                }

                // If the intent classifications returned RAG JSON, the user received raw JSON during streaming.
                // Let's send the final formatted message and tell the client we are done.
                if (lastMetadata?.intent && lastMetadata.intent !== "weather" && lastMetadata.intent !== "scheme_eligibility" && lastMetadata.intent !== "healthcare") {
                  const structured = parseStructuredAssistantJson(rawText, language);
                  const formatted = formatStructuredAnswer(structured, language);
                  // We can yield the final formatted content to replace or append cleanly
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, chunk: "", result: formatted, intent: lastMetadata.intent, confidence: lastMetadata.confidence })}\n\n`));
                } else {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, intent: lastMetadata?.intent || "general", confidence: lastMetadata?.confidence || 0.8 })}\n\n`));
                }

                controller.close();
              } catch (error) {
                const message = error instanceof Error ? error.message : "Streaming failed";
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
                controller.close();
              }
            },
          });

          return new Response(responseStream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          });
        }

        result = (await runGemmaOrchestration({
          conversationId: conversationId || "default-conversation",
          language,
          query,
          history: messages
            .filter((message) => message.role !== "system")
            .map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content })),
          profile,
        })).response;
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
        result =
          action === "health"
            ? await runHealthAssistant(query, language)
            : (
                await runGemmaOrchestration({
                  conversationId: "single-turn",
                  language,
                  query,
                  history: [{ role: "user", content: query }],
                })
              ).response;
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
