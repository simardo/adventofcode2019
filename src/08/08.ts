import { INPUT_08 } from "./input";

console.log('08 décembre');

const WIDTH: number = 25;
const HEIGHT: number = 6;

console.log('part 1');

const layers1: number[] = [];
let index1: number = 0;
const vector1: number[] = [...INPUT_08].map(v => Number.parseInt(v));

while (index1 < vector1.length - 1) {
    layers1.push(vector1.slice(index1, index1 + (WIDTH * HEIGHT)).reduce((acc, v) => v === 0 ? ++acc : acc, 0));
    index1 += (WIDTH * HEIGHT);
}

let min: number = Number.MAX_SAFE_INTEGER;
const targetLayer: number = layers1.reduce((acc, v, i) => {
    if (v < min) {
        min = v;
        return i;
    } else {
        return acc;
    }
}, 0);

const targetLayerIndex: number = targetLayer * (WIDTH * HEIGHT);

const target: number[] = vector1.slice(targetLayerIndex, targetLayerIndex + (WIDTH * HEIGHT));
const countOnes: number = target.reduce((acc, v) => v === 1 ? ++acc : acc, 0);
const countTwos: number = target.reduce((acc, v) => v === 2 ? ++acc : acc, 0);

console.log(countOnes * countTwos);

console.log('part 2');

const layers2: number[][] = [];
let index2: number = 0;
const vector2: number[] = [...INPUT_08].map(v => Number.parseInt(v));

while (index2 < vector2.length - 1) {
    layers2.push(vector2.slice(index2, index2 + (WIDTH * HEIGHT)));
    index2 += (WIDTH * HEIGHT);
}

const image: number[] = layers2.reduceRight((acc, v) => v.map((vv, i) => acc[i] = vv === 2 ? acc[i] : vv));

index2 = 0;
while (index2 < image.length - 1) {
    console.log(image.slice(index2, index2 + (WIDTH)).map(v => v === 1 ? 'x' : ' ').join(''));
    index2 += WIDTH;
}
