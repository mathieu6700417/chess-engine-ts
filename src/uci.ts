import * as readline from 'readline';
import { Position, START_FEN } from './position'

export class UCI {
	private rl: readline.Interface;
	pos: Position;
	constructor() {
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false,
		});
		this.pos = new Position()
	}
	send(msg: string): void {
		process.stdout.write(msg + '\n')
	}
	loop(): void {
		this.rl.on('line', (line: string) => {
			const tokens = line.trim().split(/\s+/);
			const cmd = tokens[0];
			switch (cmd) {
				case 'uci': 
					this.send('id name ChessEngineTS')
					this.send('id author MatG')
					this.send('uciok')
					break;
				case 'isready':
					this.send('readyok');
					break;
				case 'position':
					if (tokens[1] === 'startpos') {
						this.pos.setFen(START_FEN);
					} else if (tokens[1] === 'fen') {
						const fen = tokens.slice(2, 8).join(' ');
						this.pos.setFen(fen);
					}
					break;
				case 'd': 
					this.send(this.pos.display());
					break;
				case 'quit':
					process.exit(0);
					break;
				default:
					break;
			}
		});
	}
}
