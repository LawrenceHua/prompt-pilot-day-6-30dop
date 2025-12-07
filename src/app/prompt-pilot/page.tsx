"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, CheckCircle, MessageCircle, Map, Zap, Copy, Layers } from "lucide-react";
import {
  AppStep,
  ClarificationAnswer,
  PromptPilotInput,
  PromptRoadmapResponse,
  PromptSession,
} from "@/types/prompt-pilot";
import { GoalForm, ClarificationStep, RoadmapView } from "@/components/prompt-pilot";

const STORAGE_KEY = "prompt-pilot-session";

export default function PromptPilotPage() {
  const [step, setStep] = useState<AppStep>("goal");
  const [input, setInput] = useState<PromptPilotInput | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<PromptRoadmapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  // Restore last session
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const session: PromptSession = JSON.parse(saved);
        if (session.roadmap) {
          setInput(session.input);
          setQuestions(session.clarificationQuestions);
          setRoadmap(session.roadmap);
          setStep("roadmap");
          setHasRestoredSession(true);
        }
      }
    } catch (err) {
      console.error("[PromptPilot] Failed to restore session:", err);
    }
  }, []);

  const saveSession = useCallback((session: PromptSession) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (err) {
      console.error("[PromptPilot] Failed to save session:", err);
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("[PromptPilot] Failed to clear session:", err);
    }
  }, []);

  const handleGoalSubmit = useCallback(async (formInput: PromptPilotInput) => {
    setIsLoading(true);
    setError(null);
    setInput(formInput);

    try {
      const res = await fetch("/api/prompt-pilot/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: formInput }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setQuestions(data.questions);
      setStep("clarify");
    } catch (err) {
      console.error("[PromptPilot] Failed to get questions:", err);
      setError("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClarifySubmit = useCallback(
    async (answers: ClarificationAnswer[]) => {
      if (!input) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/prompt-pilot/roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, clarifications: answers }),
        });

        const data = await res.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        setRoadmap(data);
        setStep("roadmap");

        saveSession({
          input,
          clarificationQuestions: questions,
          clarificationAnswers: answers,
          roadmap: data,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("[PromptPilot] Failed to generate roadmap:", err);
        setError("Failed to generate roadmap. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [input, questions, saveSession]
  );

  const handleSkipClarify = useCallback(async () => {
    await handleClarifySubmit([]);
  }, [handleClarifySubmit]);

  const handleReset = useCallback(() => {
    setStep("goal");
    setInput(null);
    setQuestions([]);
    setRoadmap(null);
    setError(null);
    setHasRestoredSession(false);
    clearSession();
  }, [clearSession]);

  const handleBackToGoal = useCallback(() => {
    setStep("goal");
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#050304] text-slate-200">
      <main className="container mx-auto px-4 py-24 max-w-3xl">
        <Link
          href="/30-days-of-product"
          className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to 30 Days Challenge
        </Link>

        <div className="text-center mb-10">
          <div
            className="flex items-center justify-center gap-3 mb-4"
            data-testid="header-icon"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Prompt<span className="text-cyan-400">Pilot</span>
            </h1>
          </div>
          <p className="text-slate-400 max-w-xl mx-auto">
            Turn any goal into a prompt roadmap for your favorite AI tools. Describe what you're trying to do — Prompt Pilot designs the prompts for you.
          </p>
          
          {step === "goal" && (
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>3-7 stages</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>10-20 prompts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Copy className="w-4 h-4 text-emerald-400" />
                <span>Copy-paste ready</span>
              </div>
            </div>
          )}
        </div>

        {hasRestoredSession && step === "roadmap" && (
          <div className="mb-6 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 text-sm text-center">
            ✨ Restored your last session. Want to{" "}
            <button onClick={handleReset} className="underline hover:no-underline">
              start fresh
            </button>
            ?
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { id: "goal", label: "Define Goal", icon: CheckCircle },
            { id: "clarify", label: "Clarify", icon: MessageCircle },
            { id: "roadmap", label: "Roadmap", icon: Map },
          ].map((s, idx) => {
            const isActive = step === s.id;
            const isPast =
              (step === "clarify" && s.id === "goal") ||
              (step === "roadmap" && (s.id === "goal" || s.id === "clarify"));
            const Icon = s.icon;

            return (
              <React.Fragment key={s.id}>
                {idx > 0 && (
                  <div className={`w-12 h-0.5 ${isPast || isActive ? "bg-cyan-500" : "bg-slate-700"}`} />
                )}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-cyan-500 text-white"
                      : isPast
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isPast ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {step === "goal" && (
          <GoalForm initialValue={input || undefined} onSubmit={handleGoalSubmit} isLoading={isLoading} />
        )}

        {step === "clarify" && (
          <ClarificationStep
            questions={questions}
            onBack={handleBackToGoal}
            onSubmit={handleClarifySubmit}
            onSkip={handleSkipClarify}
            isLoading={isLoading}
          />
        )}

        {step === "roadmap" && roadmap && <RoadmapView roadmap={roadmap} onReset={handleReset} />}
      </main>
    </div>
  );
}

