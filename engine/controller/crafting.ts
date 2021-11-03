import { Op } from "sequelize";
import { Info, One, Pasta, Warning, Error, Good } from "../attachment";
import Crafting from "../models/crafting";
import ItemType from "../models/item-type";
import ItemTypeProficiency from "../models/item-type-proficiency";
import User from "../models/user";
import Phase from '../crafting';

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

    static async StartCrafting(user: User, type: string, channelId: string) {
        const types = await this.GetAvailableTypes(user);
        const match = types.find(
            itemType => itemType.name.toLowerCase() === type.toLowerCase()
        );
        if (match) {
            const crafting = await user.$create<Crafting>('crafting', {
                channelId,
                typeId: match.id,
                phase: 'PickOrigin',
            });
            crafting.type = match;

            return crafting;
        }
    }

    static async ContinueCrafting(user: User, crafting: Crafting, args: string[]) {
        const phase = Phase[crafting.phase];
        if (!phase) {
            throw 'Unexpected error, code=0301';
        }

        await phase.Use(user, crafting, args);
    }

    static async GetStatus(user: User, crafting: Crafting) {
        const info = [];
        const { type, origin } = crafting;

        if (type) {
            info.push(`You are currently crafting ${One(type.name ?? '')}.`);
        }

        if (origin) {
            info.push(`It is of ${origin.name} origin.`);
        }

        info.push(`Type ${Pasta('craft quit')} to quit crafting.`);

        return [
            new Info(info),
            await this.GeneratePrompt(user, crafting),
        ];
    }

    static async GeneratePrompt(user: User, crafting?: Crafting) {
        if (!crafting) {
            const types = await this.GetAvailableTypes(user);
            return new Warning([
                `To begin, choose a type of item to create:`,
                ...types.map(type =>
                    `- ${Pasta(`craft ${type.name.toLowerCase()}`, true)}`
                ),
            ]);
        }

        if (crafting.isSoftDeleted()) {
            return new Good(`\`${crafting.name}\` is complete!`);
        }

        const phase = Phase[crafting.phase];
        if (!phase) {
            throw 'Unexpected error, code=0302';
        }

        try {
            return phase.Prompt(user, crafting);
        }
        catch (err: any) {
            return new Error(err?.message ?? `${err}`);
        }
    }
}