import {
	Color, PieceType, Move, makeMove,
	squareName, parseSquare
} from './types';
import {
	Bitboard, BB_ZERO, BB_ALL, 
	BB_RANK_2, BB_RANK_7, BB_RANK_3, BB_RANK_6, 
	BB_FILE_A, BB_FILE_H,
	squareBB, popcount, popLsb, testBit,
	shiftN, shiftS, shiftE, shiftW,
	shiftNE, shiftNW, shiftSE, shiftSW,
	KNIGHT_ATTACKS, KING_ATTACKS, PAWN_ATTACKS, 
	rookAttacks, bishopAttacks, queenAttacks
} from './bitboard';
import { Position } from './position';

export function generatePseudoLegalMoves(pos: Position): Move[] {
	const moves: Move[] = [];
	const us = pos.sideToMove;
	const them = 1 - us;
	const ourPieces = pos.piecesOf(us);
	const theirPieces = pos.piecesOf(them);
	const occupied = ourPieces | theirPieces;
	const empty = ~occupied & BB_ALL;

	generatePawnMoves(pos, us, empty, theirPieces, moves);
	generatePieceMoves(pos, us, PieceType.KNIGHT, occupied, ourPieces, moves);
	generatePieceMoves(pos, us, PieceType.BISHOP, occupied, ourPieces, moves);
	generatePieceMoves(pos, us, PieceType.ROOK, occupied, ourPieces, moves);
	generatePieceMoves(pos, us, PieceType.QUEEN, occupied, ourPieces, moves);
	generateKingMoves(pos, us, occupied, ourPieces, moves);
	generateCastling(pos, us, occupied, moves);
	return moves;
}

function generatePawnMoves(
	pos: Position,
	us: Color,
	empty: Bitboard,
	enemies: Bitboard,
	moves: Move[]
) {
	const pawns = pos.piecesOfType(us, PieceType.PAWN);
	const rank7 = us === Color.WHITE ? BB_RANK_7 : BB_RANK_2;
	const rank3 = us === Color.WHITE ? BB_RANK_3 : BB_RANK_6; 
	const forward = us === Color.WHITE ? shiftN : shiftS;
	const forwardLeft = us === Color.WHITE ? shiftNW : shiftSW;
	const forwardRight = us === Color.WHITE ? shiftNE : shiftSE;
	const backDir = us === Color.WHITE ? -8 : 8;
	const promoPawns = pawns & rank7;
	const normalPawns = pawns & ~rank7;

	// Simple forward 
	let singlePush = forward(normalPawns) & empty;
	let doublePush = forward(singlePush & rank3) & empty;
	let bb = { value: singlePush };
	while (bb.value !== 0n) {
		const to = popLsb(bb);
		moves.push(makeMove(to + backDir, to));
	}
	bb = { value: doublePush };
	while (bb.value !== 0n) {
		const to = popLsb(bb);
		moves.push(makeMove(to + 2 * backDir, to));
	}

	// Captures
	let captL = forwardLeft(pawns) & enemies;
	let captR = forwardRight(pawns) & enemies;
	bb = { value: captL };
	while (bb.value !== 0n) {
		const to = popLsb(bb);
		const fromOffset = us === Color.WHITE ? -7 : 7;
		moves.push(makeMove(to + fromOffset, to));
	}
	bb = { value: captR };
	while (bb.value !== 0n) {
		const to = popLsb(bb);
		const fromOffset = us === Color.WHITE ? -9 : 9;
		moves.push(makeMove(to + fromOffset, to));
	}

	// Promotions
	if (promoPawns !== 0n) {
		let promoForward = forward(promoPawns) & empty;
		let promoL = forwardLeft(promoPawns) & enemies;
		let promoR = forwardRight(promoPawns) & enemies;
		const addPromos = (toBB: Bitboard, fromDelta: number) => {
			const ref = { value: toBB };
			while (ref.value !== 0n) {
				const to = popLsb(ref);
				moves.push(makeMove(to + fromDelta, to, 1, 3)); // Queen promotion
				moves.push(makeMove(to + fromDelta, to, 1, 2)); // Rook promotion
				moves.push(makeMove(to + fromDelta, to, 1, 1)); // Bishop promotion
				moves.push(makeMove(to + fromDelta, to, 1, 0)); // Knight promotion
			}
		};
		addPromos(promoForward, backDir);
		addPromos(promoL, us === Color.WHITE ? -7 : 7);
		addPromos(promoR, us === Color.WHITE ? -9 : 9);
	}

	// En passant
	if (pos.state.epSquare !== 64) {
		const epBB = squareBB(pos.state.epSquare);
		const epCapturers = PAWN_ATTACKS[1 - us][pos.state.epSquare] & pawns;
		const ref = { value: epCapturers };
		while (ref.value !== 0n) {
			const from = popLsb(ref);
			moves.push(makeMove(from, pos.state.epSquare, 2));
		}
	}
}

