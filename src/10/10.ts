import { INPUT_10 } from "./input";

console.log('10 décembre');

type AsteroidMap = { [key: number]: Asteroid[] };

interface Asteroid {
    hit: boolean;
    x: number;
    y: number;
    next: AsteroidMap;
    prev: AsteroidMap;
}

console.log('part 1');

const asteroids: Asteroid[] = INPUT_10
    .split('\n')
    .map((s, i) => [...s]
        .map((ss, ii) => { return { hit: ss === '#', x: ii, y: i, next: {}, prev: {} } })
        .filter(v => v.hit))
    .reduce((acc, v) => acc.concat(v));

asteroids.forEach((ast, i) => {
    for (let next = i + 1; next < asteroids.length; next++) {
        const m: number = (asteroids[next].y - ast.y) / (asteroids[next].x - ast.x);
        if (ast.next[m] === undefined) {
            ast.next[m] = [];
        }
        ast.next[m].push(asteroids[next]);
    }
    for (let prev = i - 1; prev >= 0; prev--) {
        const m: number = (asteroids[prev].y - ast.y) / (asteroids[prev].x - ast.x);
        if (ast.prev[m] === undefined) {
            ast.prev[m] = [];
        }
        ast.prev[m].push(asteroids[prev]);
    }
});

let max: number = 0;
let target: Asteroid | undefined = undefined;
console.log(asteroids.reduce((acc, a) => {
    const count: number = Object.keys(a.next).length + Object.keys(a.prev).length;
    if (count > max) {
        max = count;
        target = a;
    }
    return max;
}, max));

console.log('part 2');
const sortFunc: (a: string, b: string) => number = (a, b) => Number.parseFloat(a) < Number.parseFloat(b) ? -1 : Number.parseFloat(a) === Number.parseFloat(b) ? 0 : 1;

const q1: number[] = Object.keys(target!.prev).sort(sortFunc).map(s => Number.parseFloat(s));
const q2: number[] = Object.keys(target!.next).sort(sortFunc).map(s => Number.parseFloat(s));

const vaporized: Asteroid[] = [];

while (vaporized.length < 200) {
    function vaporize(t: AsteroidMap, m: number): void {
        if (t[m].length > 0) {
            vaporized.push(t[m].shift()!);
        }
    }

    for (let i = 0; i < q1.length; i++) {
        const targetM = q1[i];
        if (targetM >= 0) {
            break;
        }

        vaporize(target!.prev, targetM);
    }

    for (let i = 0; i < q2.length; i++) {
        const targetM = q2[i];
        if (targetM >= 0) {
            vaporize(target!.next, targetM);
        }
    }

    for (let i = 0; i < q2.length; i++) {
        const targetM = q2[i];
        if (targetM >= 0) {
            break;
        }

        vaporize(target!.next, targetM);
    }

    vaporize(target!.prev, 0);

    for (let i = 0; i < q1.length; i++) {
        const targetM = q1[i];
        if (targetM > 0) {
            vaporize(target!.prev, targetM);
        }
    }
}

console.log(vaporized[199].x * 100 + vaporized[199].y);
