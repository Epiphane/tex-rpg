import { Direction, Place } from ".";

export const lobby = new Place({
    id: 'lobby',
    name: 'Waiting room',
    desc: 'You see an empty room',
});

export const lobby2 = new Place({
    id: 'lobby2',
    name: 'Waiting room 2',
    desc: 'You see another empty room',
});

lobby.Connect(Direction.North, lobby2);