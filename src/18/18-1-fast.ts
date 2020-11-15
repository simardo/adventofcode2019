import { INPUT_18, INPUT_18_V, INPUT_18_W, INPUT_18_X, INPUT_18_Y, INPUT_18_Z } from './input';

type Coord = {
    x: number;
    y: number;
}

type TunnelTile = {
    t: string;
    c: Coord;
};

type Connection = {
    stt: SuperTunnelTile;
    d: number;
}

type SuperTunnelTile = {
    t: string;
    c: { [key: string]: Connection };
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
    return `t:${ttk.tile.t},k:${ttk.keys}`;
}

function getKeyX(ttk: TunnelTileKeys): string {
    return `x:${ttk.tile.c.x},y:${ttk.tile.c.y},k:${ttk.keys}`;
}

function getKeyring(tile: SuperTunnelTile, keys: number): number {
    const isKey: boolean = tile.t !== '@' && tile.t !== '#' && tile.t !== '.' && tile.t.toLowerCase() === tile.t;
    if (isKey) {
        const k: string = tile.t;
        return keys | Math.pow(2, k.charCodeAt(0) - 'a'.charCodeAt(0));
    } else {
        return keys;
    }
}

function canMoveTo(tile: SuperTunnelTile, keys: number): boolean {
    const isDoor: boolean = tile.t !== '@' && tile.t !== '#' && tile.t !== '.' && tile.t.toUpperCase() === tile.t;
    if (isDoor) {
        const k: number = Math.pow(2, tile.t.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0));
        return (keys & k) === k;
    } else {
        return true;
    }
}

function dijkstra(from: SuperTunnelTile, keyCount: number): SuperDijNode | undefined {
    const scoredNodes: SuperDijScore = {};
    const visitedNodes: SuperDijScore = {};

    const tile0: SuperTunnelTileKeys = { tile: from, keys: 0 };
    const node0: SuperDijNode = { tt: tile0, score: 0 };
    scoredNodes[getKey(tile0)] = node0;

    let completed: boolean = false;

    let maxKeys: number = 0;
    for (let mk: number = 0; mk < keyCount; mk++) {
        maxKeys |= Math.pow(2, mk);
    }

    while (!completed) {
        const node: SuperDijNode = Object.values(scoredNodes).reduce((p, sn) => p === undefined || sn.score < p.score ? sn : p, undefined!);

        const fn: (c: Connection) => void = (c => {
            if (canMoveTo(c.stt, node.tt.keys)) {
                const next: SuperTunnelTileKeys = { tile: c.stt, keys: getKeyring(c.stt, node.tt.keys) };

                const k: string = getKey(next);
                let cn: SuperDijNode | undefined = scoredNodes[k];
                let cnv: SuperDijNode | undefined = visitedNodes[k];

                if (cn === undefined && cnv === undefined) {
                    cn = { tt: next, score: Number.MAX_VALUE };
                    scoredNodes[k] = cn;
                }
                if (cn) {
                    const newScore: number = node.score + c.d;
                    if (newScore < cn.score) {
                        cn.score = newScore;
                        cn.parent = node;
                    }
                }
            }
        });

        if (node) {
            Object.values(node.tt.tile.c).forEach(c => fn(c));

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

function doPart1(input: string): void {
    const map: TunnelTile[][] = buildMap(input);

    render(map);

    const keys: TunnelTile[] | undefined = map.reduce((p, y) => {
        return p.concat(y.reduce((pp, t) => {
            if (t.t !== '@' && t.t !== '#' && t.t !== '.' && t.t.toLowerCase() == t.t) {
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

    const mapSet: { [key: string]: SuperTunnelTile } = {};
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
            let root: SuperTunnelTile | undefined = undefined;
            p.reverse().forEach(pp => {
                weight++;
                if (pp !== '.') {
                    let node: SuperTunnelTile = mapSet[pp];
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

    console.log(mapSet['@']);

    const numKeys: number = map.reduce((p, y) => p + y.reduce((p, x) => x.t !== '@' && x.t !== '#' && x.t !== '.' && x.t.toLowerCase() === x.t ? p + 1 : p, 0), 0);

    let r: SuperDijNode | undefined = dijkstra(mapSet['@'], numKeys);
    console.log(r);
}

doPart1(INPUT_18);
