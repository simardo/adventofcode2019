import { INPUT_22_Z, INPUT_22_Y, INPUT_22_X, INPUT_22_W, INPUT_22_V, INPUT_22 } from "./input";

console.log('22 décembre 2019');

const INCREMENT_REGEX: RegExp = /deal with increment (\d+)/;
const NEW_STACK_REGEX: RegExp = /deal into new stack/;
const CUT_REGEX: RegExp = /cut (-?\d+)/;

const DECK_COUNT_1: number = 10007;
const POS_1: number = 2019;
let deck: number[] = [];

for (let i = 0; i < DECK_COUNT_1; i++) {
    deck.push(i)
}

// part 1
const ab: AB = shuffle(INPUT_22);
console.log(ab, norm((ab.a * BigInt(POS_1) + ab.b) % BigInt(DECK_COUNT_1), DECK_COUNT_1));
console.log('-->', deck.indexOf(POS_1));

function dealIncrement(inc: number): number[] {
    const r: number[] = Array(deck.length).fill(0);
    let d: number = 0;
    let i: number = 0;

    while (d < deck.length) {
        while (i < deck.length) {
            r[i] = deck[d++];
            i += inc;
        }
        i -= deck.length;
    }
    return r;
}

function dealNewStack(): number[] {
    return deck.reverse();
}

function cut(n: number): number[] {
    const r: number[] = [];
    r.push(...deck.splice(n, deck.length - n));
    r.push(...deck);

    return r;
}

type AB = {
    a: bigint;
    b: bigint;
}

function shuffle(input: string): AB {
    const rr = input.split('\n').reduce((p, i) => {
        let a: bigint = BigInt(1);
        let b: bigint = BigInt(0);

        let m = i.match(INCREMENT_REGEX);
        if (m) {
            deck = dealIncrement(Number.parseInt(m[1]));
            a = BigInt(Number.parseInt(m[1]));
        } else {
            m = i.match(NEW_STACK_REGEX);
            if (m) {
                deck = dealNewStack();
                a = BigInt(-1);
                b = BigInt(DECK_COUNT_1 - 1);
            } else {
                m = i.match(CUT_REGEX);
                if (m) {
                    deck = cut(Number.parseInt(m[1]));
                    b = BigInt(-Number.parseInt(m[1]));
                } else {
                    throw new Error('deal?')
                }
            }
        }
        const r = [BigInt(a * p[0]), BigInt(a * p[1] + b)];
        return r;
    }, [BigInt(1), BigInt(0)]);

    return { a: rr[0], b: rr[1] };
}

function norm(pos: bigint, dc: number): bigint {
    return pos >= 0 ? pos % BigInt(dc) : BigInt(dc) - -pos % BigInt(dc);
}

const DECK_COUNT_2: number = 119315717514047;
const POS_2: number = 2020;

// with help from
// https://github.com/sasa1977/aoc/blob/master/lib/2019/201922.ex
// https://github.com/metalim/metalim.adventofcode.2019.python/blob/master/22_cards_shuffle.ipynb
// https://www.geeksforgeeks.org/multiplicative-inverse-under-modulo-m/

function shuffleInv(input: string): AB {
    const rr = input.split('\n').reduceRight((p, i) => {
        let a: bigint = BigInt(1);
        let b: bigint = BigInt(0);

        let m = i.match(INCREMENT_REGEX);
        if (m) {
            const z: number = modinv(Number.parseInt(m[1]), DECK_COUNT_2);
            a = p[0] * BigInt(z) % BigInt(DECK_COUNT_2);
            b = p[1] * BigInt(z) % BigInt(DECK_COUNT_2);
        } else {
            m = i.match(NEW_STACK_REGEX);
            if (m) {
                a = -p[0];
                b = BigInt(DECK_COUNT_2) - p[1] - BigInt(1);
            } else {
                m = i.match(CUT_REGEX);
                if (m) {
                    a = p[0];
                    b = (p[1] + BigInt(Number.parseInt(m[1]))) % BigInt(DECK_COUNT_2);
                } else {
                    throw new Error('deal?')
                }
            }
        }
        const r = [a, b];
        return r;
    }, [BigInt(1), BigInt(0)]);

    return { a: rr[0], b: rr[1] };
}

function expSquare(a: bigint, b: bigint, pos: number): AB {
    if (pos === 0) {
        return { a: BigInt(1), b: BigInt(0) }
    }
    if (pos % 2 === 0) {
        return expSquare(a * a % BigInt(DECK_COUNT_2), (a * b + b) % BigInt(DECK_COUNT_2), Math.floor(pos / 2));
    } else {
        const cd: AB = expSquare(a, b, pos - 1);
        return { a: a * cd.a % BigInt(DECK_COUNT_2), b: (a * cd.b + b) % BigInt(DECK_COUNT_2) }
    }
}

const ab2: AB = shuffleInv(INPUT_22);
console.log(ab2, norm((ab2.a * BigInt(POS_2) + ab2.b) % BigInt(DECK_COUNT_2), DECK_COUNT_2));

const ab22: AB = expSquare(ab2.a, ab2.b, 101741582076661);
console.log(ab22, norm((ab22.a * BigInt(POS_2) + ab22.b) % BigInt(DECK_COUNT_2), DECK_COUNT_2));

function modinv(a: number, m: number) {
    let m0: number = m;
    let y: number = 0;
    let x: number = 1;

    if (m === 1) {
        return 0;
    }

    while (a > 1) {
        let q: number = Math.floor(a / m);

        let t: number = m;

        m = a % m;
        a = t;
        t = y;

        y = x - q * y;
        x = t;
    }

    if (x < 0) {
        x += m0;
    }
    return x;
}
