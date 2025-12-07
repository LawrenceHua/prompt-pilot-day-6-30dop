"use client";

import React from "react";
import { ChevronDown, ChevronUp, Clock, MessageSquare } from "lucide-react";
import { RoadmapStage } from "@/types/prompt-pilot";
import { PromptCard } from "./PromptCard";

interface StageCardProps {
  stage: RoadmapStage;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function StageCard({ stage, isExpanded = true, onToggle }: StageCardProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold">
            {stage.index}
          </span>
          <div>
            <h3 className="font-bold text-white">{stage.name}</h3>
            <p className="text-sm text-slate-400">{stage.objective}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
            <MessageSquare className="w-3 h-3" />
            {stage.prompts.length}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          <div className="flex items-start gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <span className="text-slate-400">{stage.whenToUse}</span>
          </div>

          <div className="space-y-3">
            {stage.prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

