"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, SkipForward } from "lucide-react";
import { ClarificationAnswer } from "@/types/prompt-pilot";

interface ClarificationStepProps {
  questions: string[];
  onBack: () => void;
  onSubmit: (answers: ClarificationAnswer[]) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export function ClarificationStep({ questions, onBack, onSubmit, onSkip, isLoading }: ClarificationStepProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ClarificationAnswer[] = questions.map((q, idx) => ({
      question: q,
      answer: answers[idx] || "",
    }));
    onSubmit(payload);
  };

  const updateAnswer = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  return (
    <div className="space-y-6" data-testid="clarification-step">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Goal
        </button>
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="text-slate-500 hover:text-cyan-400 flex items-center gap-1 text-sm transition-colors disabled:opacity-50"
        >
          <SkipForward className="w-4 h-4" />
          Skip, generate anyway
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-white">A few quick questions</h2>
            <p className="text-sm text-slate-400">Answer these to get a more tailored prompt roadmap</p>
          </div>

          {questions.map((question, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {idx + 1}. {question}
              </label>
              <textarea
                value={answers[idx] || ""}
                onChange={(e) => updateAnswer(idx, e.target.value)}
                placeholder="Your answer..."
                className="w-full h-20 p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
          data-testid="clarification-submit"
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Crafting your prompt roadmap...</span>
              </div>
              <span className="text-xs text-cyan-300/70">Usually takes 5-10 seconds</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Prompt Roadmap
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

