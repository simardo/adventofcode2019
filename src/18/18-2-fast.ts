import { INPUT_18, INPUT_18_2_Z, INPUT_18_V, INPUT_18_W, INPUT_18_X, INPUT_18_Y, INPUT_18_Z, INPUT_18_2_Y, INPUT_18_2_X, INPUT_18_2_W, INPUT_18_2 } from './input';

type Coord = {
    x: number;
    y: number;
}

type TunnelTile = {
    t: string;
    c: Coord;
};

type Connection = {
    stt: SuperTunnelTileMap;
    d: number;
}

type SuperTunnelTileMap = {
    t: string;
    c: { [key: string]: Connection };
};

type SuperTunnelTile = {
    t1: SuperTunnelTileMap;
    t2: SuperTunnelTileMap;
    t3: SuperTunnelTileMap;
    t4: SuperTunnelTileMap;
};

function buildMap(input: string): TunnelTile[][] {
    return input.split('\n').map((l, y) => [...l].map((ll, x) => {
        const coord: Coord = { x: x, y: y };

        return { c: coord, t: ll };
    }));
}

function render(map: TunnelTile[][]): void {
    console.log(map.map(l => l.map(c => c.t).join('')).join('\n'));
}

type SuperTunnelTileKeys = {
    tile: SuperTunnelTile;
    keys: number;
}

type TunnelTileKeys = {
    tile: TunnelTile;
    keys: number;
}

type SuperDijNode = {
    tt: SuperTunnelTileKeys;
    parent?: SuperDijNode;
    score: number;
    visited?: boolean;
    hasAllKeys?: boolean;
    prev?: SuperDijNode;
    next?: SuperDijNode;
}

type DijNode = {
    tt: TunnelTileKeys;
    parent?: DijNode;
    score: number;
    visited?: boolean;
    destination?: boolean;
}

type SuperDijScore = { [key: string]: SuperDijNode }

type DijScore = { [key: string]: DijNode }

function getKey(ttk: SuperTunnelTileKeys): string {
    return `t1:${ttk.tile.t1.t},t2:${ttk.tile.t2.t},t3:${ttk.tile.t3.t},t4:${ttk.tile.t4.t},k:${ttk.keys}`;
}

function getKeyX(ttk: TunnelTileKeys): string {
    return `x:${ttk.tile.c.x},y:${ttk.tile.c.y},k:${ttk.keys}`;
}

function getKeyring(tile: SuperTunnelTileMap, keys: number): number {
    const isKey: boolean = tile.t !== '1' && tile.t !== '2' && tile.t !== '3' && tile.t !== '4' && tile.t !== '#' && tile.t !== '.' && tile.t.toLowerCase() === tile.t;
    if (isKey) {
        const k: string = tile.t;
        return keys | Math.pow(2, k.charCodeAt(0) - 'a'.charCodeAt(0));
    } else {
        return keys;
    }
}

function canMoveTo(tile: SuperTunnelTileMap, keys: number): boolean {
    const isDoor: boolean = tile.t !== '1' && tile.t !== '2' && tile.t !== '3' && tile.t !== '4' && tile.t !== '#' && tile.t !== '.' && tile.t.toUpperCase() === tile.t;
    if (isDoor) {
        const k: number = Math.pow(2, tile.t.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0));
        return (keys & k) === k;
    } else {
        return true;
    }
}

function swap(heap: SuperDijNode[], oldX: number, newX: number): number {
    const temp: SuperDijNode = heap[newX];
    heap[newX] = heap[oldX];
    heap[oldX] = temp;

    return newX;
}

function percolateDown(heap: SuperDijNode[]): void {
    let x: number | undefined = 1;

    while (x !== undefined) {
        const root: SuperDijNode | undefined = heap[x];
        const childLeft: SuperDijNode = heap[2 * x];
        const childRight: SuperDijNode = heap[(2 * x) + 1];

        if (childRight && childRight.score < root.score && childRight.score < childLeft.score) {
            x = swap(heap, x, (2 * x) + 1);
        } else if (childLeft && childLeft.score < root.score) {
            x = swap(heap, x, 2 * x);
        } else {
            x = undefined;
        }
    }
}

