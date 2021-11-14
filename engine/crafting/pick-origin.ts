import { Warning } from "../attachment";
import { Pasta } from "../helpers/lang";
import Crafting from "../models/crafting";
import User from "../models/user";
import { CraftingPhase } from "./phase";

export default class PickOrigin extends CraftingPhase {
    static async GetAvailableOrigins(user: User, crafting: Crafting) {
        return user.origin ? [user.origin] : [];
    }

    static async Use(user: User, crafting: Crafting, [name]: string[]) {
        name = name.toLowerCase();

        const { origin } = crafting;
        if (!origin) {
            const origins = await this.GetAvailableOrigins(user, crafting);
            const match = origins.find(origin => origin.name.toLowerCase() === name);
            if (match) {
                crafting.origin = match
                await Promise.all([
                    crafting.update({
                        origin: match,
                        phase: 'Complete',
                    }),
                    crafting.$create('record', {
                        phase: this.name,
                        command: `${name}`,
                        description: `You draw on ${match.adjective} techniques`,
                    })
                ]);
            }
        }
    }

    static async Prompt(user: User, crafting: Crafting) {
        const { origin } = crafting;
        if (origin) {
            throw `Unexpected error, code=0601`
        }

        const origins = await this.GetAvailableOrigins(user, crafting);
        return new Warning([
            `Choose an environment of origin:`,
            ...origins.map(origin =>
                `- ${Pasta(`craft ${origin.name.toLowerCase()}`, true)}`
            ),
        ]);
    }

    static async GetStatus(user: User, crafting: Crafting) {
        throw new Error("Method not implemented.");
    }
}