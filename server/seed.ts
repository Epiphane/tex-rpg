import User from "./models/user"
import { sequelize } from "./sequelize"

export function SeedDB() {
    return sequelize
        .sync({ force: true })
        .then(() =>
            User.bulkCreate([
                {
                    username: 'thomas',
                },
                {
                    username: 'steinke',
                }
            ])
        )
}