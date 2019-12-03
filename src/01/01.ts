import fs from "fs";

console.log('01 décembre');

type FuelFn = (mass: number) => number;

fs.readFile('./src/01/input.txt', 'utf8', (err, data) => {
    console.log('Part 1');

    const fuel: FuelFn = (i) => Math.floor(i / 3) - 2;

    console.log(
        data.split('\r\n')
            .map(v => Number.parseInt(v))
            .filter(v => !Number.isNaN(v))
            .reduce((tot, v) => tot + fuel(v), 0));
});

fs.readFile('./src/01/input.txt', 'utf8', (err, data) => {
    console.log('Part 2');

    const fuel: FuelFn = (i) => {
        let res: number = 0;

        let f: number = Math.floor(i / 3) - 2;
        if (f > 0) {
            res = f + fuel(f);
        }
        return res;
    }

    console.log(
        data.split('\r\n')
            .map(v => Number.parseInt(v))
            .filter(v => !Number.isNaN(v))
            .reduce((tot, v) => tot + fuel(v), 0));
});
