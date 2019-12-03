import { INPUT_01 } from './input';

console.log('01 décembre');

type FuelFn = (mass: number) => number;

console.log('Part 1');

const fuel: FuelFn = (i) => Math.floor(i / 3) - 2;

console.log('Part 1');
console.log(
    INPUT_01.split('\n')
        .map(v => Number.parseInt(v))
        .reduce((tot, v) => tot + fuel(v), 0));

console.log('Part 2');

const fuelRecurse: FuelFn = (i) => {
    let res: number = 0;

    let f: number = Math.floor(i / 3) - 2;
    if (f > 0) {
        res = f + fuelRecurse(f);
    }
    return res;
}

console.log(
    INPUT_01.split('\n')
        .map(v => Number.parseInt(v))
        .reduce((tot, v) => tot + fuel(v), 0));
