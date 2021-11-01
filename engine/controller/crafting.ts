import { Op } from "sequelize";
import { Info, One, Pasta, Warning } from "../attachment";
import Crafting from "../models/crafting";
import ItemType from "../models/item-type";
import ItemTypeProficiency from "../models/item-type-proficiency";
import Origin from "../models/origin";
import User from "../models/user";

export interface CraftingStats {
    level?: number;
}

export class CraftController {
    static async GetAvailableTypes(user: User): Promise<ItemType[]> {
        const types = await ItemTypeProficiency.findAll({
            where: {
                [Op.or]: [{ userId: 0, }, { userId: user.id }]
            },
            include: [ItemType]
        });
        return types.map(type => type.itemType!);
    }

    static async GetAvailableOrigins(crafting: Crafting, user: User): Promise<Origin[]> {
        const origin = await user.getOrigin();
        return origin ? [origin] : [];
    }

    static async StartCrafting(user: User, type: string, channelId: string) {
        const types = await this.GetAvailableTypes(user);
        const match = types.find(
            itemType => itemType.name.toLowerCase() === type.toLowerCase()
        );
        if (match) {
            const crafting = await user.$create<Crafting>('crafting', {
                channelId,
                typeId: match.id,
            });
            crafting.type = match;

            return crafting;
        }
    }

    static async ContinueCrafting(crafting: Crafting, user: User, args: string[]) {
        const arg = (args[0] ?? '').toLowerCase();

        const { origin } = crafting;
        if (!origin) {
            const origins = await this.GetAvailableOrigins(crafting, user);
            const match = origins.find(
                origin => origin.name?.toLowerCase() === arg
            );
            if (match) {
                await crafting.$set('origin',
                    crafting.origin = match
                );
            }
        }

        return crafting;
    }

    static async GetStatus(crafting: Crafting, user: User) {
        const info = [];
        const { type, origin } = crafting;

        if (type) {
            info.push(`You are currently crafting ${One(type.name ?? '')}.`);
        }

        if (origin) {
            info.push(`It is of ${origin.name} origin.`);
        }

        info.push(`Type ${Pasta('craft quit')} to quit crafting`);

        return [
            new Info(info),
            await this.GeneratePrompt(user, crafting),
        ];
    }

    static async GeneratePrompt(user: User, crafting?: Crafting) {
        if (!crafting) {
            const types = await this.GetAvailableTypes(user);
            return new Warning([
                `Choose a type of item to create:`,
                ...types.map(type =>
                    `- ${Pasta(`craft ${type.name.toLowerCase()}`, true)}`
                ),
            ]);
        }

        const { origin } = crafting;
        if (!origin) {
            const origins = await this.GetAvailableOrigins(crafting, user);
            return new Warning([
                `Choose an environment of origin:`,
                ...origins.map(origin =>
                    `- ${Pasta(`craft ${origin.name.toLowerCase()}`, true)}`
                ),
            ]);
        }

        return new Error('Not implemented yet');
    }
}