import { INPUT_15 } from "./input";

console.log('15 décembre');

interface OpCode {
    exec(): number;
}

interface OpCodeWrite {
    position: number;
}

class OpCodeAdd implements OpCode, OpCodeWrite {
    constructor(private arg1: number,
        private arg2: number,
        public position: number) {
    }

    public exec(): number {
        // console.log(`add ${this.arg1} + ${this.arg2}, ${this.position}`);
        return this.arg1 + this.arg2;
    }
}

class OpCodeMult implements OpCode, OpCodeWrite {
    constructor(private arg1: number,
        private arg2: number,
        public position: number) {
    }

    public exec(): number {
        // console.log(`mult ${this.arg1} * ${this.arg2}, ${this.position}`);
        return this.arg1 * this.arg2;
    }
}

class OpCodeInput implements OpCode, OpCodeWrite {
    constructor(public position: number,
        private input: number) {
    }

    public exec(): number {
        // console.log(`input ${this.input}, ${this.position}`);
        return this.input;
    }
}

class OpCodeOutput implements OpCode {
    constructor(private intcode: IntCode, private value: number) {
    }

    public exec(): number {
        // console.log(`output ${this.value}`);
        this.intcode.outputs.push(this.value);
        return this.value;
    }
}

class OpCodeLessThan implements OpCode, OpCodeWrite {
    constructor(private arg1: number,
        private arg2: number,
        public position: number) {
    }

    public exec(): number {
        // console.log(`less ${this.arg1} <? ${this.arg2}, ${this.position}`);
        return this.arg1 < this.arg2 ? 1 : 0;
    }
}

class OpCodeEquals implements OpCode, OpCodeWrite {
    constructor(private arg1: number, private arg2: number, public position: number) {
    }

    public exec(): number {
        // console.log(`equals ${this.arg1} =? ${this.arg2}, ${this.position}`);
        return this.arg1 === this.arg2 ? 1 : 0;
    }
}

class OpCodeJumpTrue implements OpCode {
    constructor(private intcode: IntCode, private arg1: number, private arg2: number) {
    }

    public exec(): number {
        if (this.arg1 !== 0) {
            this.intcode.memIndex = this.arg2;
        }
        // console.log(`jump ${this.arg1} !? 0 -> ${this.arg2}`);
        return this.intcode.memIndex;
    }
}

class OpCodeJumpFalse implements OpCode {
    constructor(private intcode: IntCode, private arg1: number, private arg2: number) {
    }

    public exec(): number {
        if (this.arg1 === 0) {
            this.intcode.memIndex = this.arg2;
        }
        // console.log(`jump ${this.arg1} =? 0 -> ${this.arg2}`);
        return this.intcode.memIndex;
    }
}

class OpCodeRelativeBase implements OpCode {
    constructor(private intCode: IntCode, private relativeBase: number) {
    }

    public exec(): number {
        this.intCode.relativeBase += this.relativeBase;
        // console.log(`base ${this.relativeBase} ${this.intCode.relativeBase}`);
        return this.intCode.relativeBase;
    }
}

class InputConsumedException { }

class OpCodeParams implements OpCode {
    private op: OpCode;

    constructor(private intcode: IntCode, private input: number, private params: number) {
        const p: string = this.params.toString();
        const opCode: number = Number.parseInt(p.substr(-2));
        const prm: string = p.substr(0, p.length - 2);

        if (opCode === 1) {
            this.op = new OpCodeAdd(this.getArg(prm, 1), this.getArg(prm, 2), this.getInputArg(prm, 3));
        } else if (opCode === 2) {
            this.op = new OpCodeMult(this.getArg(prm, 1), this.getArg(prm, 2), this.getInputArg(prm, 3));
        } else if (opCode === 3) {
            if (this.intcode.inputConsumed) {
                throw new InputConsumedException();
            } else {
                this.op = new OpCodeInput(this.getInputArg(prm, 1), this.input);
            }
        } else if (opCode === 4) {
            this.op = new OpCodeOutput(this.intcode, this.getArg(prm, 1));
        } else if (opCode === 5) {
            this.op = new OpCodeJumpTrue(this.intcode, this.getArg(prm, 1), this.getArg(prm, 2));
        } else if (opCode === 6) {
            this.op = new OpCodeJumpFalse(this.intcode, this.getArg(prm, 1), this.getArg(prm, 2));
        } else if (opCode === 7) {
            this.op = new OpCodeLessThan(this.getArg(prm, 1), this.getArg(prm, 2), this.getInputArg(prm, 3));
        } else if (opCode === 8) {
            this.op = new OpCodeEquals(this.getArg(prm, 1), this.getArg(prm, 2), this.getInputArg(prm, 3));
        } else if (opCode === 9) {
            this.op = new OpCodeRelativeBase(this.intcode, this.getArg(prm, 1));
        } else {
            throw Error(`${params} not supported`);
        }
    }

