import { Pasta } from "../../attachment";
import User from "../../models/user";
import { glob } from 'glob';
import path = require("path");

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

export interface PlaceParams {
    id: string;
    name: string;
    desc: string | ((user: User) => string);
}

export class Place {
    id: string;
    name: string;
    private desc: (user: User) => string;
    private neighbors: {
        [key in Direction]?: Place;
    } = {};

    constructor({
        id,
        name,
        desc,
    }: PlaceParams) {
        this.id = id;
        this.name = name;

        if (typeof (desc) === 'string') {
            const str = desc;
            desc = () => str;
        }
        this.desc = desc;
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

    describe(user: User) {
        return [
            this.desc(user),
            ``,
            ...this.describeNeighbors(),
        ];
    }

    describeNeighbors() {
        const descriptions = [];
        for (const dir in this.neighbors) {
            const { name } = this.neighbors[dir as Direction]!;
            const phraser = DirectionPhrases[dir as Direction];
            descriptions.push(phraser(name));
        }

        if (descriptions.length === 0) {
            return [];
        }

        descriptions[0] =
            descriptions[0].charAt(0).toUpperCase() +
            descriptions[0].substr(1);

        if (descriptions.length === 1) {
            return descriptions;
        }

        descriptions[descriptions.length - 1] = `and ${descriptions[descriptions.length - 1]}`;
        if (descriptions.length === 2) {
            return [descriptions.join(' ')];
        }
        else {
            return [descriptions.join(', ')];
        }
    }
}