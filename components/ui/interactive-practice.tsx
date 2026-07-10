"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, HelpCircle } from "lucide-react";
import type { PracticeQuiz } from "@/types";

interface InteractivePracticeProps {
  quiz: PracticeQuiz;
  showDe?: boolean;
  showEn?: boolean;
}

export function InteractivePractice({ quiz, showDe = true, showEn = true }: InteractivePracticeProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [shakeKey, setShakeKey] = useState(0); // Used to re-trigger shake animation

  // Split prompt by ___
  const parts = quiz.prompt.split("___");

  const checkAnswer = () => {
    if (!value.trim()) return;

    const isCorrect = value.toLowerCase().trim() === quiz.answer.toLowerCase().trim();
    if (isCorrect) {
      setStatus("success");
    } else {
      setStatus("error");
      setShakeKey((prev) => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
    // Clear error state on typing
    if (status === "error") {
      setStatus("idle");
    }
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-6 sm:p-8 border border-[var(--color-border-subtle)] my-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-5 h-5 text-[var(--color-theme)]" />
        <h3 className="font-semibold text-[var(--color-text)]">
          {!showEn ? "Übung: Lückentext" : "Practice: Gap-Fill"}
        </h3>
      </div>

      {showDe && (
        <motion.div
          key={shakeKey}
          animate={
            status === "error"
              ? { x: [-5, 5, -5, 5, 0] }
              : {}
          }
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center gap-x-2 gap-y-4 text-lg font-medium text-[var(--color-text)] mb-8"
        >
          {parts.map((part, i) => (
            <span key={i} className="flex items-center gap-2">
              <span>{part}</span>
              {i < parts.length - 1 && (
                <div className="relative">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={status === "success"}
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck="false"
                    className={`w-32 px-3 py-1.5 text-center bg-transparent border-b-2 outline-none transition-all ${
                      status === "success"
                        ? "border-green-500 text-green-500 disabled:opacity-100"
                        : status === "error"
                        ? "border-red-500 text-red-500 focus:border-red-400"
                        : "border-[var(--color-border)] focus:border-[var(--color-accent)] text-[var(--color-accent)]"
                    }`}
                  />
                </div>
              )}
            </span>
          ))}
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <AnimatePresence mode="wait">
          {status === "success" && (quiz.explanation || quiz.explanationDe) ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-start gap-2 text-sm text-green-400/90 max-w-md ${showDe ? '' : 'text-base text-green-500'}`}
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                {!showEn && quiz.explanationDe 
                  ? quiz.explanationDe 
                  : (showEn ? quiz.explanation : null)}
              </span>
            </motion.div>
          ) : status === "error" ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-red-400/90"
            >
              <XCircle className="w-4 h-4" />
              <span>{!showEn ? "Versuche es nochmal! Achte auf die Groß- und Kleinschreibung." : "Try again! Pay attention to the case."}</span>
            </motion.div>
          ) : (
            <div /> // Spacer
          )}
        </AnimatePresence>

        <button
          onClick={checkAnswer}
          disabled={status === "success" || !value.trim()}
          className="ml-auto px-6 py-2 rounded-lg bg-[var(--color-text)] text-[var(--color-bg)] font-bold text-sm hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center gap-2"
        >
          {!showEn ? "Prüfen" : "Check"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
