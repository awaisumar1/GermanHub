"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SyntaxPlayground } from "@/types";
import { Info } from "lucide-react";

interface InteractiveSyntaxProps {
  playground: SyntaxPlayground;
  showDe?: boolean;
  showEn?: boolean;
}

export function InteractiveSyntax({ playground, showDe = true, showEn = true }: InteractiveSyntaxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!showDe && !showEn) return null;

  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border-subtle)] my-6">
      {/* Tokens */}
      {showDe && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {playground.tokens.map((token, i) => {
            const isActive = activeIndex === i;
            const isClickable = token.isClickable;

            return (
              <button
                key={i}
                onClick={() => isClickable ? setActiveIndex(isActive ? null : i) : null}
                className={`px-2 py-1 rounded-md text-base transition-all ${
                  isClickable
                    ? isActive
                      ? "bg-[var(--color-accent)] text-white shadow-md font-bold scale-105"
                      : "bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-semibold hover:bg-[var(--color-accent)]/30 cursor-pointer"
                    : "text-[var(--color-text)] cursor-default"
                }`}
              >
                {token.word}
              </button>
            );
          })}
        </div>
      )}

      {/* Translation */}
      {showEn && (
        <p className={`text-sm text-[var(--color-text-muted)] italic mb-4 ${showDe ? '' : 'text-base not-italic text-[var(--color-text)]'}`}>
          "{playground.translation}"
        </p>
      )}

      {/* Role Explanation */}
      <div className="h-12 relative">
        <AnimatePresence mode="wait">
          {activeIndex !== null && playground.tokens[activeIndex]?.role ? (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0"
            >
              <div className="flex items-start gap-2 bg-[var(--color-bg-elevated)] p-3 rounded-lg border border-[var(--color-accent)]/30">
                <Info className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] block mb-0.5">
                    {!showEn ? "Grammatische Rolle" : "Grammatical Role"}
                  </span>
                  <span className="text-sm text-[var(--color-text)]">
                    {!showEn && playground.tokens[activeIndex].roleDe 
                      ? playground.tokens[activeIndex].roleDe 
                      : playground.tokens[activeIndex].role}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 right-0 text-xs text-[var(--color-text-dim)] flex items-center gap-1 h-full"
            >
              {!showEn ? "Klicke auf ein markiertes Wort, um seine Rolle zu sehen." : "Click a highlighted word to see its role."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
