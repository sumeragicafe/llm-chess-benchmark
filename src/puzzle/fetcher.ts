import { LichessPuzzleResponse } from "./types.js";

const LICHESS_API = "https://lichess.org/api";

export async function fetchPuzzleById(id: string): Promise<LichessPuzzleResponse> {
  const res = await fetch(`${LICHESS_API}/puzzle/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch puzzle ${id}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<LichessPuzzleResponse>;
}
