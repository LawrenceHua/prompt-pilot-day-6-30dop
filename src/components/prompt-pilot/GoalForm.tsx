"use client";

import React, { useState } from "react";
import { ArrowRight, Loader2, Sparkles, Zap } from "lucide-react";
import { PromptPilotInput, UseCaseType, AISkillLevel, TimeHorizon } from "@/types/prompt-pilot";

interface GoalFormProps {
  initialValue?: PromptPilotInput;
  onSubmit: (input: PromptPilotInput) => void;
  isLoading?: boolean;
}

const useCaseOptions: { value: UseCaseType; label: string }[] = [
  { value: "learn_topic", label: "Learn a topic" },
  { value: "build_product", label: "Build a product/project" },
  { value: "solve_problem", label: "Solve a problem" },
  { value: "other", label: "Other" },
];

const skillLevelOptions: { value: AISkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner - New to AI tools" },
  { value: "intermediate", label: "Intermediate - Use AI regularly" },
  { value: "advanced", label: "Advanced - Power user" },
];

const timeHorizonOptions: { value: TimeHorizon; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "longer", label: "Longer term" },
];

const exampleGoals = [
  "Learn machine learning from scratch and build my first model",
  "Build a SaaS MVP and launch it in 2 weeks",
  "Improve my team's code review process",
];

export function GoalForm({ initialValue, onSubmit, isLoading }: GoalFormProps) {
  const [formData, setFormData] = useState<PromptPilotInput>(
    initialValue || {
      goalDescription: "",
      useCaseType: "build_product",
      aiSkillLevel: "intermediate",
      timeHorizon: "this_week",
      preferredTools: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.goalDescription.trim()) return;
    onSubmit(formData);
  };

  const charCount = formData.goalDescription.length;
  const isValidLength = charCount >= 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="goal-form">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-300">
              What do you want to accomplish? <span className="text-cyan-400">*</span>
            </label>
            <span className={`text-xs ${charCount >= 10 ? "text-cyan-400" : "text-slate-500"}`}>
              {charCount} characters
            </span>
          </div>
          <textarea
            value={formData.goalDescription}
            onChange={(e) => setFormData({ ...formData, goalDescription: e.target.value })}
            placeholder="Describe your goal, project, or problem. Be as messy or detailed as you like..."
            className="w-full h-32 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-cyan-500/50 transition-colors"
            required
          />
          {!formData.goalDescription && (
            <div className="mt-3">
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Quick start with an example:
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleGoals.map((example, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, goalDescription: example })}
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors border border-slate-700 hover:border-cyan-500/30"
                  >
                    {example.slice(0, 40)}...
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">What type of goal is this?</label>
          <select
            value={formData.useCaseType}
            onChange={(e) => setFormData({ ...formData, useCaseType: e.target.value as UseCaseType })}
            className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
          >
            {useCaseOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Your AI tool experience</label>
          <select
            value={formData.aiSkillLevel}
            onChange={(e) => setFormData({ ...formData, aiSkillLevel: e.target.value as AISkillLevel })}
            className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
          >
            {skillLevelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">When do you need this done?</label>
          <select
            value={formData.timeHorizon}
            onChange={(e) => setFormData({ ...formData, timeHorizon: e.target.value as TimeHorizon })}
            className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
          >
            {timeHorizonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Preferred AI tools <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.preferredTools || ""}
            onChange={(e) => setFormData({ ...formData, preferredTools: e.target.value })}
            placeholder="e.g., ChatGPT, Claude, Gemini, Cursor..."
            className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.goalDescription.trim()}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
        data-testid="goal-submit"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Questions...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Continue
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}

