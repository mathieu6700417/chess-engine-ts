import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { Position, START_FEN } from '../src/position';
import { evaluate } from '../src/evaluate';
describe('Evaluation', () => {
	const pos = new Position();
	it('la position initiale est proche de 0', () => {
		pos.setFen(START_FEN);
		const score = evaluate(pos);
		// Petit avantage blanc possible (PST), mais proche de 0
		assert.ok(Math.abs(score) < 50,`Score ${score} trop eloigne de 0`);
	});
	it('la position est symetrique pour les deux camps', () => {
		// Meme position, trait blanc vs trait noir
		pos.setFen(START_FEN);
		const whiteScore = evaluate(pos);
		pos.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1');
		const blackScore = evaluate(pos);
		// Les scores doivent etre opposes (meme position, camps inverses)
		assert.equal(whiteScore, -blackScore);
	});
	it('perdre un cavalier donne un score negatif', () => {
		pos.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKB1R w KQkq - 0 1');
		const score = evaluate(pos);
		// Blanc a perdu un cavalier (~320 cp)
		assert.ok(score < -250, `Score ${score} devrait etre < -250 (cavalier manquant)`);
	});
	it('avantage materiel donne un score positif', () => {
		// Noir sans dame
		pos.setFen('rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
		const score = evaluate(pos);
		assert.ok(score > 800,
		`Score ${score} devrait etre > 800 (dame noire manquante)`);
	});
});

