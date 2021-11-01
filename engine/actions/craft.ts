import { Op } from "sequelize";
import { Error, Info, Pasta } from "../attachment";
import { CraftController } from "../controller/crafting";
import Item from "../models/item";
import ItemType from "../models/item-type";
import Origin from "../models/origin";
import User from "../models/user";

export async function craft(args: string[], user: User, channel: string) {
    const numItems = await Item.count({
        where: {
            userId: user.id,
        }
    });

    if (numItems >= 10) {
        throw new Error(`Sorry, you may not have more than 10 items. Type ${Pasta('item drop ', false, 'item drop XXX')} to drop an item.`);
    }

    const [existing] = await user.$get('crafting', {
        where: { complete: false, },
        include: [ItemType, Origin],
        limit: 1,
    });
    if (!existing) {
        const crafting = await CraftController.StartCrafting(user, args[0] ?? '', channel);
        return CraftController.GeneratePrompt(user, crafting);
    }
    else {
        if (args.length === 0) {
            return CraftController.GetStatus(existing, user);
        }
        else {
            const crafting = await CraftController.ContinueCrafting(existing, user, args);
            return CraftController.GeneratePrompt(user, crafting);
        }
    }
}