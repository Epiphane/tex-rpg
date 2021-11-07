import { Error, Info } from "../attachment";
import User from "../models/user";
import { Direction } from "../world/place";
import { World } from "../world/world";

export async function look(args: string[], user: User, channel: string) {
    const { location } = user;

    return new Info([
        `\`${location.name}\``,
        ``,
        ...location.describe(user),
    ]);
}

export async function move([dir]: string[], user: User, channel: string) {
    const { location } = user;
    const neighbor = location.getNeighbor(dir as Direction);

    if (!neighbor) {
        return new Error(`There is nothing this way!`);
    }

    await user.update({ location: neighbor.id });
    return new Info(neighbor.describe(user));
}

export async function north(args: string[], user: User, channel: string) {
    return move([Direction.North, ...args], user, channel);
}

export async function south(args: string[], user: User, channel: string) {
    return move([Direction.South, ...args], user, channel);
}

export async function west(args: string[], user: User, channel: string) {
    return move([Direction.West, ...args], user, channel);
}

export async function east(args: string[], user: User, channel: string) {
    return move([Direction.East, ...args], user, channel);
}