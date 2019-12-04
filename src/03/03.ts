import { INPUT_03_A, INPUT_03_B, INPUT_03_Y, INPUT_03_Z } from './input';

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

const grid: string[][] = new Array(20000);
grid.fill(new Array(20000));

const CENTRAL_PORT_X: number = 1000; // 17500;
let CENTRAL_PORT_Y: number = 1000; // 11300;

let x: number;
let y: number;

function update(argX: number, argY: number, tag: string): void {
    const current: string | undefined = grid[argX][argY];
    grid[argX][argY] = current === undefined
        ? tag
        : current.indexOf(tag) < 0
            ? current + tag
            : current;

    console.log(argX, argY, grid[argX][argY]);
}

function handleWire(wirePath: string, tag: string): void {
    x = CENTRAL_PORT_X;
    y = CENTRAL_PORT_Y;

    update(x, y, tag);

    wirePath.split(',').forEach(v => {
        // let gridIterator: (value: number) => void;

        const m: Move = new Move(v);
        const a: Array<undefined> = Array(m.steps).fill(undefined);
        if (m.direction === 'R') {
            a.forEach(v => update(++x, y, tag));
        } else if (m.direction === 'L') {
            a.forEach(v => update(--x, y, tag));
        } else if (m.direction === 'U') {
            a.forEach(v => update(x, --y, tag));
        } else if (m.direction === 'D') {
            a.forEach(v => update(x, ++y, tag));
        }

        console.log(m);
    });
}

handleWire(INPUT_03_Y, 'A');
handleWire(INPUT_03_Z, 'B');

// for (let x: number = 0; x < grid.length; x++) {
//     for (let y: number = 0; y < grid[x].length; y++) {
//         if (grid[x][y] && grid[x][y].length == 2) {
//             console.log(x, y, grid[x][y]);
//         }
//     }
// }
