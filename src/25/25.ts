import { INPUT_25 } from "./input";

console.log('25 décembre');

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
        if (this.intcode.ascii === true) {
            // console.log(`output ${String.fromCharCode(this.value)}`);
        } else {
            // console.log(`output ${this.value}`);
        }
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
                this.intcode.inputConsumed = true;
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
    public ascii: boolean = true;
    public blocked: boolean = false;

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
        this.blocked = false;
        let mem: number = this.readMem();
        // console.log('i', mem);

        while (mem != 99) {
            if (mem === 1) {
                yield new OpCodeAdd(this.peekMemory(this.readMem()), this.peekMemory(this.readMem()), this.readMem());
            } else if (mem === 2) {
                yield new OpCodeMult(this.peekMemory(this.readMem()), this.peekMemory(this.readMem()), this.readMem());
            } else if (mem === 3) {
                if (this.inputConsumed) {
                    // console.log('wait for input');
                    this.memIndex = this.lastMemIndex;
                    this.blocked = true;
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
                        this.blocked = true;
                        break;
                    }
                }
            }
            mem = this.readMem();
        }

        // console.log('o', mem);
        this.terminate = mem === 99;
    }

    public run(input: number): void {
        if (this.terminate) {
            // this.outputs.forEach(o => console.log(String.fromCharCode(o)));
            throw new Error('terminated');
        }

        for (let op of this.readOpcode(input)) {
            const r = op.exec();
            if ('position' in op) {
                this.writeMem(r, (op as OpCodeWrite).position);
            }
        }
    }

    public print(): void {
        let lines: string[] = [];
        let line: string = '';

        this.outputs.forEach((o, i) => {
            if (o === 10) {
                lines.push(line);
                line = '';
            } else {
                line += this.ascii ? String.fromCharCode(o) : o;
            }
        });
        if (line != '') {
            lines.push(line);
        }
        lines.forEach(l => console.log(l));
    }

}

const droid: IntCode = new IntCode(0, [...INPUT_25]);

const instructions: string[] = [
    'inv',
    'east',
    'take klein bottle',
    'east',
    'take semiconductor',
    'west',
    'north',
    'north',
    // 'take infinite loop',
    'north',
    'take dehydrated water',
    'south',
    'south',
    'south',
    'west',
    'north',
    'take sand',
    'north',
    // 'take escape pod',
    'north',
    'take astrolabe',
    'south',
    'south',
    'west',
    'west',
    'take mutex',
    'east',
    'east',
    'south',
    'west',
    'north',
    'take shell',
    'south',
    'south',
    // 'take giant electromagnet',
    'east',
    // 'take photons',
    'south',
    // 'take molten lava',
    'north',
    'west',
    'west',
    'take ornament',
    'west',
    'south',
    'inv',
    'south',

    'drop mutex',
    // 'drop ornament',
    // 'drop astrolabe',
    // 'drop sand',
    'drop semiconductor',
    'drop dehydrated water',
    // 'drop shell',

    'drop klein bottle',
    // 'inv',
    'south'
];

const program: number[] = instructions.reduce((acc: number[], i) => acc.concat(convert(i)), []);
program.forEach(p => droid.run(p));
droid.print();

function convert(s: string): number[] {
    const r: number[] = [...s].map(m => m.charCodeAt(0));
    r.push(10);
    return r;
}
