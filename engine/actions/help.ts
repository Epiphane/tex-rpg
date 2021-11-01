import { Attachment, Info, Pasta } from "../attachment";

export function help() {
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