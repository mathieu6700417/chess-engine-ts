export enum Color {
	WHITE,
	BLACK
}

export enum PieceType {
	NONE, 
	PAWN, 
	KNIGHT,
	BISHOP,
	ROOK,
	QUEEN,
	KING
}

export enum Piece {
	NONE,
	W_PAWN, 
	W_KNIGHT,
	W_BISHOP,
	W_ROOK,
	W_QUEEN,
	W_KING,
	B_PAWN = 9, 
	B_KNIGHT,
	B_BISHOP,
	B_ROOK,
	B_QUEEN,
	B_KING
}

export type Move = number;
export enum Square {
	A1, B1, C1, D1, E1, F1, G1, H1,
	A2, B2, C2, D2, E2, F2, G2, H2,
	A3, B3, C3, D3, E3, F3, G3, H3,
	A4, B4, C4, D4, E4, F4, G4, H4,
	A5, B5, C5, D5, E5, F5, G5, H5,
	A6, B6, C6, D6, E6, F6, G6, H6,
	A7, B7, C7, D7, E7, F7, G7, H7,
	A8, B8, C8, D8, E8, F8, G8, H8,
	NONE
}
// Un coup est représenté par un entier de 16 bits :
// - les 6 premiers bits représentent la case de départ (0-63)
// - les 6 suivants représentent la case d'arrivée (0-63)
// - les 2 suivants représentent le type de coup (0 = normal, 1 = promotion, 2 = en passant, 3 = roque)
// - les 2 derniers représentent la pièce de promotion (0 = cavalier, 1 = fou, 2 = tour, 3 = dame)
//
export function makeMove(from: number, to: number, type = 0, promo = 0): Move {
	return from | (to << 6) | (type << 12) | (promo << 14);
}

export function moveFrom(move: Move): number {
	return move & 0b111111;
}

export function moveTo(move: Move): number {
	return (move >> 6) & 0b111111;
}

export function moveType(move: Move): number {
	return (move >> 12) & 0b11;
}

export function movePromo(move: Move): number {
	return (move >> 14) & 0b11;
}

export function squareName(sq: number): string {
	const col = String.fromCharCode('a'.charCodeAt(0) + (sq & 0b111));
	const row = String.fromCharCode('1'.charCodeAt(0) + (sq >> 3));
	return col + row;
}

export function parseSquare(s: string): number {
	const col = s.charCodeAt(0) - 'a'.charCodeAt(0);
	const row = s.charCodeAt(1) - '1'.charCodeAt(0);
	return col + row * 8;
}
