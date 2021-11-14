import { MakeAction, MakeAlias } from ".";
import { Error, Info, Warning } from "../attachment";
import User from "../models/user";
import { Direction } from "../world/place";
import { World } from "../world/world";

export const look = MakeAction({
    priority: 10,
    description: 'Look at your surroundings.',
    fn(args: string[], user) {
        if (!user) {
            return new Warning('You are not logged in');
        }

        const { location } = user;
        if (args.length === 0) {
            return location.look(user);
        }
        else {
            return location.lookAt(args.join(' '), user);
        }
    },
});

export const where = MakeAlias(look);

export const move = MakeAction({
    async fn([dir], user, channel) {
        if (!user) {
            return new Warning('You are not logged in');
        }

        const { location } = user;
        const neighbor = location.getNeighbor(dir as Direction);

        if (!neighbor) {
            return new Error(`There is nothing this way!`);
        }

        await user.update({ location: neighbor.id });
        return neighbor.look(user);
    },
});

export const north = MakeAction({
    hidden: true,
    fn(args, user, channel) {
        return move([Direction.North, ...args], user, channel);
    },
});

export const south = MakeAction({
    hidden: true,
    fn(args, user, channel) {
        return move([Direction.South, ...args], user, channel);
    },
});


export const west = MakeAction({
    hidden: true,
    fn(args, user, channel) {
        return move([Direction.West, ...args], user, channel);
    },
});

export const east = MakeAction({
    hidden: true,
    fn(args, user, channel) {
        return move([Direction.East, ...args], user, channel);
    },
});