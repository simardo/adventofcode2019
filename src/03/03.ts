import { INPUT_03_A, INPUT_03_B } from './input';

class Move {
    private static INST_REGEXP: RegExp = /([RDUL])(\d+)/;

    public direction: string;
    public steps: number;

    constructor(instruction: string) {
        const match: RegExpMatchArray | null = instruction.match(Move.INST_REGEXP);
        if (match) {
            this.direction = match[1];
            this.steps = Number.parseInt(match[2]);
        } else {
            throw new Error(`${instruction} is not a valid instruction`);
        }
    }
}

let w: number = 0;
let wmin: number = 0;
let wmax: number = 0;
let h: number = 0;
let hmin: number = 0;
let hmax: number = 0;

// INPUT_03_B.split(',').forEach(v => {
//     const m: Move = new Move(v);
//     if (m.direction === 'R') {
//         w += m.steps;
//     } else if (m.direction === 'L') {
//         w -= m.steps;
//     } else if (m.direction === 'U') {
//         h -= m.steps;
//     } else if (m.direction === 'D') {
//         h += m.steps;
//     }

//     wmin = Math.min(wmin, w);
//     wmax = Math.max(wmax, w);
//     hmin = Math.min(hmin, h);
//     hmax = Math.max(hmax, h);
// });

// console.log(wmin, wmax);
// console.log(hmin, hmax);

const grid: number[][] = new Array(20000);
grid.fill(new Array(20000));

const CENTRAL_PORT_X: number = 17500;
let CENTRAL_PORT_Y: number = 11300;

let x: number = CENTRAL_PORT_X;
let y: number = CENTRAL_PORT_Y;

grid[x][y] = 0;

function update(argX: number, argY: number): void {
    grid[argX][argY] = grid[argX][argY] === undefined ? 0 : grid[argX][argY] + 1;
}

INPUT_03_A.split(',').forEach(v => {
    // let gridIterator: (value: number) => void;

    const m: Move = new Move(v);
    if (m.direction === 'R') {
        Array(m.steps).forEach(v => update(++x, y));
    } else if (m.direction === 'L') {
        Array(m.steps).forEach(v => update(--x, y));
    } else if (m.direction === 'U') {
        Array(m.steps).forEach(v => update(x, y--));
    } else if (m.direction === 'D') {
        Array(m.steps).forEach(v => update(x, y++));
    }
});





