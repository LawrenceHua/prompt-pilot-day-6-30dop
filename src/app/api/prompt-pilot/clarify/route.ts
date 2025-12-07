import { NextRequest, NextResponse } from "next/server";
import { generateClarifyingQuestions } from "@/lib/prompt-pilot/ai-service";
import { PromptPilotInput } from "@/types/prompt-pilot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input: PromptPilotInput | undefined = body?.input;

    if (!input?.goalDescription || typeof input.goalDescription !== "string") {
      return NextResponse.json(
        { error: "Goal description is required" },
        { status: 400 }
      );
    }

    const result = await generateClarifyingQuestions(input);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, rawText: result.rawText },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PromptPilot] Clarify route error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

