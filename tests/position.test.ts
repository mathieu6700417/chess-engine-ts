import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

import { Position, START_FEN } from '../src/position';
import { Color, Piece } from '../src/types';

describe('FEN Parser', () => {
	it('parse and generates the initial position', () => {
		const pos = new Position();
		pos.setFen(START_FEN);
		assert.equal(pos.fen(), START_FEN);
	});
	it('parse the position after 1.e4', () => {
		const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
		const pos = new Position();
		pos.setFen(fen);
		assert.equal(pos.fen(), fen);
		assert.equal(pos.sideToMove, Color.BLACK);
		assert.equal(pos.pieceOn(0), Piece.W_ROOK); // a1
		assert.equal(pos.pieceOn(4), Piece.W_KING); // e1
		assert.equal(pos.pieceOn(63), Piece.B_ROOK); // h8
		assert.equal(pos.pieceOn(32), Piece.NONE); // a5
	});
})
