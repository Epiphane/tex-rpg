import { Op } from "sequelize";
import { Warning } from "../attachment";
import Alias from "../models/alias";
import Fight from "../models/fight";
import Fighting from "../models/fighting";
import Item from "../models/item";
import User from "../models/user";

var elements = ['water', 'earth', 'iron'];//, 'wind', 'electric', 'fighting'];
var superEffective = {
    'water': ['iron'],
    'earth': ['water', 'electric'],
    'iron': ['earth', 'fighting'],
    'wind': ['electric', 'wind'],
    'electric': ['water', 'fighting'],
    'fighting': ['wind', 'earth'],
    'none': []
};
var notEffective = {
    'water': ['earth', 'electric'],
    'earth': ['iron', 'fighting'],
    'iron': ['water'],
    'wind': ['fighting'],
    'electric': ['wind', 'earth'],
    'fighting': ['electric', 'iron'],
    'none': []
};

export class FightController {
    static Create(channelId: string, user1: User, user2: User) {
        if (user1.id === user2.id) {
            throw new Warning('You cannot fight yourself!');
        }

        return Fight.create({
            channelId: channelId,
            zoneId: user1.alias.zoneId,
        }).then(fight => {
            return Fighting.bulkCreate([
                { fightId: fight.id, userId: user1.id, },
                { fightId: fight.id, userId: user2.id, },
            ]).then(() =>
                fight.recordAction(user1, user1.tag + ' challenges ' + user2.tag + '!')
            ).then(() => fight);
        });
    };

    // static UseMove(fight: Fight, user: User, move: Item) {
    //     var opponent = fight.opponents[0];
    //     var messages = [];

    //     return user.getWeapon().then(function (weapon) {
    //         messages.push(user.tag + ' uses `' + move.name + '` with `' + weapon.name + '`!');

    //         return opponent.getArmor().then(function (armor) {

    //             var moveAlignment = move.stats.alignment;
    //             var armorAlignment = armor.stats.alignment;

    //             var physical = move.stats.physical + weapon.stats.physical;
    //             var elemental = move.stats.elemental;

    //             if (weapon.stats.alignment === move.stats.alignment) {
    //                 elemental += weapon.stats.elemental;
    //             }

    //             if (superEffective[moveAlignment].indexOf(armorAlignment) >= 0) {
    //                 elemental *= 1.5;
    //                 messages.push('It\'s super effective!!');
    //             }
    //             else if (notEffective[moveAlignment].indexOf(armorAlignment) >= 0) {
    //                 elemental /= 2;
    //                 messages.push('It\'s not very effective...');
    //             }

    //             if (Math.random() * 100 <= 5 + move.stats.luck + weapon.stats.luck) {
    //                 physical *= 1.5;
    //                 elemental *= 1.5;
    //                 messages.push('Critical hit!');
    //             }

    //             // Compute Damage
    //             var damage = Math.max(2, physical * (1 - armor.stats.physical / 100) - armor.stats.defense);
    //             damage += Math.max(2, elemental * (1 - armor.stats.elemental / 100) - armor.stats.defense);

    //             damage = Math.round(damage);
    //             messages.push('(' + damage + ' damage) ');

    //             // Update health
    //             opponent.fighting.setDataValue('user_id', opponent._id);
    //             opponent.fighting.setDataValue('fight_id', fight._id);
    //             return opponent.fighting.update({
    //                 health: opponent.fighting.health - damage
    //             });

    //         });
    //     }).then(function () {
    //         if (opponent.fighting.health <= 0) {
    //             return FightController.registerWinner(fight, user);
    //         }
    //         else return null; // continue...

    //     }).then(function () {
    //         if (opponent.fighting.health > 0) {
    //             messages[messages.length - 1] += opponent.tag + ' now has ' + opponent.fighting.health + ' health';
    //         }
    //         else {
    //             messages[messages.length - 1] += opponent.tag + ' fainted!!';
    //         }

    //         return fight.recordAction(user, messages.join('\n'));
    //     }).then(function () {
    //         console.log(messages);
    //         return {
    //             type: 'good',
    //             md_text: messages,
    //             mentions: [opponent.say(messages, 'warning')]
    //         };
    //     });
    // };

    // static registerWinner(fight, user) {
    //     return fight.setWinner(user).then(function () {
    //         return Fighting.update({
    //             status: 'lose',
    //         }, {
    //             where: {
    //                 fight_id: fight._id,
    //                 user_id: {
    //                     $ne: user._id
    //                 }
    //             }
    //         })
    //     }).then(function () {
    //         return Fighting.update({
    //             status: 'win'
    //         }, {
    //             where: {
    //                 fight_id: fight._id,
    //                 user_id: user._id
    //             }
    //         });
    //     });
    // };

    static FindFight(user: User, channelId: string, getOpponents: boolean) {
        return user.getFights({
            where: {
                channelId,
                winnerId: null
            },
            joinTableAttributes: ['health']
        }).then(([fight]) => {
            if (!getOpponents || !fight) {
                return fight;
            }

            return fight.getUsers({
                where: {
                    id: {
                        [Op.not]: user.id,
                    },
                },
                joinTableAttributes: ['health'],
                include: [
                    {
                        model: Alias,
                        where: {
                            zoneId: user.alias.zoneId
                        }
                    }
                ]
            }).then(opponents => {
                opponents.forEach(opponent => opponent.alias = opponent.aliases![0]);
                fight.opponents = opponents;
            }).then(() => fight);
        });
    };

    // static requireNoFight(user, channelId, getOpponents) {
    //     return FightController.findFight(user, channelId, getOpponents).then(function (fight) {
    //         if (fight) throw new Warning('You\'re already in a fight!');
    //     })
    // };

    // static requireFight(user, channelId, getOpponents) {
    //     return FightController.findFight(user, channelId, getOpponents).then(function (fight) {
    //         if (!fight) throw new Warning('You cannot do that unless you\'re in a fight!');

    //         return fight;
    //     });
    // };

    // static requireTurn(user, channelId, getOpponents) {
    //     return FightController.requireFight(user, channelId, getOpponents).then(function (fight) {
    //         return fight.getActions({
    //             where: {
    //                 createdAt: {
    //                     $gte: new Date(new Date().getTime() - 5 * 60000) // 5 minutes
    //                 }
    //             },
    //             order: '_id DESC'
    //         }).then(function (actions) {
    //             if (actions.length && actions[0].user_id === user._id) {
    //                 throw new Warning('It is not your turn! (if your opponent does not go for 5 minutes, it will become your turn)');
    //             }

    //             return fight;
    //         });
    //     });
    // };
};
