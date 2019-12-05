import { TEST_1, TEST_2, TEST_3, TEST_4, TEST_5, TEST_6, TEST_7, TEST_8, TEST_9, TEST_0 } from "./input";

console.log('04 décembre');

console.log('part 1');
function validate1(password: number): boolean {
    const s: string = password.toString();
    return validateIncrease(s) && validateDoubleDigit1(s);
}

function validateIncrease(s: string): boolean {
    return [...s].every((d, i, a) => i === 0 || d >= a[i - 1]);
}

function validateDoubleDigit1(s: string): boolean {
    return [...s].some((d, i, a) => i > 0 && d === a[i - 1]);
}

// console.log(validate(TEST_1));
// console.log(validate(TEST_2));
// console.log(validate(TEST_3));
// console.log(validate(TEST_4));
// console.log(validate(TEST_5));
// console.log(validate(TEST_6));

let count1: number = 0;

for (let i: number = 128392; i <= 643281; i++) {
    if (validate1(i)) {
        count1++;
    }
}

console.log(count1);

console.log('part 2');

// console.log(TEST_1, validate2(TEST_1));
// console.log(TEST_2, validate2(TEST_2));
// console.log(TEST_3, validate2(TEST_3));
// console.log(TEST_4, validate2(TEST_4));
// console.log(TEST_5, validate2(TEST_5));
// console.log(TEST_6, validate2(TEST_6));
// console.log(TEST_7, validate2(TEST_7));
// console.log(TEST_8, validate2(TEST_8));
// console.log(TEST_9, validate2(TEST_9));
// console.log(TEST_0, validate2(TEST_0));

function validate2(password: number): boolean {
    const s: string = password.toString();
    return validateIncrease(s) && validateDoubleDigit2(s);
}

function validateDoubleDigit2(s: string): boolean {
    let repeat: number = 0;
    try {
        [...s].forEach((d, i, a) => {
            if (i > 0) {
                if (d === a[i - 1]) {
                    repeat++;
                } else if (repeat === 1) {
                    throw Error;
                } else {
                    repeat = 0;
                }
            }
        });
    } catch (e) {
        // eat
    }
    return repeat === 1;
}

let count2: number = 0;

for (let i: number = 128392; i <= 643281; i++) {
    if (validate2(i)) {
        count2++;
    }
}

console.log(count2);
