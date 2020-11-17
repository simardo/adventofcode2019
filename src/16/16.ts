import { INPUT_16_Z, INPUT_16_Y, INPUT_16_X, INPUT_16_W, INPUT_16, INPUT_16_V, INPUT_16_U, INPUT_16_T, INPUT_16_ZZ } from "./input";

console.log('16 décembre');

const base: number[] = [0, 1, 0, -1];

let input1: number[] = [...INPUT_16].map(v => Number.parseInt(v));

const pattern1: number[][] = Array(input1.length);

console.log(input1.length);

for (let i: number = 0; i < input1.length; i++) {
    pattern1[i] = [];
    base.forEach(b => {
        for (let j: number = 0; j <= i; j++) {
            pattern1[i].push(b);
        }
    });
    while (pattern1[i].length <= input1.length) {
        pattern1[i] = pattern1[i].concat(pattern1[i]);
    }
    pattern1[i].shift();
}

console.log('part 1');

for (let phase: number = 1; phase <= 100; phase++) {
    const output: number[] = [];
    pattern1.forEach(p => {
        output.push(input1.reduce((acc, v, i) => acc + (v * p[i]), 0));
    });

    input1 = output.map(o => Number.parseInt(o.toString().substr(-1)));
}

console.log(input1);

console.log('part 2');

let input2: number[] = [...INPUT_16].map(v => Number.parseInt(v));
let chain: number[] = new Array(input2.length * 10000);

input2.forEach((v, i) => chain[i] = v);

for (let i: number = 1; i < 10000; i++) {
    chain.copyWithin(i * input2.length, 0, input2.length);
}

const offset: number = Number.parseInt(input2.splice(0, 7).join(''));

console.log(chain.length);
console.log(offset);

for (let phase: number = 1; phase <= 100; phase++) {
    console.log('phase', phase);

    const output: number[] = new Array(chain.length);
    const outputSum: number[] = new Array(chain.length);

    let c: number;
    let n: number;
    let first: boolean = true;
    for (let pattern: number = offset; pattern <= chain.length; pattern++) {
        n = 0;
        if (first) {
            c = pattern - 1;
            while (c < chain.length) {
                n += chain[c];
                outputSum[c++] = n;
            }
            first = false;
        } else {
            n = outputSum[outputSum.length - 1] - outputSum[pattern - 2];
        }

        output[pattern - 1] = Number.parseInt(n.toString().substr(-1));
    }
    chain = output;
}

console.log(chain.slice(offset, offset + 8));
