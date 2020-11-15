import { INPUT_18, INPUT_18_V, INPUT_18_W, INPUT_18_X, INPUT_18_Y, INPUT_18_Z } from './input';

type Coord = {
    x: number;
    y: number;
}

type TunnelTile = {
    t: string;
    c: Coord;
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

type TunnelTileKeys = {
    tile: TunnelTile;
    keys: number;
}

type DijNode = {
    tt: TunnelTileKeys;
    parent?: DijNode;
    score: number;
    visited?: boolean;
    hasAllKeys?: boolean;
}

type DijScore = { [key: string]: DijNode }

function getKey(ttk: TunnelTileKeys): string {
    return `x:${ttk.tile.c.x},y:${ttk.tile.c.y},k:${ttk.keys}`;
}

function getKeyring(tile: TunnelTile, keys: number): number {
    const isKey: boolean = tile.t !== '@' && tile.t !== '#' && tile.t !== '.' && tile.t.toLowerCase() === tile.t;
    if (isKey) {
        const k: string = tile.t;
        return keys | Math.pow(2, k.charCodeAt(0) - 'a'.charCodeAt(0));
    } else {
        return keys;
    }
}

function canMoveTo(tile: TunnelTile, keys: number): boolean {
    const isDoor: boolean = tile.t !== '@' && tile.t !== '#' && tile.t !== '.' && tile.t.toUpperCase() === tile.t;
    if (isDoor) {
        const k: number = Math.pow(2, tile.t.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0));
        return (keys & k) === k;
    } else {
        return true;
    }
}

function dijkstra(map: TunnelTile[][], from: TunnelTile, keyCount: number): DijNode | undefined {
    const scoredNodes: DijScore = {};
    const visitedNodes: DijScore = {};

    const tile0: TunnelTileKeys = { tile: from, keys: 0 };
    const node0: DijNode = { tt: tile0, score: 0 };
    scoredNodes[getKey(tile0)] = node0;

    let completed: boolean = false;

    let maxKeys: number = 0;
    for (let mk: number = 0; mk < keyCount; mk++) {
        maxKeys |= Math.pow(2, mk);
    }

    while (!completed) {
        const node: DijNode = Object.values(scoredNodes).reduce((p, sn) => p === undefined || sn.score < p.score ? sn : p, undefined!);

        const fn: (x: number, y: number) => void = ((x, y) => {
            if (x >= 0 && y >= 0 && map[y][x] !== undefined && map[y][x].t !== '#') {
                const n: TunnelTile = map[y][x];
                if (canMoveTo(n, node.tt.keys)) {
                    const next: TunnelTileKeys = { tile: n, keys: getKeyring(n, node.tt.keys) };

                    const k: string = getKey(next);
                    let cn: DijNode | undefined = scoredNodes[k];
                    let cnv: DijNode | undefined = visitedNodes[k];

                    if (cn === undefined && cnv === undefined) {
                        cn = { tt: next, score: Number.MAX_VALUE };
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
            const k: string = getKey(node.tt);
            delete scoredNodes[k];
            visitedNodes[k] = node;

            node.hasAllKeys = node.tt.keys === maxKeys;

            completed = node.visited === true && node.hasAllKeys === true;
        } else {
            completed = true;
        }
    }

    let p: DijNode | undefined = Object.values(visitedNodes).find(f => f.hasAllKeys);

    return p;
}

function doPart1(input: string): void {
    const map: TunnelTile[][] = buildMap(input);

    render(map);

    const entrance: TunnelTile | undefined = map.reduce((p, y) => {
        const f: TunnelTile | undefined = y.find(t => t.t === '@');
        return f !== undefined ? f : p;
    }, undefined);

    const keys: number = map.reduce((p, y) => p + y.reduce((p, x) => x.t !== '@' && x.t !== '#' && x.t !== '.' && x.t.toLowerCase() === x.t ? p + 1 : p, 0), 0);

    console.log(entrance!);
    console.log(keys);

    let r: DijNode | undefined = dijkstra(map, entrance!, keys);
    console.log(r);

    const path: string[] = [];
    while (r) {
        if (r.tt.tile.t !== '.') {
            path.push(r.tt.tile.t);
        }
        r = r.parent;
    }

    console.log(path.reverse().join(' '));
}

doPart1(INPUT_18);
