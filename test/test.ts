import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseMove } from "../src/llm/parser.js";
import { parsePuzzleResponse } from "../src/puzzle/parser.js";
import { selectPuzzles } from "../src/puzzle/selector.js";
import { evaluateMove } from "../src/benchmark/evaluator.js";
import { aggregateByRatingBracket, aggregateByTheme } from "../src/benchmark/aggregator.js";
import type { Puzzle, LichessPuzzleResponse } from "../src/puzzle/types.js";

describe("move parser", () => {
  it("parses UCI move e2e4", () => {
    const result = parseMove("e2e4", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    assert.equal(result, "e2e4");
  });

  it("parses SAN move e4", () => {
    const result = parseMove("e4", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    assert.equal(result, "e2e4");
  });

  it("parses SAN knight move Nf3", () => {
    const result = parseMove("Nf3", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    assert.equal(result, "g1f3");
  });

  it("returns null for invalid move", () => {
    const result = parseMove("xyz", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    assert.equal(result, null);
  });

  it("returns null for illegal move", () => {
    const result = parseMove("e2e5", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    assert.equal(result, null);
  });
});

describe("puzzle parser", () => {
  it("parses a lichess response and applies opponent move", () => {
    const raw: LichessPuzzleResponse = {
      puzzle: {
        id: "test1",
        rating: 1500,
        plays: 100,
        solution: ["e7e5", "e2e4"],
        themes: ["fork", "middlegame"],
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
        lastMove: "e2e4",
      },
      game: { id: "testgame", pgn: "1. e4 e5" },
    };
    const puzzle = parsePuzzleResponse(raw);
    assert.equal(puzzle.id, "test1");
    assert.equal(puzzle.solutionMoves.length, 2);
    assert.ok(puzzle.playerFen !== puzzle.fen);
    assert.ok(puzzle.playerFen.includes("rnbqkbnr/pppp1ppp/8/4p3/4P3/8"));
  });
});

describe("puzzle selector", () => {
  it("returns correct count", () => {
    const puzzles = selectPuzzles({ count: 5, seed: 42 });
    assert.equal(puzzles.length, 5);
  });

  it("respects rating filter", () => {
    const puzzles = selectPuzzles({ count: 100, minRating: 2000, maxRating: 2500 });
    for (const p of puzzles) {
      assert.ok(p.rating >= 2000 && p.rating <= 2500);
    }
  });

  it("respects theme filter", () => {
    const puzzles = selectPuzzles({ count: 50, themes: ["fork"] });
    for (const p of puzzles) {
      assert.ok(p.themes.includes("fork"));
    }
  });

  it("is deterministic with seed", () => {
    const a = selectPuzzles({ count: 10, seed: 42 });
    const b = selectPuzzles({ count: 10, seed: 42 });
    assert.deepEqual(a.map((p) => p.id), b.map((p) => p.id));
  });
});

describe("evaluator", () => {
  it("marks correct moves", () => {
    const puzzle: Puzzle = {
      id: "test",
      fen: "test-fen",
      playerFen: "test-player-fen",
      solutionMoves: ["a1a2", "e2e4"],
      rating: 1500,
      ratingDeviation: 0,
      themes: ["fork"],
      gameUrl: "",
      lastMove: "a1a2",
    };
    const result = evaluateMove(puzzle, "e2e4", "e2e4");
    assert.equal(result.correct, true);
  });

  it("marks incorrect moves", () => {
    const puzzle: Puzzle = {
      id: "test",
      fen: "test-fen",
      playerFen: "test-player-fen",
      solutionMoves: ["a1a2", "e2e4"],
      rating: 1500,
      ratingDeviation: 0,
      themes: ["fork"],
      gameUrl: "",
      lastMove: "a1a2",
    };
    const result = evaluateMove(puzzle, "d2d4", "d2d4");
    assert.equal(result.correct, false);
  });
});

describe("aggregator", () => {
  it("groups by rating bracket", () => {
    const evals = [
      { rating: 800, correct: true, themes: ["fork"] } as any,
      { rating: 1200, correct: false, themes: ["pin"] } as any,
      { rating: 1800, correct: true, themes: ["fork"] } as any,
    ];
    const brackets = aggregateByRatingBracket(evals);
    assert.ok(brackets.length >= 2);
  });

  it("groups by theme", () => {
    const evals = [
      { rating: 1500, correct: true, themes: ["fork", "middlegame"] } as any,
      { rating: 1600, correct: false, themes: ["fork"] } as any,
    ];
    const themes = aggregateByTheme(evals);
    const fork = themes.find((t) => t.theme === "fork");
    assert.ok(fork);
    assert.equal(fork.total, 2);
    assert.equal(fork.correct, 1);
  });
});
