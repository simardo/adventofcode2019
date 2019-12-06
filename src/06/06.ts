import { INPUT_06 } from "./input";

console.log('06 décembre');

type OrbDict = { [key: string]: Orb };

const dict: OrbDict = {};

class Orb {
    public orbitIn: string | undefined;
    public orbitsOut: string[] = [];

    public index: string[];

    constructor(public key: string) {
    }

    public setOrbitIn(obj: Orb): void {
        if (this.orbitIn !== undefined) {
            throw Error('orbit-in already set');
        }
        this.orbitIn = obj.key;
        obj.setOrbitOut(this);
    }

    public setOrbitOut(obj: Orb): void {
        if (this.orbitsOut.indexOf(obj.key) >= 0) {
            throw Error('orbit-out already set');
        }
        this.orbitsOut.push(obj.key);
    }

    public calcOrbits(): number {
        return this.orbitIn === undefined ? 0 : 1 + dict[this.orbitIn].calcOrbits();
    }

    public setIndex(index: string[]) {
        this.index = [...index];
        this.index.push(this.key);
        this.orbitsOut.forEach(o => dict[o].setIndex(this.index));
    }
}

function getOrb(key: string): Orb {
    let obj: Orb | undefined = dict[key];
    if (obj === undefined) {
        obj = new Orb(key);
        dict[key] = obj;
    }
    return obj;
}

INPUT_06.split('\n').map(o => o.split(')')).forEach(o => {
    const obj: Orb = getOrb(o[0]);
    const orbiter: Orb = getOrb(o[1]);

    orbiter.setOrbitIn(obj);
});

console.log('part1');

console.log(Object.keys(dict).reduce((count, k) => count += dict[k].calcOrbits(), 0));

console.log('part2');

const COM: Orb = dict['COM'];

COM.setIndex([]);

const YOU: Orb = dict['YOU'];
const SAN: Orb = dict['SAN'];

let commonPath: number = 0;

for (let i: number = 0; i < Math.min(YOU.index.length, SAN.index.length); i++) {
    if (YOU.index[i] === SAN.index[i]) {
        commonPath++;
    } else {
        break;
    }
}

const moveYouToCommon: number = Math.abs(YOU.index.length - commonPath) - 1;
const moveCommonToSanta: number = Math.abs(SAN.index.length - commonPath) - 1;

console.log(moveYouToCommon + moveCommonToSanta);
