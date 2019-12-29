import { INPUT_22_Z, INPUT_22_Y, INPUT_22_X, INPUT_22_W, INPUT_22 } from "./input";

console.log('22 décembre 2019');

const INCREMENT_REGEX: RegExp = /deal with increment (\d+)/;
const NEW_STACK_REGEX: RegExp = /deal into new stack/;
const CUT_REGEX: RegExp = /cut (-?\d+)/;

const DECK_COUNT: number = 10007;
let deck: number[] = [];

for (let i = 0; i < DECK_COUNT; i++) {
    deck.push(i)
}

INPUT_22.split('\n').forEach(i => {
    let m = i.match(INCREMENT_REGEX);
    if (m) {
        deck = dealIncrement(Number.parseInt(m[1]));
    } else {
        m = i.match(NEW_STACK_REGEX);
        if (m) {
            deck = dealNewStack();
        } else {
            m = i.match(CUT_REGEX);
            if (m) {
                deck = cut(Number.parseInt(m[1]));
            } else {
                throw new Error('deal?')
            }
        }
    }
});

console.log(deck.indexOf(2019));

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
    const r: number[] = Array(deck.length).fill(0);

    return deck.reverse();
}

function cut(n: number): number[] {
    const r: number[] = [];
    r.push(...deck.splice(n, deck.length - n));
    r.push(...deck);

    return r;
}
