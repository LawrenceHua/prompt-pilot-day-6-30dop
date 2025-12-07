import { NextRequest, NextResponse } from "next/server";
import { generatePromptRoadmap } from "@/lib/prompt-pilot/ai-service";
import {
  PromptPilotInput,
  ClarificationAnswer,
  PromptRoadmapResponse,
} from "@/types/prompt-pilot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input: PromptPilotInput | undefined = body?.input;
    const clarifications: ClarificationAnswer[] = body?.clarifications || [];

    if (!input?.goalDescription || typeof input.goalDescription !== "string") {
      return NextResponse.json(
        { error: "Goal description is required" },
        { status: 400 }
      );
    }

    const result = await generatePromptRoadmap(input, clarifications);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, rawText: result.rawText },
        { status: 500 }
      );
    }

    return NextResponse.json(result as PromptRoadmapResponse);
  } catch (error) {
    console.error("[PromptPilot] Roadmap route error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

