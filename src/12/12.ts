import { INPUT_12 } from "./input";

console.log('12 décembre');

interface Moon {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
}

const regex: RegExp = /x=(-?\d+), y=(-?\d+), z=(-?\d+)/;
let step: number = 0;

console.log('part 1');

const moons1: Moon[] = INPUT_12.split('\n').map(m => {
    const match = m.match(regex);
    return {
        x: Number.parseInt(match![1]),
        y: Number.parseInt(match![2]),
        z: Number.parseInt(match![3]),
        vx: 0,
        vy: 0,
        vz: 0
    };
});

while (step < 1000) {
    moons1.forEach(m1 => {
        moons1.forEach(m2 => {
            m1.vx += m1.x < m2.x ? 1 : m1.x > m2.x ? -1 : 0;
            m1.vy += m1.y < m2.y ? 1 : m1.y > m2.y ? -1 : 0;
            m1.vz += m1.z < m2.z ? 1 : m1.z > m2.z ? -1 : 0
        });
    });

    step++;

    moons1.forEach(m => {
        m.x += m.vx;
        m.y += m.vy;
        m.z += m.vz;
    });
}

console.log(moons1.reduce((e, m) => e += (Math.abs(m.x) + Math.abs(m.y) + Math.abs(m.z)) * (Math.abs(m.vx) + Math.abs(m.vy) + Math.abs(m.vz)), 0));

console.log('part 2');

// compute x,y,z separately then calculate LCM for each moon, then all moons together: https://www.calculatorsoup.com/calculators/math/lcm.php
for (let m = 0; m <= 3; m++) {
    step = 0;

    const moons2: Moon[] = INPUT_12.split('\n').map(m => {
        const match = m.match(regex);
        return {
            x: Number.parseInt(match![1]),
            y: Number.parseInt(match![2]),
            z: Number.parseInt(match![3]),
            vx: 0,
            vy: 0,
            vz: 0
        };
    });

    const seq: number[] = [moons2[m].z];
    let period: number[] = [];

    const STEP_COUNT: number = 50000;

    let valid: boolean = false;
    while (!valid) {
        step = 0;
        while (step < Math.max(period.length * 2, STEP_COUNT)) {
            moons2.forEach(m1 => {
                moons2.forEach(m2 => {
                    // m1.vx += m1.x < m2.x ? 1 : m1.x > m2.x ? -1 : 0;
                    // m1.vy += m1.y < m2.y ? 1 : m1.y > m2.y ? -1 : 0;
                    m1.vz += m1.z < m2.z ? 1 : m1.z > m2.z ? -1 : 0
                });
            });

            step++;

            moons2.forEach(m => {
                // m.x += m.vx;
                // m.y += m.vy;
                m.z += m.vz;
            });

            seq.push(moons2[m].z);
        }
        valid = period.length > 0 && period.every((v, i) => v === seq[i]);
        if (valid) {
            break;
        }
        for (let c: number = 1; c <= STEP_COUNT; c++) {
            period.push(seq.shift()!);
            valid = period.every((v, i) => v === seq[i]);
            if (valid) {
                break;
            }
        }
    }

    console.log(valid, period, period.length);
}
