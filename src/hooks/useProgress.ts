"use client";

import { useState, useEffect, useCallback } from "react";
import { skills } from "@/data/skills";
import { SkillState } from "@/types";
import { CHAPTER_COMPLETE_KEYS } from "@/data/storageKeys";

const STORAGE_KEY = "skillmap-progress";

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const progress: Set<string> = saved ? new Set(JSON.parse(saved)) : new Set();

      // Auto-detect in-game completions from each chapter's completion key
      for (const [chapterId, key] of Object.entries(CHAPTER_COMPLETE_KEYS)) {
        if (localStorage.getItem(key) === "1") progress.add(chapterId);
      }

      setCompleted(progress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...progress]));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const saveCompleted = useCallback((next: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // ignore
    }
  }, []);

  const getSkillState = useCallback(
    (skillId: string): SkillState => {
      if (!loaded) return "locked";
      if (completed.has(skillId)) return "completed";
      const skill = skills.find((s) => s.id === skillId);
      if (!skill) return "locked";
      const allPrereqsDone = skill.prerequisites.every((p) => completed.has(p));
      return allPrereqsDone ? "available" : "locked";
    },
    [completed, loaded]
  );

  const markCompleted = useCallback(
    (skillId: string) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        next.add(skillId);
        saveCompleted(next);
        return next;
      });
    },
    [saveCompleted]
  );

  const resetProgress = useCallback(() => {
    setCompleted(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const completedCount = completed.size;
  const totalCount = skills.length;

  return { getSkillState, markCompleted, resetProgress, completedCount, totalCount };
}