    private getArg(prm: string, argNum: number): number {
        const mode: string | undefined = prm[prm.length - argNum];
        const modeArg: number = this.intcode.readMem();
        const r = mode === '2'
            ? this.intcode.peekMemory(this.intcode.relativeBase + modeArg)
            : mode === '1'
                ? modeArg
                : this.intcode.peekMemory(modeArg)

        // console.log('arg', opCode, prm, mode, modeArg, r);

        return r;
    }

    private getInputArg(prm: string, argNum: number): number {
        const mode: string | undefined = prm[prm.length - argNum];
        const modeArg: number = this.intcode.readMem();
        const r = mode === '2'
            ? this.intcode.relativeBase + modeArg
            : modeArg

        // console.log('arg', opCode, prm, mode, modeArg, r);

        return r;
    }

    public exec(): number {
        const result = this.op.exec();
        if ('position' in this.op) {
            this.intcode.writeMem(result, (this.op as OpCodeWrite).position);
        }

        return result;
    }
}

class IntCode {
    public memIndex: number = 0;
    private lastMemIndex: number = 0;
    public outputs: number[] = [];
    public terminate: boolean = false;
    public inputConsumed: boolean = false;

    constructor(public relativeBase: number, private internalMemory: number[]) {
    }

    public readMem(): number {
        this.lastMemIndex = this.memIndex;
        return this.internalMemory[this.memIndex++];
    }

    public writeMem(value: number, index: number): void {
        this.ensureMemory(index);
        this.internalMemory[index] = value;
    }

    private ensureMemory(index: number): void {
        while (this.internalMemory.length <= index) {
            this.internalMemory.push(0);
        }
    }

    public peekMemory(index: number): number {
        this.ensureMemory(index);
        return this.internalMemory[index];
    }

    private * readOpcode(input: number): IterableIterator<OpCode> {
        this.inputConsumed = false;
        let mem: number = this.readMem();

        while (mem != 99) {
            if (mem === 1) {
                yield new OpCodeAdd(this.peekMemory(this.readMem()), this.peekMemory(this.readMem()), this.readMem());
            } else if (mem === 2) {
                yield new OpCodeMult(this.peekMemory(this.readMem()), this.peekMemory(this.readMem()), this.readMem());
            } else if (mem === 3) {
                if (this.inputConsumed) {
                    // console.log('wait for input');
                    this.memIndex = this.lastMemIndex;
                    break;
                } else {
                    this.inputConsumed = true;
                    yield new OpCodeInput(this.readMem(), input);
                }
            } else if (mem === 4) {
                yield new OpCodeOutput(this, this.peekMemory(this.readMem()));
            } else if (mem === 5) {
                yield new OpCodeJumpTrue(this, this.peekMemory(this.readMem()), this.peekMemory(this.readMem()));
            } else if (mem === 6) {
                yield new OpCodeJumpFalse(this, this.peekMemory(this.readMem()), this.peekMemory(this.readMem()));
            } else if (mem === 7) {
                yield new OpCodeLessThan(this.peekMemory(this.readMem()), this.peekMemory(this.readMem()), this.readMem());
            } else if (mem === 8) {
                yield new OpCodeEquals(this.peekMemory(this.readMem()), this.peekMemory(this.readMem()), this.readMem());
            } else if (mem === 9) {
                yield new OpCodeRelativeBase(this, this.peekMemory(this.readMem()));
            } else {
                try {
                    yield new OpCodeParams(this, input, mem);
                } catch (e) {
                    if (e instanceof InputConsumedException) {
                        // console.log('wait for input');
                        this.memIndex = this.lastMemIndex;
                        break;
                    }
                }
            }
            mem = this.readMem();
        }

        this.terminate = mem === 99;
    }

    public run(input: number): void {
        if (this.terminate) {
            throw new Error('terminated');
        }

        for (let op of this.readOpcode(input)) {
            const r = op.exec();
            if ('position' in op) {
                this.writeMem(r, (op as OpCodeWrite).position);
            }
        }
    }
}

interface Movement {
    name: string;
    value: number;
    move: () => void;
    back: () => void;
    turnRight: () => Movement;
    turnLeft: () => Movement;
}

const E: Movement = {
    name: 'E',
    value: 4,
    move: () => x++,
    back: () => x--,
    turnRight: () => S,
    turnLeft: () => N
};

const N: Movement = {
    name: 'N',
    value: 1,
    move: () => y--,
    back: () => y++,
    turnRight: () => E,
    turnLeft: () => W
};

