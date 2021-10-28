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
            }).then(user =>
                Alias.create({
                    name: 'Thomas',
                    zoneId: 'WEBAPP',
                    userId: user.id,
                }))
        )
        .then(() =>
            User.create({
                email: 'kokoman87@gmail.com',
                password: 'thomas',
            }).then(user =>
                Alias.create({
                    name: 'Steinke',
                    zoneId: 'WEBAPP',
                    userId: user.id,
                }))
        )
}