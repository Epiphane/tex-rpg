import User from "../models/user";
import { AliasController } from "./alias";

export class UserController {
    static FindByEmail(email: string, zoneId: string) {
        return User.findOne({
            where: {
                email,
            }
        }).then((user) => {
            if (!user) {
                return user;
            }

            return AliasController.GetAlias(user.id, zoneId).then((alias) => {
                user.alias = alias;
                return user;
            });
        });
    }
};