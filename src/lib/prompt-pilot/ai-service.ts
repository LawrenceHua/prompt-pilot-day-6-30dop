import OpenAI from "openai";
import {
  PromptPilotInput,
  ClarificationAnswer,
  PromptRoadmapResponse,
} from "@/types/prompt-pilot";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

const CLARIFY_SYSTEM_PROMPT = `You are Prompt Pilot, an expert prompt engineer. Generate 3-7 SHORT clarifying questions.

CRITICAL RULES - KEEP QUESTIONS GENERIC:
1. Questions help determine WHAT KIND of prompts to generate
2. DO NOT ask for personal details, company names, or project specifics
3. Focus on: output format preferences, constraints, scope, success criteria
4. Questions should be universally applicable to anyone with similar goals

GOOD GENERIC QUESTIONS:
- "What format do you want outputs in? (bullets, paragraphs, code, tables)"
- "Are there any constraints like timeline or budget?"
- "What does success look like for this goal?"
- "Do you need step-by-step guidance or high-level strategy?"

BAD PERSONALIZED QUESTIONS (AVOID):
- "What is your company name?"
- "What specific product are you building?"
- "Tell me about your team structure"

RESPOND WITH VALID JSON ONLY:
{ "questions": ["question1", "question2", ...] }`;

const ROADMAP_SYSTEM_PROMPT = `You are Prompt Pilot, an expert prompt engineer and strategist. Generate a GENERIC prompt roadmap.

CRITICAL - ALL PROMPTS MUST BE GENERIC:
1. Use placeholders: [YOUR_GOAL], [YOUR_TOPIC], [YOUR_CONSTRAINTS], [YOUR_TIMELINE], [YOUR_CONTEXT]
2. NEVER include specific values from user input - make prompts work for ANYONE
3. Prompts must be copy-paste ready for ChatGPT, Claude, Gemini, Copilot
4. Each prompt MUST specify desired output format (bullets, tables, code, sections)
5. Adapt prompt complexity based on aiSkillLevel:
   - beginner: simpler language, more explanation requests
   - intermediate: balanced, standard prompt patterns
   - advanced: technical, assumes prompt engineering knowledge

STAGE TYPES (choose 3-7 based on use case):
- For "learn_topic": Research -> Fundamentals -> Deep Dive -> Practice -> Apply
- For "build_product": Define -> Research -> Design -> Build -> Test -> Launch
- For "solve_problem": Clarify -> Analyze -> Generate Solutions -> Evaluate -> Implement

PROMPT EXAMPLE (GENERIC):
"You are an expert in [YOUR_TOPIC]. I want to understand the fundamentals.
Please explain:
1. Core concepts I must know
2. Common misconceptions to avoid
3. Recommended learning path
Format: Bullet points with brief explanations."

RESPOND WITH VALID JSON MATCHING THIS SCHEMA:
{
  "summary": ["2-4 bullet lines summarizing the approach"],
  "stages": [
    {
      "id": "stage1",
      "index": 1,
      "name": "Stage Name",
      "objective": "What this stage accomplishes",
      "whenToUse": "When the user should run these prompts",
      "prompts": [
        { "id": "stage1_prompt1", "title": "Short Title", "text": "Full prompt with [PLACEHOLDERS]" }
      ]
    }
  ],
  "tips": ["3-7 tips for using the roadmap effectively"]
}`;

function parseAIResponse<T>(
  content: string,
  fallbackMessage: string
): T | { rawText: string; error: string } {
  try {
    return JSON.parse(content) as T;
  } catch {
    return { rawText: content, error: fallbackMessage };
  }
}

export async function generateClarifyingQuestions(
  input: PromptPilotInput
): Promise<{ questions: string[] } | { error: string; rawText?: string }> {
  const userMessage = `
Goal: ${input.goalDescription}
Use case type: ${input.useCaseType}
AI skill level: ${input.aiSkillLevel}
Time horizon: ${input.timeHorizon}
Preferred tools: ${input.preferredTools || "Not specified"}

Generate short, generic clarifying questions to design a better prompt roadmap.`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CLARIFY_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { error: "Failed to generate questions. Please try again." };
    }

    const parsed = parseAIResponse<{ questions: string[] }>(
      content,
      "The AI returned an unexpected format. Here is the raw output."
    );

    if ("error" in parsed) {
      return parsed;
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return { error: "Invalid response format. Please try again." };
    }

    return parsed;
  } catch (error) {
    console.error("[PromptPilot] Clarify error:", error);
    return { error: "An error occurred while generating questions. Please try again." };
  }
}

export async function generatePromptRoadmap(
  input: PromptPilotInput,
  clarifications: ClarificationAnswer[]
): Promise<PromptRoadmapResponse | { error: string; rawText?: string }> {
  let clarificationText = "";
  if (clarifications.length > 0) {
    clarificationText = "\n\nClarifying Q&A:\n";
    clarifications.forEach((c, idx) => {
      clarificationText += `Q${idx + 1}: ${c.question}\nA${idx + 1}: ${c.answer || "(not answered)"}\n`;
    });
  }

  const userMessage = `
Goal: ${input.goalDescription}
Use case type: ${input.useCaseType}
AI skill level: ${input.aiSkillLevel}
Time horizon: ${input.timeHorizon}
Preferred tools: ${input.preferredTools || "Not specified"}
${clarificationText}

Generate a comprehensive prompt roadmap for this user.`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ROADMAP_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { error: "Failed to generate roadmap. Please try again." };
    }

    const parsed = parseAIResponse<PromptRoadmapResponse>(
      content,
      "The AI returned an unexpected format. Here is the raw output."
    );

    if ("error" in parsed) {
      return parsed;
    }

    if (!parsed.summary || !Array.isArray(parsed.stages) || !parsed.tips) {
      return { error: "Invalid response format. Please try again." };
    }

    return parsed;
  } catch (error) {
    console.error("[PromptPilot] Roadmap error:", error);
    return { error: "An error occurred while generating the roadmap. Please try again." };
  }
}

