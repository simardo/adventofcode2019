import { INPUT_20_2 } from "./input";

console.log('DAY 20');

type Coord = {
    x: number;
    y: number;
}

type MazeTile = {
    type: string;
    c: Coord;
};

type MazeTileLevel = {
    mt: MazeTile;
    level: number;
};

type DijNode = {
    mtl: MazeTileLevel;
    parent?: DijNode;
    score: number;
    visited?: boolean;
    destination?: boolean;
}

type DijScore = { [key: string]: DijNode }

function getKey(mtl: MazeTileLevel): string {
    return `x:${mtl.mt.c.x},y:${mtl.mt.c.y},l:${mtl.level}`;
}

function buildMaze(input: string): MazeTile[][] {
    return input.split('\n').map((l, y) => [...l].map((ll, x) => {
        return { c: { x: x, y: y }, type: ll };
    }));
}

function dijkstra(map: MazeTile[][], from: MazeTileLevel, to: MazeTileLevel): DijNode | undefined {
    const scoredNodes: DijScore = {};
    const visitedNodes: DijScore = {};

    const node0: DijNode = { mtl: from, score: 0 };
    scoredNodes[getKey(from)] = node0;

    let completed: boolean = false;

    while (!completed) {
        const node: DijNode = Object.values(scoredNodes).reduce((p, sn) => p === undefined || sn.score < p.score ? sn : p, undefined!);

        const fn: (x: number, y: number) => void = ((x, y) => {
            if (x >= 0 && y >= 0 && map[y] !== undefined && map[y][x] !== undefined && map[y][x].type !== '#' && map[y][x].type !== ' ') {
                let n: MazeTileLevel | undefined;
                if (map[y][x].type === '.') {
                    n = { mt: map[y][x], level: node.mtl.level };
                } else if (map[y][x].type === to.mt.type || map[y][x].type === from.mt.type) {
                    if (node.mtl.level === 0) {
                        n = { mt: map[y][x], level: node.mtl.level };
                    } else {
                        n = undefined;
                    }
                } else if (map[y][x].type.toLowerCase() === map[y][x].type) {
                    n = {
                        mt: map.reduce((pp, yy) => {
                            const mt: MazeTile | undefined = yy.find(t => t.type === map[y][x].type.toUpperCase());
                            return mt !== undefined ? mt : pp;
                        }, undefined) as MazeTile, level: node.mtl.level + 1
                    };
                } else if (map[y][x].type.toUpperCase() === map[y][x].type) {
                    if (node.mtl.level === 0) {
                        n = undefined;
                    } else {
                        n = {
                            mt: map.reduce((pp, yy) => {
                                const mt: MazeTile | undefined = yy.find(t => t.type === map[y][x].type.toLowerCase());
                                return mt !== undefined ? mt : pp;
                            }, undefined) as MazeTile, level: node.mtl.level - 1
                        };
                    }
                } else {
                    n = { mt: map[y][x], level: node.mtl.level };
                }

                if (n) {
                    const k: string = getKey(n);
                    let cn: DijNode | undefined = scoredNodes[k];
                    let cnv: DijNode | undefined = visitedNodes[k];

                    if (cn === undefined && cnv === undefined) {
                        cn = { mtl: n, score: Number.MAX_VALUE, destination: n.mt.type === to.mt.type };
                        scoredNodes[k] = cn;
                    }
                    if (cn) {
                        const newScore: number = node.score + ((n.mt.type === '.' || n.mt.type === to.mt.type || n.mt.type === from.mt.type) ? 1 : 2);
                        if (newScore < cn.score) {
                            cn.score = newScore;
                            cn.parent = node;
                        }
                    }
                }
            }
        });

        if (node) {
            fn(node.mtl.mt.c.x, node.mtl.mt.c.y - 1);
            fn(node.mtl.mt.c.x - 1, node.mtl.mt.c.y);
            fn(node.mtl.mt.c.x + 1, node.mtl.mt.c.y);
            fn(node.mtl.mt.c.x, node.mtl.mt.c.y + 1);

            node.visited = true;
            const k: string = getKey(node.mtl);
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

doPart2(INPUT_20_2);

export function doPart2(input: string): void {
    const maze: MazeTile[][] = buildMaze(input);

    const entrance: MazeTile | undefined = maze.reduce((p, y) => {
        const mt: MazeTile | undefined = y.find(t => t.type === '!');
        return mt !== undefined ? mt : p;
    }, undefined);

    const exit: MazeTile | undefined = maze.reduce((p, y) => {
        const mt: MazeTile | undefined = y.find(t => t.type === '?');
        return mt !== undefined ? mt : p;
    }, undefined);

    console.log(entrance, exit);

    let r: DijNode | undefined = dijkstra(maze, { mt: entrance!, level: 0 }, { mt: exit!, level: 0 });
    console.log(r);
}
