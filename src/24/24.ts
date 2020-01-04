import { INPUT_24_Y, INPUT_24 } from "./input";

console.log('24 décembre');

const eris1: boolean[][] = INPUT_24.split('\n').map(l => [...l].map(v => v === '#'));

interface Evo {
    l: number;
    x: number;
    y: number;
    v: boolean;
}

console.log('part 1');

const bio1: { [key: string]: boolean } = {};

while (true) {
    const evolution: Evo[] = [];

    eris1.forEach((y, yi) => {
        y.forEach((x, xi) => {
            const bugs: number = countBugs1(xi, yi);
            let evo: Evo | undefined = undefined;
            if (x && bugs !== 1) {
                evo = { l: 0, x: xi, y: yi, v: !x };
            } else if (!x && bugs >= 1 && bugs <= 2) {
                evo = { l: 0, x: xi, y: yi, v: !x };
            }
            if (evo) {
                evolution.push(evo);
            }
        });
    });

    evolution.forEach(e => eris1[e.y][e.x] = e.v);

    const bioKey: string = eris1.reduce((a, e) => a += e.map(ee => ee ? '#' : '.').join(''), '');
    if (bio1[bioKey]) {
        console.log([...bioKey].reduce((acc, b, i) => {
            return acc += b === '#' ? Math.pow(2, i) : 0
        }, 0));
        break;
    }
    bio1[bioKey] = true;
}

function countBugs1(x: number, y: number): number {
    let r: number = 0;
    const left: number = x - 1;
    if (left >= 0 && eris1[y][left]) {
        r++;
    }

    const right: number = x + 1;
    if (right < eris1.length && eris1[y][right]) {
        r++;
    }

    const top: number = y - 1;
    if (top >= 0 && eris1[top][x]) {
        r++;
    }

    const bottom: number = y + 1;
    if (bottom < eris1.length && eris1[bottom][x]) {
        r++;
    }

    return r;
}

console.log('part 2');

const eris2: boolean[][] = INPUT_24.split('\n').map(l => [...l].map(v => v === '#'));

const levels: { [key: number]: boolean[][] } = {};
levels[0] = eris2;
let levelCount: number = 0;
let minutes: number = 0;

while (true) {
    const evolutions: Evo[] = [];
    if (minutes++ % 2 === 0) {
        ensureLevel();
    }
    for (let level: number = levelCount * -1; level <= levelCount; level++) {
        const eris: boolean[][] = levels[level];

        eris.forEach((y, yi) => {
            y.forEach((x, xi) => {
                const bugs: number = countBugs2(level, xi, yi);
                let evo: Evo | undefined = undefined;
                if (x && bugs !== 1) {
                    evo = { l: level, x: xi, y: yi, v: !x };
                } else if (!x && bugs >= 1 && bugs <= 2) {
                    evo = { l: level, x: xi, y: yi, v: !x };
                }
                if (evo) {
                    evolutions.push(evo);
                }
            });
        });
    }

    evolutions.forEach(e => levels[e.l][e.y][e.x] = e.v);

    if (minutes === 200) {
        break;
    }
}

console.log('tot', Object.values(levels)
    .reduce((la, va, l) => la + va
        .reduce((ya, vy, y) => ya + vy
            .reduce((xa, vx, x) => x === 2 && y === 2 ? xa : vx ? xa + 1 : xa, 0), 0), 0));

function ensureLevel(): void {
    levelCount++;
    levels[levelCount * -1] = Array(5).fill(undefined).map(v => v = Array(5).fill(false));
    levels[levelCount] = Array(5).fill(undefined).map(v => v = Array(5).fill(false));
}

function countBugs2(l: number, x: number, y: number): number {
    let r: number = 0;
    const left: number = x - 1;
    if (left === 2 && y === 2) {
        if (levels[l + 1]) {
            levels[l + 1].forEach(v => {
                if (v[4]) {
                    r++;
                }
            });
        }
    } else if (left >= 0 && levels[l][y][left] || left < 0 && levels[l - 1] && levels[l - 1][2][1]) {
        r++;
    }

    const right: number = x + 1;
    if (right === 2 && y === 2) {
        if (levels[l + 1]) {
            levels[l + 1].forEach(v => {
                if (v[0]) {
                    r++;
                }
            });
        }
    } else if (right < levels[l].length && levels[l][y][right] || right >= levels[l].length && levels[l - 1] && levels[l - 1][2][3]) {
        r++;
    }

    const top: number = y - 1;
    if (top === 2 && x === 2) {
        if (levels[l + 1]) {
            levels[l + 1][4].forEach(v => {
                if (v) {
                    r++;
                }
            });
        }
    } else if (top >= 0 && levels[l][top][x] || top < 0 && levels[l - 1] && levels[l - 1][1][2]) {
        r++;
    }

    const bottom: number = y + 1;
    if (bottom === 2 && x === 2) {
        if (levels[l + 1]) {
            levels[l + 1][0].forEach(v => {
                if (v) {
                    r++;
                }
            });
        }
    } else if (bottom < levels[l].length && levels[l][bottom][x] || bottom >= levels[l].length && levels[l - 1] && levels[l - 1][3][2]) {
        r++;
    }

    return r;
}
