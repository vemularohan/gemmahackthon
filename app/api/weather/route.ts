import { NextRequest, NextResponse } from "next/server";
import { getWeatherAdvisory } from "@/services/weatherService";

export async function GET(request: NextRequest) {
  const location = request.nextUrl.searchParams.get("location");
  const language = request.nextUrl.searchParams.get("language") === "en" ? "en" : "te";

  if (!location) {
    return NextResponse.json({ error: "Missing location query parameter" }, { status: 400 });
  }

  try {
    const result = await getWeatherAdvisory(location, language);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch weather";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
