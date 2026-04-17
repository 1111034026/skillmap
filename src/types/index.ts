export interface Skill {
  id: string;
  title: string;
  description: string;
  detail: string;
  x: number; // pixel position on canvas
  y: number;
  prerequisites: string[];
  icon: string; // emoji
}

export type SkillState = "locked" | "available" | "completed";
