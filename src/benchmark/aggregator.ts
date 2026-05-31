import { PuzzleEvaluation, RatingBracket, ThemeResult } from "./types.js";

const RATING_BRACKETS: { label: string; min: number; max: number }[] = [
  { label: "<1000", min: 0, max: 999 },
  { label: "1000-1500", min: 1000, max: 1500 },
  { label: "1500-2000", min: 1501, max: 2000 },
  { label: "2000-2500", min: 2001, max: 2500 },
  { label: "2500+", min: 2501, max: Infinity },
];

export function aggregateByRatingBracket(evaluations: PuzzleEvaluation[]): RatingBracket[] {
  return RATING_BRACKETS.map((bracket) => {
    const inBracket = evaluations.filter(
      (e) => e.rating >= bracket.min && e.rating <= bracket.max,
    );
    return {
      label: bracket.label,
      min: bracket.min,
      max: bracket.max === Infinity ? 9999 : bracket.max,
      total: inBracket.length,
      correct: inBracket.filter((e) => e.correct).length,
    };
  }).filter((b) => b.total > 0);
}

export function aggregateByTheme(evaluations: PuzzleEvaluation[]): ThemeResult[] {
  const themeMap = new Map<string, { total: number; correct: number }>();
  for (const eval_ of evaluations) {
    for (const theme of eval_.themes) {
      const existing = themeMap.get(theme) ?? { total: 0, correct: 0 };
      existing.total++;
      if (eval_.correct) existing.correct++;
      themeMap.set(theme, existing);
    }
  }

  return Array.from(themeMap.entries())
    .map(([theme, data]) => ({ theme, ...data }))
    .sort((a, b) => b.total - a.total);
}
