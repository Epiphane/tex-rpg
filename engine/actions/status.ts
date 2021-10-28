import { ActionOutput } from ".";
import { Good, Info, Pasta } from "../attachment";
import User from "../models/user";
import { CurrentUser } from "../server-actions";

export function status(args: string[], user: User, channel: string): ActionOutput {
    const [subcommand] = args;
    if (subcommand === 'help') {
        return new Info([
            '`|[status]|` : your level, experience, etc',
            '`|[status help]|` : this dialog',
            '`|[status moves]|` : your moves',
            '`|[status items]|` : your items',
        ]);
    }
    else if (subcommand === 'items' || subcommand === 'moves') {
        return items(args, user, channel);
    }

    return new Info('idk');

    /*
    return FightController.findFight(user, channel_id, true).then(function (fight) {
        if (fight) {
            var fighting = fight.fighting;
            var opponents = fight.opponents;

            return {
                level: user.level,
                fight: {
                    length: fight.length,
                    health: fighting.health,
                    opponents: opponents
                },
                md_text: [
                    'Status update for user ' + user.tag + ' (' + fighting.health + ' health)',
                    'Currently fighting ' + opponents[0].tag + ' (' + opponents[0].fighting.health + ' health)',
                    'Type `|[status help]|` for more options'
                ]
            }
        }
        else {
            return {
                level: user.level,
                experience: user.experience,
                md_text: [
                    'Status update for user ' + user.tag + ':',
                    'Level: ' + user.level,
                    'Experience: ' + user.experience,
                    'Type `|[status help]|` for more options'
                ]
            }
        }
    })
    */
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