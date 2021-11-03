import { CraftController } from '../engine/controller/crafting';
import { FightController } from '../engine/controller/fight';
import Alias from '../engine/models/alias';
import ItemType from '../engine/models/item-type';
import ItemTypeProficiency from '../engine/models/item-type-proficiency';
import Origin from '../engine/models/origin';
import User from '../engine/models/user';
import { sequelize } from './sqldb';

export async function SeedDB() {
    try {
        await sequelize.sync({ force: true });

        // World building
        const [sword, armor] = await ItemType.bulkCreate([
            { name: 'Sword' },
            { name: 'Armor' },
        ]);

        const [
            alliance,
            chaos,
            elderryn,
            genotia,
            wastelands,
        ] = await Origin.bulkCreate([
            { name: 'Alliance', descriptor: 'Allied' },
            { name: 'Chaos', descriptor: 'Chaotic' },
            { name: 'Elderryn', descriptor: 'Elderryn' },
            { name: 'Genotia', descriptor: 'Genotic' },
            { name: 'Wastelands', descriptor: 'Wastelandic' },
        ]);

        const nullChar = await User.create({
            id: 0,
            email: 'everything@thomassteinke.com',
            password: 'chaos',
            origin: chaos,
            AI: true,
        });

        // Everyone can make swords
        await ItemTypeProficiency.create({
            userId: nullChar.id,
            itemTypeId: sword.id,
        });

        {
            const tester = await User.create({
                id: 1,
                email: 'test@thomassteinke.com',
                password: 'test',
                originId: alliance.id,
            });
            tester.alias = await Alias.create({
                name: 'Tester',
                zoneId: 'WEBAPP',
                userId: tester.id,
            });
        }

        {
            const thomas = await User.create({
                id: 2,
                email: 'exyphnos@gmail.com',
                password: 'thomas',
                originId: elderryn.id,
            });
            thomas.alias = await Alias.create({
                name: 'Thomas',
                zoneId: 'WEBAPP',
                userId: thomas.id,
            });

            await ItemTypeProficiency.create({
                userId: thomas.id,
                itemTypeId: armor.id,
            });
        }


        // await CraftController.StartCrafting(thomas, weapon.name, 'MAIN');

        // const slackbot = await User.create({
        //     email: 'slackbot@thomassteinke.com',
        //     password: 'slackbot',
        //     origin: alliance,
        //     AI: true,
        // });
        // slackbot.alias = await Alias.create({
        //     name: 'Slackbot',
        //     zoneId: 'WEBAPP',
        //     userId: slackbot.id,
        // });

        // await FightController.Create('MAIN', thomas, slackbot);
    } catch (err) {
        console.error(`=============================================================================================`);
        console.error(`Failed seeding database: ${err}`);
        console.error(`=============================================================================================`);
        throw err;
    }
}