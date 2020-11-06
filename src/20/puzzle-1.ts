import { INPUT_20 } from "./input";

console.log('DAY 20');

type Coord = {
    x: number;
    y: number;
}

type MazeTile = {
    type: string;
    c: Coord;
};

type DijNode = {
    mt: MazeTile;
    parent?: DijNode;
    score: number;
    visited?: boolean;
    destination?: boolean;
}

type DijScore = { [key: string]: DijNode }

function getKey(mt: MazeTile): string {
    return `x:${mt.c.x},y:${mt.c.y}`;
}

function buildMaze(input: string): MazeTile[][] {
    return input.split('\n').map((l, y) => [...l].map((ll, x) => {
        return { c: { x: x, y: y }, type: ll };
    }));
}

function dijkstra(map: MazeTile[][], from: MazeTile, to: MazeTile): DijNode | undefined {
    const scoredNodes: DijScore = {};
    const visitedNodes: DijScore = {};

    const node0: DijNode = { mt: from, score: 0 };
    scoredNodes[getKey(from)] = node0;

    let completed: boolean = false;

    while (!completed) {
        const node: DijNode = Object.values(scoredNodes).reduce((p, sn) => p === undefined || sn.score < p.score ? sn : p, undefined!);

        const fn: (x: number, y: number) => void = ((x, y) => {
            if (x >= 0 && y >= 0 && map[y] !== undefined && map[y][x] !== undefined && map[y][x].type !== '#' && map[y][x].type !== ' ') {
                const n: MazeTile | undefined = map[y][x].type === '.' || map[y][x].type === to.type || map[y][x].type === from.type ? map[y][x] : map.reduce((pp, yy) => {
                    const mt: MazeTile | undefined = yy.find(t => t.type === map[y][x].type && t.c.x !== x && t.c.y !== y);
                    return mt !== undefined ? mt : pp;
                }, undefined);

                if (n) {
                    const k: string = getKey(n);
                    let cn: DijNode | undefined = scoredNodes[k];
                    let cnv: DijNode | undefined = visitedNodes[k];

                    if (cn === undefined && cnv === undefined) {
                        cn = { mt: n, score: Number.MAX_VALUE, destination: n.type === to.type };
                        scoredNodes[k] = cn;
                    }
                    if (cn) {
                        const newScore: number = node.score + ((n.type === '.' || n.type === to.type || n.type === from.type) ? 1 : 2);
                        if (newScore < cn.score) {
                            cn.score = newScore;
                            cn.parent = node;
                        }
                    }
                }
            }
        });

        if (node) {
            fn(node.mt.c.x, node.mt.c.y - 1);
            fn(node.mt.c.x - 1, node.mt.c.y);
            fn(node.mt.c.x + 1, node.mt.c.y);
            fn(node.mt.c.x, node.mt.c.y + 1);

            node.visited = true;
            const k: string = getKey(node.mt);
            delete scoredNodes[k];
            visitedNodes[k] = node;

            completed = node.visited === true && node.destination === true;
        } else {
            completed = true;
        }
    }

    const p: DijNode | undefined = Object.values(visitedNodes).find(f => f.destination === true);

    return p;
}

doPart1(INPUT_20);

export function doPart1(input: string): void {
    const maze: MazeTile[][] = buildMaze(input);

    const entrance: MazeTile | undefined = maze.reduce((p, y) => {
        const mt: MazeTile | undefined = y.find(t => t.type === '!');
        return mt !== undefined ? mt : p;
    }, undefined);

    const exit: MazeTile | undefined = maze.reduce((p, y) => {
        const mt: MazeTile | undefined = y.find(t => t.type === '?');
        return mt !== undefined ? mt : p;
    }, undefined);

    let r: DijNode | undefined = dijkstra(maze, entrance!, exit!);
    console.log(r);
}
