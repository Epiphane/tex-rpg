import { ActionOutput, Action } from ".";
import { Error, Good, Info, Pasta, Warning } from "../attachment";
import { FightController } from "../controller/fight";
import User from "../models/user";
import { Attach, CurrentUser } from "../server-actions";

export function status(args: string[], user: User, channel: string) {
    const [subcommand] = args;
    if (subcommand === 'help') {
        return new Info([
            `${Pasta('status', true)} : your level, experience, etc`,
            `${Pasta('status help', true)} : this dialog`,
            `${Pasta('status moves', true)} : your moves`,
            `${Pasta('status items', true)} : your items`,
        ]);
    }
    else if (subcommand === 'items' || subcommand === 'moves') {
        return items(args, user, channel);
    }

    return FightController.FindFight(user, channel, true).then(fight => {
        if (fight) {
            const { health } = fight.Fighting!;
            const [opponent] = fight.opponents;

            return new Info([
                `Status update for user ${user.tag} (${health} health)`,
                `Currently fighting ${opponent.tag} (${opponent.Fighting?.health} health)`,
                `Type ${Pasta('status help', true)} for more options`,
            ]);
        }
        else {
            return new Info([
                `Status update for user ${user.tag}:`,
                `Level: ${user.level}`,
                `Type ${Pasta('status help', true)} for more options`,
            ]);
        }
    });
};

status.priority = 1;
status.description = 'Get information about yourself.';

export async function name([name]: string[], user: User, channel: string) {
    if (!name) throw `Usage: ${Pasta('name ', false, 'name XXX')}`;

    await user.alias.update({
        name,
    });
    return [
        new Good(`Name changed. Hi, ${user.tag}!`),
        new CurrentUser(user),
    ];
};

name.priority = -1;
name.format = () => Pasta('name ', false, 'name [new name]')
name.description = 'Change your name.';

export async function item(args: string[], user: User, channel: string) {
    if (!args[0]) {
        return new Error(`Usage: item [name]`);
    }
    else {
        return items(args, user, channel);
    }
}

item.format = () => '';

export async function items([name]: string[], user: User, channel: string) {
    if (!name) {
        const items = await user.$get('items');

        return new Info([
            `You have ${items.length} items.`,
            ...items.map(item =>
                `- ${Pasta(`items ${item.name}`, true)}`
            ),
        ]);
    }
    else {
        const items = await user.$get('items', {
            where: {
                name,
            },
        });

        if (items.length === 0) {
            return new Warning([
                `You have no item named ${name}!`,
                `Type ${Pasta('items', true)} to see your inventory, or ${Pasta('craft', true)} to make something new.`,
            ]);
        }
        else {
            const [item] = items;
            return new Info([
                `Item ${item.name} exists, I guess.`
            ]);
        }
    }
};

items.description = 'See your current items.';