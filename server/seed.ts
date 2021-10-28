import { FightController } from '../engine/controller/fight';
import Alias from '../engine/models/alias';
import User from '../engine/models/user';
import { sequelize } from './sqldb';

export function SeedDB() {
    return sequelize
        .sync({ force: true })
        .then(() =>
            User.create({
                email: 'exyphnos@gmail.com',
                password: 'thomas',
            }).then(thomas =>
                Alias.create({
                    name: 'Thomas',
                    zoneId: 'WEBAPP',
                    userId: thomas.id,
                })
                    .then(alias => thomas.alias = alias)
                    .then(() => thomas)
            )
        )
        .then(thomas =>
            User.create({
                email: 'slackbot@thomassteinke.com',
                password: 'slackbot',
                AI: true,
            }).then(slackbot =>
                Alias.create({
                    name: 'Slackbot',
                    zoneId: 'WEBAPP',
                    userId: slackbot.id,
                })
                    .then(alias => slackbot.alias = alias)
                    .then(() => [thomas, slackbot])
            )
        )
        .then(([thomas, slackbot]) => FightController.Create('MAIN', thomas, slackbot))
        .catch(err => {
            console.error(`=============================================================================================`)
            console.error(`Failed seeding database: ${err}`)
            console.error(`=============================================================================================`)
        })
}