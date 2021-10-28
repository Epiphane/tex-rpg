import { ActionOutput } from ".";
import { Good, Info, Pasta } from "../attachment";
import { FightController } from "../controller/fight";
import User from "../models/user";
import { Attach, CurrentUser } from "../server-actions";

export function status(args: string[], user: User, channel: string) {
    const [subcommand] = args;
    if (subcommand === 'help') {
        return new Info([
            `\`${Pasta('status', true)}\` : your level, experience, etc`,
            `\`${Pasta('status help', true)}\` : this dialog`,
            `\`${Pasta('status moves', true)}\` : your moves`,
            `\`${Pasta('status items', true)}\` : your items`,
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
                `Type \`${Pasta('status help', true)}\` for more options`,
            ]);
        }
        else {
            return new Info([
                `Status update for user ${user.tag}:`,
                `Level: ${user.level}`,
                `Type \`${Pasta('status help', true)}\` for more options`,
            ]);
        }
    });
};

export function name([name]: string[], user: User, channel: string) {
    if (!name) throw `Usage: \`${Pasta('name ', false, 'name XXX')}\``;

    return user.alias.update({
        name,
    }).then(() => [
        new Good(`Name changed. Hi, ${user.tag}!`),
        new CurrentUser(user),
    ])
};

export function moves(args: string[], user: User, channel: string) {
    return items(args, user, channel);
};

export function items(args: string[], user: User, channel: string): ActionOutput {
    //     if (args[0] !== 'moves' && args[0] !== 'items') throw args[0] + ' is not a valid item type';

    //     var type = args[0].substr(0, 4);
    //     return ItemController.find(user, type).then(function (items) {
    //         var md_text = [];

    //         items.forEach(function (item, i) {
    //             md_text.push((i + 1) + '. |[' + type + ']`' + item.name + '`| - ' + item.desc);
    //         });

    //         return {
    //             data: items,
    //             md_text: md_text
    //         };
    //     });
    // }
    return [];
};