import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

import { Position, START_FEN, KIWIPETE_FEN } from '../src/position';
import { perft } from '../src/movegen';

describe('perft - Initial Position', () => {
	it('returns 1 for depth 0', () => {
		const pos = new Position();
		pos.setFen(START_FEN);
		assert.equal(perft(pos, 0), 1);
	});
	it('returns 20 for depth 1', () => {
		const pos = new Position();
		pos.setFen(START_FEN);
		assert.equal(perft(pos, 1), 20);
	});
	it('returns 400 for depth 2', () => {
		const pos = new Position();
		pos.setFen(START_FEN);
		assert.equal(perft(pos, 2), 400);
	});
	it('returns 8092 for depth 3', () => {
		const pos = new Position();
		pos.setFen(START_FEN);
		assert.equal(perft(pos, 3), 8902);
	});
	it('perft(4) = 197281', () => {
		const pos = new Position();
		pos.setFen(START_FEN);
		assert.equal(perft(pos, 4), 197281);
	});
});

describe('perft - Kiwipete Position', () => {
	it('returns 48 for depth 1', () => {
		const pos = new Position();
		pos.setFen(KIWIPETE_FEN);
		assert.equal(perft(pos, 1), 48);
	});
	it('returns 2039 for depth 2', () => {
		const pos = new Position();
		pos.setFen(KIWIPETE_FEN);
		assert.equal(perft(pos, 2), 2039);
	});
	it('returns 97862 for depth 3', () => {
		const pos = new Position();
		pos.setFen(KIWIPETE_FEN);
		assert.equal(perft(pos, 3), 97862);
	});
})
