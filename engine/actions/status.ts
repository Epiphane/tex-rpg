import { ActionOutput, Action, MakeAction } from ".";
import { Error, Good, Info, Warning } from "../attachment";
import { FightController } from "../controller/fight";
import { Pasta } from "../helpers/lang";
import User from "../models/user";
import { Attach, CurrentUser } from "../server-actions";

export const status = MakeAction({
    priority: 1,
    description: 'Get information about yourself.',
    async fn(args, user, channel) {
        if (!user || !channel) {
            return new Warning('You are not logged in');
        }

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
    },
});

export const name = MakeAction({
    priority: -1,
    format: () => Pasta('name ', false, 'name [new name]'),
    description: 'Change your name.',
    async fn([name], user) {
        if (!user) {
            return new Warning('You are not logged in');
        }

        if (!name) throw `Usage: ${Pasta('name ', false, 'name XXX')}`;

        await user?.alias.update({
            name,
        });
        return [
            new Good(`Name changed. Hi, ${user.tag}!`),
            new CurrentUser(user),
        ];
    }
});

export const item = MakeAction({
    hidden: true,
    fn(args, user, channel) {
        if (!args[0]) {
            return new Error(`Usage: item [name]`);
        }
        else {
            return items(args, user, channel);
        }
    }
});

export const items = MakeAction({
    description: 'See your current items.',
    async fn([name], user) {
        if (!user) {
            return new Warning('You are not logged in');
        }

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
    },
});