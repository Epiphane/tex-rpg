import { Actions, SortedActions } from ".";
import { Attachment, Info, Pasta } from "../attachment";

function ActualLength(str: string) {
    return str
        .replace(/`/g, '')
        .replace(/\|[\]\[](.*?)[\]\[](.*?)?\|/g, (_, cmd, text) => text ?? cmd)
        .length;
}

const PAD_HELP = false;

export function help() {
    const actions = SortedActions
        .map(cmd => {
            const { format, description } = Actions[cmd];
            return {
                pasta: format?.() ?? Pasta(cmd, true),
                desc: description ? `: ${description}` : ''
            };
        })
        .filter(info => !!info.pasta);

    const maxLength = PAD_HELP
        ? actions.reduce((prev, { pasta }) => Math.max(prev, ActualLength(pasta)), 0)
        : 0;

    return new Info(actions.map(({ pasta, desc }) => {
        const pad = PAD_HELP
            ? new Array(maxLength - ActualLength(pasta) + 2).join('&nbsp;')
            : ' ';
        return `- ${pasta}${pad}${desc}`;
    }));

    return new Info([
        `${Pasta('name ', false, 'name NAME')} : Change your name`,
        `${Pasta('fight ', false, 'fight @XXX')} : Pick a fight with @XXX`,
        `${Pasta('forefeit', false)} : forefeit your current fight`,
        `${Pasta('status', true)} : Get your health, your opponent\'s health, and other info`,
        `${Pasta('equip weapon ', false, 'equip weapon XXX')} : Equip a weapon in your inventory`,
        `${Pasta('equip armor ', false, 'equip armor XXX')} : Equip an armor in your inventory`,
        `${Pasta('use ', false, 'use XXX')} : Use a move on an opponent`,
    ]);
};

help.priority = 99;
help.description = 'Get a list of available actions';