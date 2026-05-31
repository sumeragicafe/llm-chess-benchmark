import { Chess } from "chess.js";

const UCI_PATTERN = /\b([a-h][1-8][a-h][1-8][qrbn]?)\b/;
const SAN_PATTERN = /\b([KQRBNOo][a-hx1-8+#]{1,5}|[a-h]x?[a-h][1-8][+#]?|[a-h][1-8][+#]?)\b/;

export function parseMove(response: string, fen: string): string | null {
  const chess = new Chess(fen);
  const legalMoves = chess.moves({ verbose: true });

  const uciMatch = response.match(UCI_PATTERN);
  if (uciMatch) {
    const uci = uciMatch[1];
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length === 5 ? uci[4] : undefined;
    const legal = legalMoves.find(
      (m) => m.from === from && m.to === to && m.promotion === promotion,
    );
    if (legal) return `${from}${to}${promotion ?? ""}`;
  }

  const sanMatch = response.match(SAN_PATTERN);
  if (sanMatch) {
    const san = sanMatch[1];
    try {
      const move = chess.move(san);
      if (move) return `${move.from}${move.to}${move.promotion ?? ""}`;
    } catch {
      // not a legal SAN move
    }
  }

  return null;
}
