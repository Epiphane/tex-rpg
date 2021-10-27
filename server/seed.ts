import User from '../engine/models/user';
import { sequelize } from './sqldb';

export function SeedDB() {
    return sequelize
        .sync({ force: true })
        .then(() =>
            User.bulkCreate([
                {
                    tag: 'thomas',
                    email: 'exyphnos@gmail.com',
                    password: 'thomas',
                },
                {
                    tag: 'steinke',
                    email: 'kokoman87@gmail.com',
                    password: 'thomas',
                }
            ])
        )
}