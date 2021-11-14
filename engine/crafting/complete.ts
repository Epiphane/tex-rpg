import { Warning } from "../attachment";
import { Pasta } from "../helpers/lang";
import Crafting from "../models/crafting";
import { ItemStats } from "../models/item";
import User from "../models/user";
import { CraftingPhase } from "./phase";

export default class Complete extends CraftingPhase {
    static async Use(user: User, crafting: Crafting, args: string[]) {
        if (args[0] === 'name') {
            args.shift();
        }

        const name = args.join(' ').trim();
        if (name) {
            const traits = await crafting.$get('traits');
            const stats: ItemStats = {};

            traits.forEach(({ name, info }) => {
                stats[name] = info;
            });

            await Promise.all([
                user.$create('item', {
                    name,
                    stats,
                    typeId: crafting.typeId
                }),
                crafting.$create('record', {
                    phase: 'Complete',
                    command: name,
                    description: `You name your creation \`${name}\``,
                }),
                crafting.update({ name }).then(() =>
                    crafting.destroy()
                ),
            ]);
        }
    }

    static async Prompt(user: User, crafting: Crafting) {
        return new Warning([
            `Your item is complete! Give your creation a name:`,
            `- ${Pasta('craft name ', false, 'craft name XXX')}`,
        ]);
    }

    static async GetStatus(user: User, crafting: Crafting) {
        throw new Error("Method not implemented.");
    }
}