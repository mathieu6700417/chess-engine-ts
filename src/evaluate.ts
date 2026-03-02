import { Color, PieceType } from "./types";
import { Position } from './position';
import { popcount, popLsb, BB_ZERO } from './bitboard'

const PIECE_VALUE: number[] = [
	0, // NONE
	100, // PAWN
	320, // KNIGHT
	330, // BISHOP
	500, // ROOK
	900, // QUEEN
	0,   // KING (infinite value)
];

// Piece Square Tables 
const PAWN_PST: number[] = [
	0, 0, 0, 0, 0, 0, 0, 0,
	50, 50, 50, 50, 50, 50, 50, 50,
	10, 10, 20, 30, 30, 20, 10, 10,
	5, 5, 10, 25, 25, 10, 5, 5,
	0, 0, 0, 20, 20, 0, 0, 0,
	5, -5, -10, 0, 0, -10, -5, 5,
	5, 10, 10, -20, -20, 10, 10, 5,
	0, 0, 0, 0, 0, 0, 0, 0
];

const KNIGHT_PST: number[] = [
	-50, -40, -30, -30, -30, -30, -40, -50,
	-40, -20, 0, 5, 5, 0, -20, -40,
	-30, 5, 10, 15, 15, 10, 5, -30,
	-30, 0, 15, 20, 20, 15, 0, -30,
	-30, 5, 15, 20, 20, 15, 5, -30,
	-40, -20, 0, 0, 0, 0, -20, -40,
	-50, -40, -30, -30, -30, -30, -40, -50,
]

const BISHOP_PST: number[] = [
	-20, -10, -10, -10, -10, -10, -10, -20,
	-10, 0, 0, 0, 0, 0, 0, -10,
	-10, 0, 10, 10, 10, 10, 0, -10,
	-10, 5, 5, 10, 10, 5, 5, -10,
	-10, 0, 5, 10, 10, 5, 0, -10,
	-10, 10, 10, 10, 10, 10, 10, -10,
	-10, 5, 0, 0, 0, 0, 5, -10,
	-20, -10, -10, -10, -10, -10, -10, -20
]

const ROOK_PST: number[] = [
	0, 0, 0, 0, 0, 0, 0, 0,
	5, 10, 10, 10, 10, 10, 10, 5,
	-5, 0, 0, 0, 0, 0, 0, -5,
	-5, 0, 0, 0, 0, 0, 0, -5,
	-5, 0, 0, 0, 0, 0, 0, -5,
	-5, 0, 0, 0, 0, 0, 0, -5,
	-5, 0, 0, 0, 0, 0, 0, -5,
	0, 0, 0, 5, 5, 0, 0, 0
]

const QUEEN_PST: number[] = [
	-20, -10, -10, -5, -5, -10, -10, -20,
	-10, 0, 0, 0, 0, 0, 0, -10,
	-10, 0, 5, 5, 5, 5, 0, -10,
	-5, 0, 5, 5, 5, 5, 0, -5,
	0, 0, 5, 5, 5, 5, 0, -5,
	-10, 5, 5, 5, 5, 5, 0, -10,
	-10, 0, 5, 0, 0, 0, 0, -10,
	-20, -10, -10, -5, -5, -10, -10, -20
];

const KING_PST_MIDDLEGAME: number[] = [
	-30, -40, -40, -50, -50, -40, -40, -30,
	-30, -40, -40, -50, -50, -40, -40, -30,
	-30, -40, -40, -50, -50, -40, -40, -30,
	-30, -40, -40, -50, -50, -40, -40, -30,
	-20, -30, -30, -40, -40, -30, -30, -20,
	-10, -20, -20, -20, -20, -20, -20, -10,
	 20,  20,   0, 0, 0, 0, 20, 20,
	 20,  30, 10, 0, 0, 10, 30, 20
];

const PST: number[][] = [
	[],
	PAWN_PST,
	KNIGHT_PST,
	BISHOP_PST,
	ROOK_PST,
	QUEEN_PST,
	KING_PST_MIDDLEGAME,
];

export function evaluate(pos: Position): number {
	let score = 0;
	for (let sq = 0; sq < 64; sq++) {
		const piece = pos.pieceOn(sq)
		if (piece === 0) continue;
		const color = pos.colorOf(piece);
		const type = pos.typeOf(piece);

		let value = PIECE_VALUE[type];
		const pstIndex = color === Color.WHITE ? sq : sq ^ 56;
		value += PST[type][pstIndex];
		score += color === Color.WHITE ? value : -value;

	}
	// BOnus for pair of bishops
	if (popcount(pos.piecesOfType(Color.WHITE, PieceType.BISHOP)) >= 2) {
		score += 30;
	}
	if (popcount(pos.piecesOfType(Color.BLACK, PieceType.BISHOP)) >= 2) {
		score -= 30;
	}

	return pos.sideToMove === Color.WHITE ? score : -score;
}
