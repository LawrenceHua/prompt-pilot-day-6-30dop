"use client";

import React, { useState } from "react";
import { Copy, Check, Target, ExternalLink } from "lucide-react";
import { PromptItem } from "@/types/prompt-pilot";

interface PromptCardProps {
  prompt: PromptItem;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  const openInChatGPT = () => {
    const encodedPrompt = encodeURIComponent(prompt.text);
    window.open(`https://chat.openai.com/?q=${encodedPrompt}`, "_blank");
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <h4 className="font-medium text-white text-sm">{prompt.title}</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={openInChatGPT}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
            title="Open in ChatGPT"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">ChatGPT</span>
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied
                ? "bg-green-500/20 text-green-400"
                : "bg-slate-700 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-mono bg-slate-900/50 p-3 rounded border border-slate-700/50">
        {prompt.text}
      </p>
    </div>
  );
}