function percolateUp(heap: SuperDijNode[]): void {
    let x: number | undefined = heap.length - 1;

    while (x !== undefined) {
        const leaf: SuperDijNode | undefined = heap[x];
        const parent: SuperDijNode = heap[Math.floor(x / 2)];
        if (parent && parent.score > leaf.score) {
            x = swap(heap, x, Math.floor(x / 2));
        } else {
            x = undefined;
        }
    }
}

function dequeueFrom(heap: SuperDijNode[]): SuperDijNode {
    const result: SuperDijNode = heap.length <= 2 ? heap.pop()! : heap[1];
    if (heap.length > 2) {
        heap[1] = heap.pop()!;
        percolateDown(heap);
    }

    return result;
}

function enqueueTo(heap: SuperDijNode[], node: SuperDijNode): void {
    heap.push(node);
    percolateUp(heap);
}

function dijkstra(from: SuperTunnelTile, keyCount: number): SuperDijNode | undefined {
    const scoredNodes: SuperDijScore = {};
    const visitedNodes: SuperDijScore = {};

    const heap: SuperDijNode[] = [undefined as unknown as SuperDijNode];

    const tile0: SuperTunnelTileKeys = { tile: from, keys: 0 };
    const node0: SuperDijNode = { tt: tile0, score: 0 };
    scoredNodes[getKey(tile0)] = node0;
    heap.push(node0);

    let completed: boolean = false;

    let maxKeys: number = 0;
    for (let mk: number = 0; mk < keyCount; mk++) {
        maxKeys |= Math.pow(2, mk);
    }

    while (!completed) {
        const node: SuperDijNode = dequeueFrom(heap);

        const fn: (c: Connection, q: number) => void = ((c, q) => {
            const sttm: SuperTunnelTileMap = c.stt;
            if (canMoveTo(sttm, node.tt.keys)) {
                const next: SuperTunnelTileKeys = {
                    tile: {
                        t1: q === 1 ? sttm : node.tt.tile.t1,
                        t2: q === 2 ? sttm : node.tt.tile.t2,
                        t3: q === 3 ? sttm : node.tt.tile.t3,
                        t4: q === 4 ? sttm : node.tt.tile.t4
                    },
                    keys: getKeyring(sttm, node.tt.keys)
                };

                const k: string = getKey(next);
                let cn: SuperDijNode | undefined = scoredNodes[k];
                let cnv: SuperDijNode | undefined = visitedNodes[k];

                if (cn === undefined && cnv === undefined) {
                    cn = { tt: next, score: Number.MAX_VALUE };
                    scoredNodes[k] = cn;
                    enqueueTo(heap, cn);
                }
                if (cn) {
                    const newScore: number = node.score + c.d;
                    if (newScore < cn.score) {
                        cn.score = newScore;
                        cn.parent = node;
                        percolateUp(heap);
                    }
                }
            }
        });

        if (node) {
            Object.values(node.tt.tile.t1.c).forEach(c => fn(c, 1));
            Object.values(node.tt.tile.t2.c).forEach(c => fn(c, 2));
            Object.values(node.tt.tile.t3.c).forEach(c => fn(c, 3));
            Object.values(node.tt.tile.t4.c).forEach(c => fn(c, 4));

            node.visited = true;
            const k: string = getKey(node.tt);
            delete scoredNodes[k];

            visitedNodes[k] = node;

            node.hasAllKeys = node.tt.keys === maxKeys;

            completed = node.visited === true && node.hasAllKeys === true;
        } else {
            completed = true;
        }
    }

    let p: SuperDijNode | undefined = Object.values(visitedNodes).find(f => f.hasAllKeys);

    return p;
}

