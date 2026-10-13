export type VisualPolicy = { motion: boolean; parallax: boolean; particles: number; fps: number; pixelRatio: number };
export function visualPolicy({ reducedMotion = false, saveData = false, coarse = false, memory = 8 }: { reducedMotion?: boolean; saveData?: boolean; coarse?: boolean; memory?: number } = {}): VisualPolicy {
  if (reducedMotion || saveData) return { motion: false, parallax: false, particles: 0, fps: 0, pixelRatio: 1 };
  const modest = coarse || memory <= 4;
  return { motion: true, parallax: !modest, particles: modest ? 4 : 8, fps: modest ? 24 : 30, pixelRatio: modest ? 1 : 1.5 };
}
export function lumenMotion(seconds: number, reaction = 0) {
  const phase = ((seconds % 5.3) + 5.3) % 5.3;
  return { breathe: 1 + Math.sin(seconds * 1.8) * .012, bob: Math.sin(seconds * 1.1) * .026, yaw: Math.sin(seconds * .7) * .09 + reaction * .14, eyes: phase < .14 ? .08 + Math.abs(phase - .07) / .07 * .92 : 1 };
}
