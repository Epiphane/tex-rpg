import { Info, Warning } from "../../attachment";
import User from "../../models/user";
import { glob } from 'glob';
import path = require("path");
import { List, Pasta, Quantity, Sentence } from "../../helpers/lang";

export enum Direction {
    None = 'none',
    Up = 'up',
    Down = 'down',
    Left = 'left',
    Right = 'right',
    North = 'north',
    South = 'south',
    West = 'west',
    East = 'east',
}

const DirectionPhrases: { [key in Direction]: (name: string) => string } = {
    [Direction.None]: () => { throw `Invalid direction`; },
    [Direction.Up]: (name: string) => `${Pasta('up', true, 'upwards')} is ${name}`,
    [Direction.Down]: (name: string) => `${Pasta('down', true, 'downwards')} is ${name}`,
    [Direction.Left]: (name: string) => `to the ${Pasta('left', true)} is ${name}`,
    [Direction.Right]: (name: string) => `to the ${Pasta('right', true)} is ${name}`,
    [Direction.North]: (name: string) => `to the ${Pasta('north', true)} is ${name}`,
    [Direction.South]: (name: string) => `to the ${Pasta('south', true)} is ${name}`,
    [Direction.West]: (name: string) => `to the ${Pasta('west', true)} is ${name}`,
    [Direction.East]: (name: string) => `to the ${Pasta('east', true)} is ${name}`,
};

const Opposite: { [key in Direction]: Direction } = {
    [Direction.None]: Direction.None,
    [Direction.Up]: Direction.Down,
    [Direction.Down]: Direction.Up,
    [Direction.Left]: Direction.Right,
    [Direction.Right]: Direction.Left,
    [Direction.North]: Direction.South,
    [Direction.South]: Direction.North,
    [Direction.West]: Direction.East,
    [Direction.East]: Direction.West,
}

export interface NPCParams {
    name: string;
    count?: number;
    desc: string | ((user: User) => Promise<string> | string);
}

export class NPC {
    name: string;
    count: number;
    private desc: (user: User) => Promise<string> | string;

    constructor({
        name,
        count,
        desc
    }: NPCParams) {
        this.name = name;
        this.count = count ?? 1;

        if (typeof (desc) === 'string') {
            const str = desc;
            desc = () => str;
        }
        this.desc = desc;
    }

    matches(str: string) {
        const regex = new RegExp(`\\b${str}\\b`);
        return Boolean(this.name.toLowerCase().match(regex));
    }

    async look(user: User) {
        const desc = await this.desc(user);
        return new Info([
            `\`${Sentence(this.name)}\``,
            ``,
            ...desc.split('\n')
        ]);
    }
}

export interface PlaceParams {
    id: string;
    name: string;
    desc: string | ((user: User) => Promise<string> | string);
    objects?: (NPCParams | NPC)[];
}

export class Place2 {
    id: string;
    name: string;
    private desc: (user: User) => Promise<string> | string;
    private neighbors: {
        [key in Direction]?: Place;
    } = {};

    private objects: NPC[] = [];

    constructor({
        id,
        name,
        desc,
        objects,
    }: PlaceParams) {
        this.id = id;
        this.name = name;

        if (typeof (desc) === 'string') {
            const str = desc;
            desc = () => str;
        }
        this.desc = desc;

        objects?.forEach(npc =>
            this.objects.push(
                (npc instanceof NPC)
                    ? npc
                    : new NPC(npc)
            )
        );
    }

    Connect(direction: Direction, other: Place, otherDirection?: Direction) {
        if (!otherDirection) {
            otherDirection = Opposite[direction];
        }

        if (direction === Direction.None) {
            throw `Invalid neighbor direction`;
        }

        this.neighbors[direction] = other;

        if (otherDirection !== Direction.None) {
            other.neighbors[otherDirection] = this;
        }
    }

    getNeighbor(direction: Direction) {
        return this.neighbors[direction];
    }

    async look(user: User) {
        const desc = await this.desc(user);
        return new Info([
            `\`${this.name}\``,
            ``,
            ...desc.trim().split('\n').map(line => line.trim()),
            ...this.describeNpcs(user),
            ...this.describeNeighbors(),
        ]);
    }

    lookAt(name: string, user: User) {
        const matches = this.objects.filter(obj => obj.matches(name));
        if (matches.length === 0) {
            return new Warning(`Cannot find \`${name}\``);
        }
        else if (matches.length === 1) {
            return matches[0].look(user);
        }
        else {
            return new Warning(`\`${name}\` is ambiguous. Please be more specific.`);
        }
    }

    describeNpcs(user: User) {
        if (this.objects.length === 0) {
            return [];
        }

        return [
            ``,
            `You see ${List(this.objects.map(object =>
                Quantity(
                    Pasta(`look ${object.name}`, true, object.name),
                    object.count
                )
            ))}.`,
        ]
    }

    describeNeighbors() {
        const descriptions = Object.keys(this.neighbors)
            .map(dir => {
                const { name } = this.neighbors[dir as Direction]!;
                const phraser = DirectionPhrases[dir as Direction];
                return phraser(name);
            });

        const result = List(descriptions);
        if (result === '') {
            return []
        }
        else {
            return ['', Sentence(result)];
        }
    }
}

export abstract class Place {
    id: string;
    name: string;
    // private desc: (user: User) => Promise<string> | string;
    private neighbors: {
        [key in Direction]?: Place;
    } = {};

    private objects: NPC[] = [];

    constructor() {
        // this.id = id;
        // this.name = name;

        // if (typeof (desc) === 'string') {
        //     const str = desc;
        //     desc = () => str;
        // }
        // this.desc = desc;

        // objects?.forEach(npc =>
        //     this.objects.push(
        //         (npc instanceof NPC)
        //             ? npc
        //             : new NPC(npc)
        //     )
        // );
    }

    Connect(direction: Direction, other: Place, otherDirection?: Direction) {
        if (!otherDirection) {
            otherDirection = Opposite[direction];
        }

        if (direction === Direction.None) {
            throw `Invalid neighbor direction`;
        }

        this.neighbors[direction] = other;

        if (otherDirection !== Direction.None) {
            other.neighbors[otherDirection] = this;
        }
    }

    getNeighbor(direction: Direction) {
        return this.neighbors[direction];
    }

    async look(user: User) {
        const desc = await this.desc(user);
        return new Info([
            `\`${this.name}\``,
            ``,
            ...desc.trim().split('\n').map(line => line.trim()),
            ...this.describeNpcs(user),
            ...this.describeNeighbors(),
        ]);
    }

    lookAt(name: string, user: User) {
        const matches = this.objects.filter(obj => obj.matches(name));
        if (matches.length === 0) {
            return new Warning(`Cannot find \`${name}\``);
        }
        else if (matches.length === 1) {
            return matches[0].look(user);
        }
        else {
            return new Warning(`\`${name}\` is ambiguous. Please be more specific.`);
        }
    }

    describeNpcs(user: User) {
        if (this.objects.length === 0) {
            return [];
        }

        return [
            ``,
            `You see ${List(this.objects.map(object =>
                Quantity(
                    Pasta(`look ${object.name}`, true, object.name),
                    object.count
                )
            ))}.`,
        ]
    }

    describeNeighbors() {
        const descriptions = Object.keys(this.neighbors)
            .map(dir => {
                const { name } = this.neighbors[dir as Direction]!;
                const phraser = DirectionPhrases[dir as Direction];
                return phraser(name);
            });

        const result = List(descriptions);
        if (result === '') {
            return []
        }
        else {
            return ['', Sentence(result)];
        }
    }
}
