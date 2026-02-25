import * as readline from 'readline';

export class UCI {
	private rl: readline.Interface;
	constructor() {
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false,
		});
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
				case 'quit':
					process.exit(0);
					break;
				default:
					break;
			}
		});
	}
}
