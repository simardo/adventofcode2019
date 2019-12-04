import { INPUT_02 } from './input';

console.log('02 décembre');

let memory: number[];

class Operation {
    constructor(
        private opCode: number,
        public arg1: number,
        public arg2: number,
        public position: number) {

    }

    public exec(): number {
        if (this.opCode === 1) {
            return memory[this.arg1] + memory[this.arg2];
        } else if (this.opCode === 2) {
            return memory[this.arg1] * memory[this.arg2];
        } else {
            throw new Error(`${this.opCode} is not valid`);
        }
    }
}

function* getOpcode(): IterableIterator<Operation> {
    let i: number = 0;

    while (memory[i] != 99) {
        const result: Operation = new Operation(
            memory[i],
            memory[i + 1],
            memory[i + 2],
            memory[i + 3]
        );
        i += 4;

        yield result;
    }
}

console.log('part 1');

memory = [...INPUT_02];
memory[1] = 12;
memory[2] = 2;

for (let op of getOpcode()) {
    memory[op.position] = op.exec();
}

console.log(memory[0]);

console.log('part 2');

for (let noun: number = 0; noun <= 99; noun++) {
    for (let verb: number = 0; verb <= 99; verb++) {
        memory = [...INPUT_02];
        memory[1] = noun;
        memory[2] = verb;

        for (let op of getOpcode()) {
            memory[op.position] = op.exec();
        }

        if (memory[0] === 19690720) {
            console.log(memory);
            console.log(noun * 100 + verb);
            break;
        }
    }
}
