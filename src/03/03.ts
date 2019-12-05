import { INPUT_03_A, INPUT_03_B } from './input';

console.log('03 décembre');

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

// uncomment to calculate grid size

// let w: number = 0;
// let wmin: number = 0;
// let wmax: number = 0;
// let h: number = 0;
// let hmin: number = 0;
// let hmax: number = 0;

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

const grid: any[][][] = new Array(20000).fill(undefined);
grid.forEach((v, i) => grid[i] = new Array(20000).fill(undefined));

const CENTRAL_PORT_X: number = 17500;
let CENTRAL_PORT_Y: number = 11300;

function update(argX: number, argY: number, tag: string, steps: number): void {
    const current: any[] | undefined = grid[argX][argY];
    grid[argX][argY] = current === undefined
        ? [tag, steps]
        : current[0].indexOf(tag) < 0
            ? [current[0] + tag, current[1], steps]
            : current;
}

function handleWire(wirePath: string, tag: string): void {
    let x: number = CENTRAL_PORT_X;
    let y: number = CENTRAL_PORT_Y;

    let steps: number = 0;

    update(x, y, 'O', steps);

    wirePath.split(',').forEach(v => {
        const m: Move = new Move(v);
        const a: Array<undefined> = Array(m.steps).fill(undefined);
        if (m.direction === 'R') {
            a.forEach(v => update(++x, y, tag, ++steps));
        } else if (m.direction === 'L') {
            a.forEach(v => update(--x, y, tag, ++steps));
        } else if (m.direction === 'U') {
            a.forEach(v => update(x, --y, tag, ++steps));
        } else if (m.direction === 'D') {
            a.forEach(v => update(x, ++y, tag, ++steps));
        }
    });
}

handleWire(INPUT_03_A, 'A');
handleWire(INPUT_03_B, 'B');

console.log('part 1');
let dist: number = Number.MAX_SAFE_INTEGER;

for (let x: number = 0; x < grid.length; x++) {
    for (let y: number = 0; y < grid[x].length; y++) {
        if (grid[x][y] && grid[x][y][0].length == 2) {
            dist = Math.min(dist, Math.abs(x - CENTRAL_PORT_X) + Math.abs(y - CENTRAL_PORT_Y));
        }
    }
}

console.log(dist);

console.log('part 2');

let pathLength: number = Number.MAX_SAFE_INTEGER;

for (let x: number = 0; x < grid.length; x++) {
    for (let y: number = 0; y < grid[x].length; y++) {
        if (grid[x][y] && grid[x][y][0].length == 2) {
            pathLength = Math.min(pathLength, grid[x][y][1] + grid[x][y][2]);
        }
    }
}

console.log(pathLength);
