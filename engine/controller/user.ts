import { Op } from "sequelize";
import { FindOptions } from "sequelize/types";
import Alias from "../models/alias";
import User from "../models/user";
import { AliasController } from "./alias";

export class UserController {
    private static async FindOne(options: FindOptions<User['_attributes']>, zoneId: string) {
        const user = await User.findOne(options);
        if (!user) {
            return user;
        }
        const alias = await AliasController.GetAlias(user.id, zoneId);
        user.alias = alias;
        return user;
    }

    static FindByEmail(email: string, zoneId: string) {
        return this.FindOne({
            where: { email },
        }, zoneId);
    }

    static FindById(id: number, zoneId: string) {
        return this.FindOne({
            where: { id },
        }, zoneId);
    }

    static async Lookup(name: string, zoneId: string) {
        const users = await User.findAll({
            include: [{
                model: Alias,
                where: {
                    name: {
                        [Op.like]: `${name}%`,
                        // [Op.ne]: null,
                    },
                    zoneId,
                }
            }]
        });
        users.forEach(user => user.alias = user.aliases![0]);
        return users;
    }
};