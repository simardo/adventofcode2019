import { INPUT_14 } from "./input";

console.log('14 décembre');

const RXG: RegExp = /((\d+)\s(\w+))/g;
const RX: RegExp = /((\d+)\s(\w+))/;

class Element {
    private inv: number = 0;

    constructor(public targetInv: number, public n: string) {
    }

    public consume(q: number): void {
        while (this.inv < q) {
            dict[this.n].produce();
            this.inv += this.targetInv;
        }
        this.inv -= q;
        if (this.inv < 0) {
            throw new Error('negative inventory');
        }
    }
}

let totORE: number = 0;

class ReactionElement {
    constructor(public q: number,
        public n: string) {
    }

    public consume(): void {
        if (this.n === 'ORE') {
            totORE += this.q;
        } else {
            inventory[this.n].consume(this.q);
        }
    }
}

class Reaction {
    public elements: ReactionElement[] = [];
    public result: Element;

    public produce(): void {
        this.elements.forEach(e => e.consume());
    }
}

const dict: { [key: string]: Reaction } = {};
const inventory: { [key: string]: Element } = {};

const reactions = INPUT_14.split('\n')
    .map(v => v.match(RXG))
    .map(v => v!.map(s => s.match(RX)))
    .map(r => r.reduce((acc, e, i) => {
        if (i == r.length - 1) {
            const el: Element = new Element(Number.parseInt(e![2]), e![3]);
            acc.result = el;
            if (dict[el.n]) {
                throw Error('reaction exists');
            }
            dict[el.n] = acc;
            inventory[el.n] = el;
        } else {
            const rel: ReactionElement = new ReactionElement(Number.parseInt(e![2]), e![3]);
            acc.elements.push(rel)
        }
        return acc;
    }, new Reaction())
    );

const fuel: Reaction = dict['FUEL'];

console.log('part 1');
fuel.produce();
console.log(totORE);

console.log('part 2');
totORE = 0;

let totFuel: number = 0;
while (totORE < 1000000000000) {
    fuel.produce();
    totFuel++;
}
console.log(totORE);
console.log(totFuel);
