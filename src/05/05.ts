import { INPUT_05 } from './input';

console.log('05 décembre');

let memory: number[];

interface OpCode {
    exec(): number;
}

class OpCodeAdd implements OpCode {
    constructor(private arg1: number,
        private arg2: number,
        private position: number) {
    }

    public exec(): number {
        memory[this.position] = this.arg1 + this.arg2;
        return memory[this.position];
    }
}

class OpCodeMult implements OpCode {
    constructor(private arg1: number,
        private arg2: number,
        private position: number) {
    }

    public exec(): number {
        memory[this.position] = this.arg1 * this.arg2;
        return memory[this.position];
    }
}

class OpCodeInput implements OpCode {
    constructor(private position: number,
        private input: number) {
    }

    public exec(): number {
        memory[this.position] = this.input;
        return memory[this.position];
    }
}

class OpCodeOutput implements OpCode {
    constructor(private value: number) {
    }

    public exec(): number {
        console.log('output', this.value);
        return this.value;
    }
}

class OpCodeLessThan implements OpCode {
    constructor(private arg1: number,
        private arg2: number,
        private position: number) {
    }

    public exec(): number {
        memory[this.position] = this.arg1 < this.arg2 ? 1 : 0;
        return memory[this.position];
    }
}

class OpCodeEquals implements OpCode {
    constructor(private arg1: number,
        private arg2: number,
        private position: number) {
    }

    public exec(): number {
        memory[this.position] = this.arg1 === this.arg2 ? 1 : 0;
        return memory[this.position];
    }
}

class OpCodeJumpTrue implements OpCode {
    constructor(private arg1: number,
        private arg2: number) {
    }

    public exec(): number {
        if (this.arg1 !== 0) {
            memIndex = this.arg2;
        }
        return memIndex;
    }
}

class OpCodeJumpFalse implements OpCode {
    constructor(private arg1: number,
        private arg2: number) {
    }

    public exec(): number {
        if (this.arg1 === 0) {
            memIndex = this.arg2;
        }
        return memIndex;
    }
}

class OpCodeParams implements OpCode {
    private op: OpCode;

    constructor(private params: number) {
        const p: string = params.toString();
        const opCode: number = Number.parseInt(p.substr(-2));
        const prm: string = p.substr(0, p.length - 2);

        const arg1: number = prm[prm.length - 1] === undefined || prm[prm.length - 1] === '0' ? memory[readMem()] : readMem();
        let arg2: number;

        if (opCode === 1) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? memory[readMem()] : readMem();
            this.op = new OpCodeAdd(arg1, arg2, readMem());
        } else if (opCode === 2) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? memory[readMem()] : readMem();
            this.op = new OpCodeMult(arg1, arg2, readMem());
        } else if (opCode === 3) {
            throw Error('not supported');
        } else if (opCode === 4) {
            this.op = new OpCodeOutput(arg1);
        } else if (opCode === 5) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? memory[readMem()] : readMem();
            this.op = new OpCodeJumpTrue(arg1, arg2);
        } else if (opCode === 6) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? memory[readMem()] : readMem();
            this.op = new OpCodeJumpFalse(arg1, arg2);
        } else if (opCode === 7) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? memory[readMem()] : readMem();
            this.op = new OpCodeLessThan(arg1, arg2, readMem());
        } else if (opCode === 8) {
            arg2 = prm[prm.length - 2] === undefined || prm[prm.length - 2] === '0' ? memory[readMem()] : readMem();
            this.op = new OpCodeEquals(arg1, arg2, readMem());
        } else {
            throw Error(`${params} not supported`);
        }
    }

    public exec(): number {
        return this.op.exec();
    }
}

let memIndex: number = 0;

function readMem(): number {
    return memory[memIndex++];
}

function* readOpcode(input: number): IterableIterator<OpCode> {
    let mem: number = readMem();
    while (mem != 99) {
        if (mem === 1) {
            yield new OpCodeAdd(memory[readMem()], memory[readMem()], readMem());
        } else if (mem === 2) {
            yield new OpCodeMult(memory[readMem()], memory[readMem()], readMem());
        } else if (mem === 3) {
            yield new OpCodeInput(readMem(), input);
        } else if (mem === 4) {
            yield new OpCodeOutput(memory[readMem()]);
        } else if (mem === 5) {
            yield new OpCodeJumpTrue(memory[readMem()], memory[readMem()]);
        } else if (mem === 6) {
            yield new OpCodeJumpFalse(memory[readMem()], memory[readMem()]);
        } else if (mem === 7) {
            yield new OpCodeLessThan(memory[readMem()], memory[readMem()], readMem());
        } else if (mem === 8) {
            yield new OpCodeEquals(memory[readMem()], memory[readMem()], readMem());
        } else {
            yield new OpCodeParams(mem);
        }
        mem = readMem();
    }
}

console.log('part 1');
memory = [...INPUT_05];

for (let op of readOpcode(1)) {
    const r = op.exec();
}

console.log('part 2');
memory = [...INPUT_05];

for (let op of readOpcode(5)) {
    const r = op.exec();
}