const W: Movement = {
    name: 'W',
    value: 3,
    move: () => x--,
    back: () => x++,
    turnRight: () => N,
    turnLeft: () => S
};

const S: Movement = {
    name: 'S',
    value: 2,
    move: () => y++,
    back: () => y--,
    turnRight: () => W,
    turnLeft: () => E
};

interface Tile {
    t: string;
    c: number;
    a: Tile[];
}

const oxysys: { [key: string]: Tile } = {};

oxysys['0,0'] = { t: 'D', c: 0, a: [] };

let x: number = 0;
let y: number = 0;
let movement: Movement = N;
let outputCount: number = 0;

let minX: number = Number.MAX_SAFE_INTEGER;
let minY: number = Number.MAX_SAFE_INTEGER;
let maxX: number = 0;
let maxY: number = 0;

let rightCount: number = 0;
let leftCount: number = 0;

let currentTile: Tile = oxysys['0,0'];

// comment follow right wall for part 1
const droidRight: IntCode = new IntCode(0, [...INPUT_15]);
while (!droidRight.terminate) {
    droidRight.run(movement.value);

    const o: number = droidRight.outputs[outputCount++];

    let tile: Tile | undefined = undefined;
    if (o === 0) {
        movement.move();
        ensureArea();
        setTile(x, y, '#');
        movement.back();
        movement = movement.turnLeft();
    } else if (o === 1) {
        movement.move();
        rightCount++;
        tile = setTile(x, y, ' ');
        movement = movement.turnRight();
    } else if (o === 2) {
        movement.move();
        rightCount++;
        tile = setTile(x, y, 'O');
    }
    if (tile) {
        linkTiles(currentTile, tile);
        currentTile = tile;
    }
    ensureArea();
    if (o === 2) {
        break;
    }
}

x = 0;
y = 0;
movement = N;
outputCount = 0;
currentTile = oxysys['0,0'];

const droidLeft: IntCode = new IntCode(0, [...INPUT_15]);
while (!droidLeft.terminate) {
    droidLeft.run(movement.value);

    const o: number = droidLeft.outputs[outputCount++];
    let tile: Tile | undefined;

    if (o === 0) {
        movement.move();
        ensureArea();
        setTile(x, y, '#');
        movement.back();
        movement = movement.turnRight();
    } else if (o === 1) {
        movement.move();
        leftCount++;
        tile = setTile(x, y, ' ')
        movement = movement.turnLeft();
    } else if (o === 2) {
        movement.move();
        leftCount++;
        tile = setTile(x, y, 'O');
        console.log('O2 found', x, y);
    }
    if (tile) {
        linkTiles(currentTile, tile);
        currentTile = tile;
    }
    ensureArea();
    if (o === 2) {
        break;
    }
}

function linkTiles(tile1: Tile, tile2: Tile): void {
    if (tile1 != tile2) {
        if (tile1.a.indexOf(tile2) < 0) {
            tile1.a.push(tile2);
        }
        if (tile2.a.indexOf(tile1) < 0) {
            tile2.a.push(tile1);
        }
    }
}

function setTile(x: number, y: number, tile: string): Tile {
    let result: Tile | undefined = oxysys[`${x},${y}`];
    if (result === undefined) {
        result = { t: tile, c: 0, a: [] }
    }
    result.c = result.c + 1;
    oxysys[`${x},${y}`] = result;
    return result;
}

function ensureArea(): void {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
}

function render(): void {
    const lines: string[] = [];

    for (let yy: number = minY; yy <= maxY; yy++) {
        let line: string = '';
        for (let xx: number = minX; xx <= maxX; xx++) {
            const k: string = `${xx},${yy}`;
            const v: string | undefined = oxysys[k] === undefined
                ? undefined
                : oxysys[k].t; // comment for part 1
                // uncomment for part 1
                // : oxysys[k].t === '#' || oxysys[k].t === 'D' || oxysys[k].t === 'O'
                //     ? oxysys[k].t
                //     : oxysys[k].c.toString();
            line += v === undefined ? ' ' : v;
        }
        lines.push(line);
    }

    lines.forEach(l => console.log(l));
}
render();
console.log(leftCount, rightCount);

console.log('part 2');

let time: number = 0;
while (Object.keys(oxysys).map(k => oxysys[k]).filter(t => t.t === ' ' || t.t === 'D').length > 0) {
    const oxyTiles: Tile[] = [...Object.keys(oxysys).map(k => oxysys[k]).filter(t => t.t === 'O')];
    oxyTiles.forEach(o => {
        o.a.forEach(a => a.t = 'O');
    });

    time++;
}

render();
console.log(time);
