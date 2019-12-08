import { INPUT_07 } from "./input";

console.log('07 décembre');

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
    constructor(private value: number) {
    }

    public exec(): number {
        // console.log(`output ${this.value}`);
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
        // console.log(`jump ${this.arg1} !? 0 -> ${this.arg2}`)
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
        // console.log(`jump ${this.arg1} =? 0 -> ${this.arg2}`)
        return this.intcode.memIndex;
    }
}

class OpCodeParams implements OpCode {
    private op: OpCode;

    constructor(private intcode: IntCode, private params: number) {
        const p: string = params.toString();
        const opCode: number = Number.parseInt(p.substr(-2));
        const prm: string = p.substr(0, p.length - 2);

        const arg1: number = prm[prm.length - 1] === undefined || prm[prm.length - 1] === '0' ? this.intcode.memory[this.intcode.readMem()] : this.intcode.readMem();
        let arg2: number;

        if (opCode === 1) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? this.intcode.memory[this.intcode.readMem()] : this.intcode.readMem();
            this.op = new OpCodeAdd(arg1, arg2, this.intcode.readMem());
        } else if (opCode === 2) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? this.intcode.memory[this.intcode.readMem()] : this.intcode.readMem();
            this.op = new OpCodeMult(arg1, arg2, this.intcode.readMem());
        } else if (opCode === 3) {
            throw Error('not supported');
        } else if (opCode === 4) {
            this.op = new OpCodeOutput(arg1);
        } else if (opCode === 5) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? this.intcode.memory[this.intcode.readMem()] : this.intcode.readMem();
            this.op = new OpCodeJumpTrue(this.intcode, arg1, arg2);
        } else if (opCode === 6) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? this.intcode.memory[this.intcode.readMem()] : this.intcode.readMem();
            this.op = new OpCodeJumpFalse(this.intcode, arg1, arg2);
        } else if (opCode === 7) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? this.intcode.memory[this.intcode.readMem()] : this.intcode.readMem();
            this.op = new OpCodeLessThan(arg1, arg2, this.intcode.readMem());
        } else if (opCode === 8) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? this.intcode.memory[this.intcode.readMem()] : this.intcode.readMem();
            this.op = new OpCodeEquals(arg1, arg2, this.intcode.readMem());
        } else {
            throw Error(`${params} not supported`);
        }
    }

    public exec(): number {
        const result = this.op.exec();
        if ('position' in this.op) {
            this.intcode.memory[(this.op as OpCodeWrite).position] = result;
        }

        return result;
    }
}

class IntCode {
    private phaseDone: number = 0;
    private lastMemIndex: number = 0;
    public memIndex: number = 0;
    public output: number = Number.NaN;
    public terminate: boolean = false;

    constructor(private phase: number, public memory: number[]) {
    }

    public readMem(): number {
        this.lastMemIndex = this.memIndex;
        return this.memory[this.memIndex++];
    }

    private * readOpcode(input: number): IterableIterator<OpCode> {
        let mem: number = this.readMem();
        let inputConsumed: boolean = false;

        while (mem != 99) {
            if (mem === 1) {
                yield new OpCodeAdd(this.memory[this.readMem()], this.memory[this.readMem()], this.readMem());
            } else if (mem === 2) {
                yield new OpCodeMult(this.memory[this.readMem()], this.memory[this.readMem()], this.readMem());
            } else if (mem === 3) {
                if (inputConsumed) {
                    // console.log('wait for input');
                    this.memIndex = this.lastMemIndex;
                    break;
                } else {
                    inputConsumed = this.phaseDone > 0;
                    yield new OpCodeInput(this.readMem(), this.phaseDone++ === 0 ? this.phase : input);
                }
            } else if (mem === 4) {
                yield new OpCodeOutput(this.memory[this.readMem()]);
            } else if (mem === 5) {
                yield new OpCodeJumpTrue(this, this.memory[this.readMem()], this.memory[this.readMem()]);
            } else if (mem === 6) {
                yield new OpCodeJumpFalse(this, this.memory[this.readMem()], this.memory[this.readMem()]);
            } else if (mem === 7) {
                yield new OpCodeLessThan(this.memory[this.readMem()], this.memory[this.readMem()], this.readMem());
            } else if (mem === 8) {
                yield new OpCodeEquals(this.memory[this.readMem()], this.memory[this.readMem()], this.readMem());
            } else {
                yield new OpCodeParams(this, mem);
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
                this.memory[(op as OpCodeWrite).position] = r;
            }

            if (op instanceof OpCodeOutput) {
                this.output = r;
            }
        }
    }
}

let combinations: any;

function calcCombinations(root: string, v: number[]): void {
    v.forEach((p, i) => {
        const combRoot: string = root + p.toString();
        combinations[combRoot] = [...v];
        combinations[combRoot].splice(i, 1);

        calcCombinations(combRoot, combinations[combRoot]);
        if (combinations[combRoot].length > 0) {
            delete combinations[combRoot];
        }
    });
}

console.log('part 1');
combinations = {};
const phases1: number[] = [0, 1, 2, 3, 4];

calcCombinations('', phases1);
let maxSignal1: number = 0;

Object.keys(combinations).map(k => [...k].map(v => Number.parseInt(v))).forEach(phase => {
    let lastInput1: number = 0;

    for (let i: number = 1; i <= 5; i++) {
        const amp: IntCode = new IntCode(phase[i - 1], [...INPUT_07]);

        amp.run(lastInput1);
        lastInput1 = amp.output;
    }

    maxSignal1 = Math.max(maxSignal1, lastInput1);
})

console.log(maxSignal1);

console.log('part 2');
combinations = {};
const phases2: number[] = [5, 6, 7, 8, 9];
const amps: IntCode[] = Array(5);

calcCombinations('', phases2);
let maxSignal2: number = 0;

Object.keys(combinations).map(k => [...k].map(v => Number.parseInt(v))).forEach(phase => {
    let lastInput2: number = 0;

    for (let i: number = 0; i <= 4; i++) {
        amps[i] = new IntCode(phase[i], [...INPUT_07]);
    }

    while (amps.some(a => !a.terminate)) {
        for (let i: number = 0; i <= 4; i++) {
            amps[i].run(lastInput2);
            lastInput2 = amps[i].output;
        }
    }

    maxSignal2 = Math.max(maxSignal2, lastInput2);
})

console.log(maxSignal2);
