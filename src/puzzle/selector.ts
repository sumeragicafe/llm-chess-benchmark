import { BUNDLED_PUZZLES } from "./bundled.js";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function selectPuzzles(options: {
  count: number;
  minRating?: number;
  maxRating?: number;
  themes?: string[];
  seed?: number;
}): typeof BUNDLED_PUZZLES[number][] {
  let candidates = BUNDLED_PUZZLES.filter((p) => {
    if (options.minRating && p.rating < options.minRating) return false;
    if (options.maxRating && p.rating > options.maxRating) return false;
    if (options.themes && options.themes.length > 0) {
      return options.themes.every((t) => (p.themes as readonly string[]).includes(t));
    }
    return true;
  });

  const rng = options.seed != null ? seededRandom(options.seed) : Math.random;
  candidates = shuffle(candidates, rng);

  return candidates.slice(0, options.count);
}
