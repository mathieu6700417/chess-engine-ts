export type Bitboard = bigint;

export const BB_ZERO: Bitboard = 0n;
export const BB_ALL: Bitboard = 0xffffffffffffffffn;

export const BB_RANK_1: Bitboard = 0x00000000000000ffn;
export const BB_RANK_2: Bitboard = 0x000000000000ff00n;
export const BB_RANK_3: Bitboard = 0x0000000000ff0000n;
export const BB_RANK_4: Bitboard = 0x00000000ff000000n;
export const BB_RANK_5: Bitboard = 0x000000ff00000000n;
export const BB_RANK_6: Bitboard = 0x0000ff0000000000n;
export const BB_RANK_7: Bitboard = 0x00ff000000000000n;
export const BB_RANK_8: Bitboard = 0xff00000000000000n;

export const BB_FILE_A: Bitboard = 0x0101010101010101n;
export const BB_FILE_B: Bitboard = 0x0202020202020202n;
export const BB_FILE_C: Bitboard = 0x0404040404040404n;
export const BB_FILE_D: Bitboard = 0x0808080808080808n;
export const BB_FILE_E: Bitboard = 0x1010101010101010n;
export const BB_FILE_F: Bitboard = 0x2020202020202020n;
export const BB_FILE_G: Bitboard = 0x4040404040404040n;
export const BB_FILE_H: Bitboard = 0x8080808080808080n;

export function squareBB(sq: number): Bitboard {
	return 1n << BigInt(sq);
}

export function testBit(bb: Bitboard, sq: number) {
	return (bb & squareBB(sq)) !== 0n;
}

export function setBit(bb: Bitboard, sq: number): Bitboard {
	return bb | squareBB(sq);
}

export function clearBit(bb: Bitboard, sq: number): Bitboard {
	return bb & ~squareBB(sq);
}

export function popcount(bb: Bitboard): number {
	let count = 0;
	let b = bb;
	while (b !== 0n) {
		b &= b - 1n; // We subtract one to one all the bits up to the weakest one and we and it to remove the weakest one
		count++;
	}
	return count;
}

// Least Significant Bit
export function lsb(bb: Bitboard): number {
	if (bb === 0n) return 64;
	let n = 0;
	let b = bb;
	// We go in halves
	if ((b & 0x00000000FFFFFFFFn) === 0n) { n+= 32; b >>= 32n; }
	if ((b & 0x000000000000FFFFn) === 0n) { n+= 16; b >>= 16n; }
	if ((b & 0x00000000000000FFn) === 0n) { n+= 8; b >>= 8n; }
	if ((b & 0x000000000000000Fn) === 0n) { n+= 4; b >>= 4n; }
	if ((b & 0x0000000000000003n) === 0n) { n+= 2; b >>= 2n; }
	if ((b & 0x0000000000000001n) === 0n) { n+= 1; }
	return n;
}

// Extracts the LSB from the bitboard and erases it
export function popLsb(bb: { value: Bitboard }): number {
	const sq = lsb(bb.value);
	bb.value &= bb.value - 1n; 
	return sq;
}

export function shiftN(bb: Bitboard): Bitboard {
	return bb << 8n;
}

export function shiftS(bb: Bitboard): Bitboard {
	return bb >> 8n;
}

export function shiftE(bb: Bitboard): Bitboard {
	return (bb << 1n) & ~BB_FILE_A; 
}

export function shiftW(bb: Bitboard): Bitboard {
	return (bb >> 1n) & ~BB_FILE_H; 
}

export function shiftNE(bb: Bitboard): Bitboard {
	return (bb << 9n) & ~BB_FILE_A; 
}

export function shiftNW(bb: Bitboard): Bitboard {
	return (bb << 7n) & ~BB_FILE_H; 
}

export function shiftSE(bb: Bitboard): Bitboard {
	return (bb >> 7n) & ~BB_FILE_A; 
}

export function shiftSW(bb: Bitboard): Bitboard {
	return (bb >> 9n) & ~BB_FILE_H; 
}

export function bbToString(bb: Bitboard): string {
	let s = '\n';
	for (let rank = 7; rank >= 0; rank--) {
		s += ` ${rank + 1} `;
		for (let file = 0; file < 8; file++) {
			s += testBit(bb, rank * 8 + file) ? ' 1' : ' .';
		}
		s += '\n';
	}
	s += '    a b c d e f g h\n';
	return s;
}

// Attack tables for non sliding pieces (knight, king, pawns)
export const KNIGHT_ATTACKS: Bitboard[] = new Array(64);
export const KING_ATTACKS: Bitboard[] = new Array(64);
export const PAWN_ATTACKS: Bitboard[][] = [ 
	new Array(64), // White
	new Array(64), // Black
]

function initAttackTables(): void {
	for (let sq = 0; sq < 64; sq++) {
		const bb = squareBB(sq);
		// KNIGHT 
		let n = BB_ZERO;
		n |= (bb << 17n) & ~BB_FILE_A; // N + N + E
		n |= (bb << 15n) & ~BB_FILE_H; // N + N + W
		n |= (bb << 10n) & ~(BB_FILE_A | BB_FILE_B); // N + E + E
		n |= (bb << 6n) & ~(BB_FILE_G | BB_FILE_H); // N + W + W
		n |= (bb >> 17n) & ~BB_FILE_H; // S + S + E
		n |= (bb >> 15n) & ~BB_FILE_A; // S + S + W
		n |= (bb >> 10n) & ~(BB_FILE_G | BB_FILE_H); // S + E + E
		n |= (bb >> 6n) & ~(BB_FILE_A | BB_FILE_B); // S + W + W
		KNIGHT_ATTACKS[sq] = n & BB_ALL; 
		// KING 
		let k = BB_ZERO;
		k |= shiftN(bb) | shiftS(bb) | shiftE(bb) | shiftW(bb);
		k |= shiftNE(bb) | shiftNW(bb) | shiftSE(bb) | shiftSW(bb);
		KING_ATTACKS[sq] = k & BB_ALL;
		// Pawn
		PAWN_ATTACKS[0][sq] = (shiftNE(bb) | shiftNW(bb)) & BB_ALL;
		PAWN_ATTACKS[1][sq] = (shiftSE(bb) | shiftSW(bb)) & BB_ALL;
	}
}

initAttackTables();

const ROOK_DIRS = [8, -8, 1, -1];
const BISHOP_DIRS = [9, 7, -9, -7];
export function slidingAttacks(
	sq: number, 
	occupied: Bitboard,
	dirs: number[]
): Bitboard {
	let attacks = BB_ZERO;
	for (const dir of dirs) {
		let s = sq;
		while (true) {
			const prev = s;
			s += dir;
			if (s < 0 || s > 63) break;
			// We look for the difference of files if more than 1, not good
			const fileDiff = Math.abs((s & 7) - (prev & 7));
			if (fileDiff > 1) break; // If we are outside the board
			attacks = setBit(attacks, s);
			if (testBit(occupied, s)) break;
		}
	}
	return attacks;
}

export function rookAttacks(sq: number, occ: Bitboard): Bitboard {
	return slidingAttacks(sq, occ, ROOK_DIRS);
}

export function bishopAttacks(sq: number, occ: Bitboard): Bitboard {
	return slidingAttacks(sq, occ, BISHOP_DIRS);
}

export function queenAttacks(sq: number, occ: Bitboard): Bitboard {
	return rookAttacks(sq, occ) | bishopAttacks(sq, occ)
}
