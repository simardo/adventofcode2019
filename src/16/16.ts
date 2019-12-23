import { INPUT_16_Z, INPUT_16_Y, INPUT_16_X, INPUT_16_W, INPUT_16, INPUT_16_V, INPUT_16_ZZ } from "./input";

console.log('16 décembre');

const base: number[] = [0, 1, 0, -1];

let input1: number[] = [...INPUT_16].map(v => Number.parseInt(v));
const pattern1: number[][] = Array(input1.length);

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
