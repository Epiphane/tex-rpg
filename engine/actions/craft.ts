import { MakeAction } from ".";
import { Info } from "../attachment";
import { CraftController } from "../controller/crafting";
import { Pasta } from "../helpers/lang";
import Item from "../models/item";
import ItemType from "../models/item-type";

export const craft = MakeAction({
    async fn(args, user, channel) {
        if (!user || !channel) {
            throw `Unexpected error, code=0501`;
        }

        const numItems = await Item.count({
            where: {
                userId: user.id,
            }
        });

        if (numItems >= 10) {
            throw `Sorry, you may not have more than 10 items. Type ${Pasta('item drop ', false, 'item drop XXX')} to drop an item.`;
        }

        const [existing] = await user.$get('crafting', {
            where: { complete: false, },
            include: [ItemType],
            limit: 1,
        });
        if (!existing) {
            if (args.length === 0) {
                return [
                    new Info(`You are not crafting anything.`),
                    await CraftController.GeneratePrompt(user),
                ]
            }
            else {
                const crafting = await CraftController.StartCrafting(user, args[0] ?? '', channel);
                return CraftController.GeneratePrompt(user, crafting);
            }
        }
        else {
            if (args.length === 0) {
                return CraftController.GetStatus(user, existing);
            }
            else if (args[0] === 'quit') {
                await existing.destroy();
                return new Info('Crafting cancelled.');
            }
            else {
                await CraftController.ContinueCrafting(user, existing, args);
                return CraftController.GeneratePrompt(user, existing);
            }
        }
    },
});