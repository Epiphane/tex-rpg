import { NPC, Place } from ".";
import User from "../../models/user";

const inscription = new NPC({
    name: 'inscription in the stars',
    desc() {
        return `The stars flit to and fro, writing a message across your mind:

        Who are you?

        The words pervade your mind, prodding for answers`;
    }
})

export const solar = new Place({
    id: 'solar',
    name: 'Grand solar',
    desc() {
        return `You see around you the Grand Solar, stretching in all directions.
        Around you fly other entities of Chaos, stars and cosmic dust, concepts and
        materials in a cacophany of endings and beginnings, creation and destruction.
        
        `
    },
    objects: [inscription]
});