function dijkstraX(map: TunnelTile[][], from: TunnelTile, to: TunnelTile): DijNode | undefined {
    const scoredNodes: DijScore = {};
    const visitedNodes: DijScore = {};

    const tile0: TunnelTileKeys = { tile: from, keys: 0 };
    const node0: DijNode = { tt: tile0, score: 0 };
    scoredNodes[getKeyX(tile0)] = node0;

    let completed: boolean = false;

    while (!completed) {
        const node: DijNode = Object.values(scoredNodes).reduce((p, sn) => p === undefined || sn.score < p.score ? sn : p, undefined!);

        const fn: (x: number, y: number) => void = ((x, y) => {
            if (x >= 0 && y >= 0 && map[y][x] !== undefined && map[y][x].t !== '#') {
                const n: TunnelTile = map[y][x];
                if (n) {
                    const next: TunnelTileKeys = { tile: n, keys: 0 };

                    const k: string = getKeyX(next);
                    let cn: DijNode | undefined = scoredNodes[k];
                    let cnv: DijNode | undefined = visitedNodes[k];

                    if (cn === undefined && cnv === undefined) {
                        cn = { tt: next, score: Number.MAX_VALUE, destination: n.c.x === to.c.x && n.c.y === to.c.y };
                        scoredNodes[k] = cn;
                    }
                    if (cn) {
                        const newScore: number = node.score + 1;
                        if (newScore < cn.score) {
                            cn.score = newScore;
                            cn.parent = node;
                        }
                    }
                }
            }
        });

        if (node) {
            fn(node.tt.tile.c.x, node.tt.tile.c.y - 1);
            fn(node.tt.tile.c.x - 1, node.tt.tile.c.y);
            fn(node.tt.tile.c.x + 1, node.tt.tile.c.y);
            fn(node.tt.tile.c.x, node.tt.tile.c.y + 1);

            node.visited = true;
            const k: string = getKeyX(node.tt);
            delete scoredNodes[k];
            visitedNodes[k] = node;

            completed = node.visited === true && node.destination === true;
        } else {
            completed = true;
        }
    }

    let p: DijNode | undefined = Object.values(visitedNodes).find(f => f.destination === true);

    return p;
}

function doPart2(input: string): void {
    const map: TunnelTile[][] = buildMap(input);

    render(map);

    const keys: TunnelTile[] | undefined = map.reduce((p, y) => {
        return p.concat(y.reduce((pp, t) => {
            if (t.t !== '1' && t.t !== '2' && t.t !== '3' && t.t !== '4' && t.t !== '#' && t.t !== '.' && t.t.toLowerCase() == t.t) {
                pp.push(t);
            }
            return pp;
        }, [] as TunnelTile[]));
    }, [] as TunnelTile[]);

    const doors: TunnelTile[] | undefined = map.reduce((p, y) => {
        return p.concat(y.reduce((pp, t) => {
            if (t.t !== '#' && t.t !== '.' && t.t.toUpperCase() == t.t) {
                pp.push(t);
            }
            return pp;
        }, [] as TunnelTile[]));
    }, [] as TunnelTile[]);

    const mapSet: { [key: string]: SuperTunnelTileMap } = {};
    const keysDoors: TunnelTile[] = keys.concat(doors);

    keysDoors.forEach(kd => {
        const from: TunnelTile | undefined = map.reduce((p, y) => {
            const f: TunnelTile | undefined = y.find(t => t.t === kd.t);
            return f !== undefined ? f : p;
        }, undefined);

        keysDoors.filter(f => f.t !== kd.t).forEach(i => {
            const to: TunnelTile | undefined = map.reduce((p, y) => {
                const f: TunnelTile | undefined = y.find(t => t.t === i.t);
                return f !== undefined ? f : p;
            }, undefined);

            const rx: DijNode | undefined = dijkstraX(map, from!, to!);
            const p: string[] = [];
            let parent: DijNode | undefined = rx;
            while (parent) {
                p.push(parent.tt.tile.t);
                parent = parent.parent;
            }

            let weight: number = 0;
            let root: SuperTunnelTileMap | undefined = undefined;
            p.reverse().forEach(pp => {
                weight++;
                if (pp !== '.') {
                    let node: SuperTunnelTileMap = mapSet[pp];
                    if (node === undefined) {
                        node = { t: pp, c: {} };
                        mapSet[pp] = node;
                    }
                    if (root !== undefined && root.c[pp] === undefined) {
                        root.c[pp] = { stt: node, d: weight };
                    }
                    root = node;
                    weight = 0;
                }
            });
        });
    });

    const numKeys: number = map.reduce((p, y) => p + y.reduce((p, x) => x.t !== '1' && x.t !== '2' && x.t !== '3' && x.t !== '4' && x.t !== '#' && x.t !== '.' && x.t.toLowerCase() === x.t ? p + 1 : p, 0), 0);
    const from: SuperTunnelTile = {
        t1: mapSet['1'],
        t2: mapSet['2'],
        t3: mapSet['3'],
        t4: mapSet['4']
    }

    let r: SuperDijNode | undefined = dijkstra(from, numKeys);
    console.log(r);
}

doPart2(INPUT_18_2);
