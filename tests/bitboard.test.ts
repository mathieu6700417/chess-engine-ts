import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { popcount, lsb, popLsb, squareBB, 
	BB_ZERO, BB_ALL, BB_RANK_1, BB_RANK_2,
	KNIGHT_ATTACKS, bbToString
} from '../src/bitboard'

describe('popcount', () => {
	it('returns 0 for an empty bitboard', () => {
		assert.equal(popcount(0n), 0);
	});
	it('returns 1 for one bit', () => {
		assert.equal(popcount(1n), 1);
	});
	it('returns 8 for one full row', () => {
		assert.equal(popcount(BB_RANK_1), 8);
	});
	it('returns 64 for one full bitboard', () => {
		assert.equal(popcount(BB_ALL), 64);
	});
});

describe('lsb', () => {
	it('returns 0 for the weakest bit', () => {
		assert.equal(lsb(1n), 0);
	});
	it('returns 8 for the second row', () => {
		assert.equal(lsb(BB_RANK_2), 8);
	});
	it('returns the index for an square', () => {
		assert.equal(lsb(squareBB(29)), 29);
	})
});

describe('popLsb', () => {
	it('extracts the LSB and removes it from the billboard', () => {
		const ref = { value: BB_RANK_1 };
		const first = popLsb(ref);
		assert.equal(first, 0);
		assert.equal(popcount(ref.value), 7);
	})
})

describe('Knight attacks', () => {
	it('has 8 attacks from the center', () => {
		assert.equal(popcount(KNIGHT_ATTACKS[28]), 8);
	});
	it('has 2 attacks from a corner', () => {
		assert.equal(popcount(KNIGHT_ATTACKS[0]), 2);
	});
});
