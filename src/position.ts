import { Color, Piece, PieceType, Square, Move, 
	 makeMove, moveFrom, moveTo, moveType, movePromo, parseSquare,
	 squareName } from './types';
import { Bitboard, BB_ZERO, setBit, lsb } from './bitboard'


// Implements the FEN notation 

const PIECE_CHAR = '.PNBRQKxxpnbrqk';

// Uppercase letters for white pieces
// Lowercase letters for black pieces
const CHAR_TO_PIECE: Record<string, Piece> = {
	'P': Piece.W_PAWN,
	'N': Piece.W_KNIGHT,
	'B': Piece.W_BISHOP,
	'R': Piece.W_ROOK,
	'Q': Piece.W_QUEEN,
	'K': Piece.W_KING,
	'p': Piece.B_PAWN,
	'n': Piece.B_KNIGHT,
	'b': Piece.B_BISHOP,
	'r': Piece.B_ROOK,
	'q': Piece.B_QUEEN,
	'k': Piece.B_KING,
}; 

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export const KIWIPETE_FEN = 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1';

export interface StateInfo {
	castlingRights: number;  // bitmask 1=K, 2=Q, 4=k, 8=q
	epSquare: number; // Square index of en passant target square, Square.NONE if not available
	rule50: number;
	captured: Piece;
	previous: StateInfo | null;
}

export class Position {
	board: Piece[] = new Array(64).fill(Piece.NONE);
	byTypeBB: Bitboard[] = new Array(7).fill(BB_ZERO); // Indexes by PieceType
	byColorBB: Bitboard[] = new Array(2).fill(BB_ZERO); // INdexes by Color
	sideToMove: Color = Color.WHITE;
	gamePly: number = 0;
	state: StateInfo = {
		castlingRights: 0,
		epSquare: Square.NONE,
		rule50: 0,
		captured: Piece.NONE,
		previous: null
	};
	pieceOn(sq: number): Piece { return this.board[sq]; }
	colorOf(p: Piece): Color { return p >= 9 ? Color.BLACK : Color.WHITE; } 
	typeOf(p: Piece): PieceType {
		if (p === Piece.NONE) return PieceType.NONE;
		return (p >= 9 ? p - 8 : p) as PieceType;
	}
	private updateBitboards(): void {
		this.byTypeBB.fill(BB_ZERO);
		this.byColorBB.fill(BB_ZERO);
		for (let sq = 0; sq < 64; sq++) {
			const p = this.board[sq];
			if (p !== Piece.NONE) {
				const color = this.colorOf(p);
				const type = this.typeOf(p);
				this.byTypeBB[type] = setBit(this.byTypeBB[type], sq);
				this.byColorBB[color] = setBit(this.byColorBB[color], sq)
			}
		}
	}
	pieces(type: PieceType): Bitboard {
		return this.byTypeBB[type];
	}
	piecesOf(color: Color): Bitboard {
		return this.byColorBB[color];
	}
	piecesOfType(color: Color, type: PieceType) : Bitboard {
		return this.byColorBB[color] & this.byTypeBB[type];
	}
	occupied(): Bitboard {
		return this.byColorBB[0] | this.byColorBB[1];
	}
	kingSquare(color: Color): number {
		const kingBB = this.piecesOfType(color, PieceType.KING);
		return lsb(kingBB);
	}
	setFen(fen: string): void {
		const parts = fen.split(/\s+/);
		this.board.fill(Piece.NONE);
		// We start with a8 
		let sq = 56; 
		for (const ch of parts[0]) {
			if (ch === '/') {
				sq -= 16; // We go down one row (8 from the current row and 8 for another row)
			} else if (ch >= '1' && ch <= '8') {
				sq += parseInt(ch, 10);
			} else {
				this.board[sq] = CHAR_TO_PIECE[ch] ?? Piece.NONE;
				sq++;
			}
		}


		this.sideToMove = parts[1] === 'w' ? Color.WHITE : Color.BLACK;

		this.state.castlingRights = 0;
		if (parts[2].includes('K')) this.state.castlingRights |= 0b0001;
		if (parts[2].includes('Q')) this.state.castlingRights |= 0b0010;
		if (parts[2].includes('k')) this.state.castlingRights |= 0b0100;
		if (parts[2].includes('q')) this.state.castlingRights |= 0b1000;

		if (parts[3] === '-') {
			this.state.epSquare = Square.NONE;
		} else {
			this.state.epSquare = parseSquare(parts[3]);	
		}

		this.state.rule50 = parseInt(parts[4], 10) || 0;
		this.gamePly = ((parseInt(parts[5], 10) || 1) - 1) * 2 + (this.sideToMove === Color.BLACK ? 1 : 0);
		this.updateBitboards();
	}

	fen(): string {
		let s = '';
		for (let rank = 7; rank >= 0; rank--) {
			let empty = 0;
			for (let file = 0; file < 8; file++) {
				const p = this.board[rank * 8 + file];
				if (p === Piece.NONE) {
					empty++;
				} else {
					if (empty > 0) {
						s += empty;
						empty = 0;
					}
					s += PIECE_CHAR[p];
				}
			}
			if (empty > 0) s += empty;
			if (rank > 0) s += '/';
		}
		s += ' ' + (this.sideToMove === Color.WHITE ? 'w' : 'b');
		let castling = '';
		if (this.state.castlingRights & 0b0001) castling += 'K';
		if (this.state.castlingRights & 0b0010) castling += 'Q';
		if (this.state.castlingRights & 0b0100) castling += 'k';
		if (this.state.castlingRights & 0b1000) castling += 'q';
		s += ' ' + (castling || '-');
		s += ' ' + (this.state.epSquare !== Square.NONE ? squareName(this.state.epSquare) : '-');
		s += ' ' + this.state.rule50;
		s += ' ' + (Math.floor(this.gamePly / 2) + 1);
		return s;
	}

	display(): string {
		let s = '\n +---+---+---+---+---+---+---+---+\n';
		for (let rank = 7; rank >=0; rank--) {
			s += `${rank + 1}`;
			for (let file = 0; file < 8; file++) {
				const p = this.board[rank * 8 + file];
				s += `| ${PIECE_CHAR[p]} `;
			}
			s += '|\n +---+---+---+---+---+---+---+---+\n';
		}
		s += '   a   b   c   d   e   f   g   h\n\n\n';
		s += `FEN: ${this.fen()}\n`;
		return s;
	}

}
