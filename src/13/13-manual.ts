import { INPUT_13 } from "./input";

console.log('13 décembre');

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

// console.log('part 1');

// const arcade1: IntCode = new IntCode(0, [...INPUT_13]);

// arcade1.run(0);

// let countBlocks: number = 0;

// for (let i = 2; i < arcade1.outputs.length; i += 3) {
//     if (arcade1.outputs[i] === 2) {
//         countBlocks++;
//     }
// }

// console.log(countBlocks);

console.log('part 2');

console.clear();

const memory: number[] = [...INPUT_13];
memory[0] = 2;
const arcade2: IntCode = new IntCode(0, [...memory]);

let input: number = 0;

const readline = require('readline');
let rendering: boolean;

setInterval(() => {
    if (!arcade2.terminate) {
        arcade2.run(input);
        input = 0;
        render();
    } else {
        console.log('GAME OVER', maxScore);
        process.exit();
    }
}, 300);

let index = 0;
let o: number = 1;
let maxScore: number = 0;

function render(): void {
    let x: number = 0;
    let y: number = 0;

    rendering = true;

    while (index < arcade2.outputs.length) {
        if ((index + 1) % 3 === 0) {
            // o = o >= 50 ? 0 : o + 1;
            // readline.cursorTo(process.stdout, 50, o);
            // process.stdout.write(`${arcade2.outputs[index - 2]}, ${arcade2.outputs[index - 1]}, ${arcade2.outputs[index]}`);
            if (arcade2.outputs[index] === 3) {
                readline.cursorTo(process.stdout, 50, o);
                process.stdout.write('            ');
                readline.cursorTo(process.stdout, 50, o++);
                process.stdout.write(`PADDLE: ${arcade2.outputs[index - 2]},${arcade2.outputs[index - 1]}`);
            }
            if (arcade2.outputs[index] === 4) {
                readline.cursorTo(process.stdout, 70, o);
                process.stdout.write('            ');
                readline.cursorTo(process.stdout, 70, o++);
                process.stdout.write(`BALL: ${arcade2.outputs[index - 2]},${arcade2.outputs[index - 1]}`);
            }
            if (o >= 50) {
                o = 1;
            }
            if (x === -1) {
                readline.cursorTo(process.stdout, 1, 30);
                process.stdout.write(`SCORE: ${arcade2.outputs[index]}`);
                maxScore = Math.max(maxScore, arcade2.outputs[index]);
            } else {
                readline.cursorTo(process.stdout, x + 1, y + 1);
                process.stdout.write(
                    arcade2.outputs[index] === 0
                        ? ' '
                        : arcade2.outputs[index] === 1
                            ? '|'
                            : arcade2.outputs[index] === 2
                                ? '.'
                                : arcade2.outputs[index] === 3
                                    ? 'M'
                                    : 'o');
            }
            readline.cursorTo(process.stdout, 0, 50 - arcade2.outputs[index]);
        } else if ((index + 2) % 3 === 0) {
            y = arcade2.outputs[index];
        } else {
            x = arcade2.outputs[index];
        }
        index++;
    }

    rendering = false;
}

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
        process.exit();
    } else {
        input = key.name === 'left' ? -1 : key.name === 'right' ? 1 : 0;
    }
});
