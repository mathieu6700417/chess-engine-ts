import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

import { Position, START_FEN, KIWIPETE_FEN } from '../src/position';
import { perft } from '../src/movegen';

describe('perft', () => {
	it('returns 1 for depth 0', () => {
		const pos = new Position();
		pos.setFen(START_FEN);
		assert.equal(perft(pos, 0), 1);
	});
	it('returns 20 for depth 1 with a regular start position', () => {
		const pos = new Position();
		pos.setFen(START_FEN);
		assert.equal(perft(pos, 1), 20);
	});
	it('returns 48 for depth 1 with kiwipete position', () => {
		const pos = new Position();
		pos.setFen(KIWIPETE_FEN);
		assert.equal(perft(pos, 1), 48);
	});
})
