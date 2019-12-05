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

let count1: number = 0;

for (let i: number = 128392; i <= 643281; i++) {
    if (validate1(i)) {
        count1++;
    }
}

console.log(count1);

console.log('part 2');
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