function getAttacks(
	type: PieceType, sq: number, occupied: Bitboard
): Bitboard {
	switch (type) {
		case PieceType.KNIGHT: return KNIGHT_ATTACKS[sq];
		case PieceType.KING: return KING_ATTACKS[sq];
		case PieceType.BISHOP: return bishopAttacks(sq, occupied);
		case PieceType.ROOK: return rookAttacks(sq, occupied);
		case PieceType.QUEEN: return queenAttacks(sq, occupied);
		default: return BB_ZERO;
	}
}

function generatePieceMoves(
	pos: Position,
	us: Color,
	type: PieceType,
	occupied: Bitboard,
	ourPieces: Bitboard,
	moves: Move[]
): void {
	const pieces = { value: pos.piecesOfType(us, type) };
	while (pieces.value !== 0n) {
		const from = popLsb(pieces);
		const attacks = getAttacks(type, from, occupied) & ~ourPieces;
		let ref = { value: attacks };
		while (ref.value !== 0n) {
			const to = popLsb(ref);
			moves.push(makeMove(from, to));
		}
	}
}

function generateKingMoves(
	pos: Position,
	us: Color,
	occupied: Bitboard,
	ourPieces: Bitboard,
	moves: Move[]
): void {
	const kingSq = pos.kingSquare(us);
	const attacks = KING_ATTACKS[kingSq] & ~ourPieces;
	let ref = { value: attacks };
	while (ref.value !== 0n) {
		const to = popLsb(ref);
		moves.push(makeMove(kingSq, to));
	}
}

function generateCastling(
	pos: Position,
	us: Color,
	occupied: Bitboard,
	moves: Move[]
): void {
	const rank = us === Color.WHITE ? 0 : 56;
	const kingSq = rank + 4;
	// Small castling
	const kSideRight = us === Color.WHITE ? 1 : 4;
	if (pos.state.castlingRights & kSideRight) {
		const f = rank + 5;
		const g = rank + 6;
		if (!testBit(occupied, f) && !testBit(occupied, g)) {
			moves.push(makeMove(kingSq, g, 3));
		}
	}
	// Big castling
	const qSideRight = us === Color.WHITE ? 2 : 8;
	if (pos.state.castlingRights & qSideRight) {
		const d = rank + 3;
		const c = rank + 2;
		const b = rank + 1;
		if (!testBit(occupied, d) && !testBit(occupied, c) && !testBit(occupied, b)) {
			moves.push(makeMove(kingSq, c, 3));
		}
	}
}

export function moveToUCI(m: Move): string {
	const from = squareName(m & 0b111111);
	const to = squareName((m >> 6) & 0b111111);
	const type = (m >> 12) & 0b11;
	const promo = (m >> 14) & 0b11;
	let s = from + to;
	if (type === 1) {
		s += 'nbrq'[promo];
	}
	return s;
}

export function perft(pos: Position, depth: number): number {
	if (depth === 0) return 1;
	const moves = generatePseudoLegalMoves(pos);
	let nodes = 0;
	for (const move of moves) {
		if (depth === 1) {
			nodes++;
		}
	}
	return nodes;
}
