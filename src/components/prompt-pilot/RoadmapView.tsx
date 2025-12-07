"use client";

import React, { useState, useMemo, useCallback } from "react";
import { RefreshCw, Download, Check, Lightbulb, CheckCircle, Copy, Layers, ChevronsUpDown } from "lucide-react";
import { StageCard } from "./StageCard";
import { PromptRoadmapResponse } from "@/types/prompt-pilot";

interface RoadmapViewProps {
  roadmap: PromptRoadmapResponse;
  onReset: () => void;
}

export function RoadmapView({ roadmap, onReset }: RoadmapViewProps) {
  const [copiedType, setCopiedType] = useState<"markdown" | "prompts" | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    () => new Set(roadmap.stages.map((s) => s.id))
  );

  const totalPrompts = useMemo(() => {
    return roadmap.stages.reduce((acc, stage) => acc + stage.prompts.length, 0);
  }, [roadmap.stages]);

  const allExpanded = expandedStages.size === roadmap.stages.length;

  const toggleAllStages = useCallback(() => {
    if (allExpanded) {
      setExpandedStages(new Set());
    } else {
      setExpandedStages(new Set(roadmap.stages.map((s) => s.id)));
    }
  }, [allExpanded, roadmap.stages]);

  const toggleStage = useCallback((stageId: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  }, []);

  const exportAsMarkdown = (): string => {
    let md = `# Prompt Roadmap\n\n`;

    md += `## Summary\n\n`;
    roadmap.summary.forEach((item) => {
      md += `- ${item}\n`;
    });
    md += `\n`;

    roadmap.stages.forEach((stage) => {
      md += `## Stage ${stage.index}: ${stage.name}\n\n`;
      md += `**Objective:** ${stage.objective}\n\n`;
      md += `**When to use:** ${stage.whenToUse}\n\n`;
      md += `### Prompts\n\n`;
      stage.prompts.forEach((prompt, idx) => {
        md += `#### ${idx + 1}. ${prompt.title}\n\n`;
        md += "```\n";
        md += `${prompt.text}\n`;
        md += "```\n\n";
      });
    });

    md += `## Tips for Use\n\n`;
    roadmap.tips.forEach((tip, idx) => {
      md += `${idx + 1}. ${tip}\n`;
    });

    return md;
  };

  const exportPromptsOnly = (): string => {
    let text = "";
    roadmap.stages.forEach((stage) => {
      text += `=== STAGE ${stage.index}: ${stage.name.toUpperCase()} ===\n\n`;
      stage.prompts.forEach((prompt, idx) => {
        text += `[${idx + 1}] ${prompt.title}\n`;
        text += `${prompt.text}\n\n`;
      });
    });
    return text.trim();
  };

  const handleCopy = async (type: "markdown" | "prompts") => {
    console.log(`[PromptPilot] Copying ${type}...`);
    const text = type === "markdown" ? exportAsMarkdown() : exportPromptsOnly();
    console.log(`[PromptPilot] Generated text length: ${text.length} characters`);
    
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          setCopiedType(type);
          setTimeout(() => setCopiedType(null), 2000);
          return;
        } catch (clipboardError) {
          console.warn("Clipboard API failed, trying fallback:", clipboardError);
          // Fall through to fallback
        }
      }
      
      // Fallback method for older browsers or when clipboard API fails
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      
      // Select and copy
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length); // For mobile devices
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 2000);
      } else {
        throw new Error("execCommand('copy') returned false");
      }
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      
      // Last resort: show text in a modal or alert for manual copy
      const shouldShowFallback = window.confirm(
        "Unable to copy automatically. Would you like to see the text to copy manually?"
      );
      
      if (shouldShowFallback) {
        const textWindow = window.open("", "_blank");
        if (textWindow) {
          textWindow.document.write(`<pre style="padding: 20px; font-family: monospace; white-space: pre-wrap;">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`);
          textWindow.document.close();
        }
      }
    }
  };

  return (
    <div className="space-y-6" data-testid="roadmap-view">
      {/* Stats Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Start Over
          </button>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Layers className="w-4 h-4" />
            <span>{roadmap.stages.length} stages</span>
            <span className="text-slate-600">•</span>
            <span>{totalPrompts} prompts</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy("prompts")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              copiedType === "prompts"
                ? "bg-green-500/20 text-green-400"
                : "bg-slate-800 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400"
            }`}
          >
            {copiedType === "prompts" ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Prompts
              </>
            )}
          </button>
          <button
            onClick={() => handleCopy("markdown")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              copiedType === "markdown"
                ? "bg-green-500/20 text-green-400"
                : "bg-slate-800 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400"
            }`}
            data-testid="export-markdown"
          >
            {copiedType === "markdown" ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export MD
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-cyan-400" />
          Your Roadmap Summary
        </h2>
        <ul className="space-y-2">
          {roadmap.summary.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-300">
              <span className="text-cyan-400 mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-400">Stages</h2>
          <button
            onClick={toggleAllStages}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            {allExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>
        {roadmap.stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            isExpanded={expandedStages.has(stage.id)}
            onToggle={() => toggleStage(stage.id)}
          />
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          Tips for Using Your Roadmap
        </h2>
        <ol className="space-y-3">
          {roadmap.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-300">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {idx + 1}
              </span>
              {tip}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

