import Alias from "../models/alias";

export class AliasController {
    static GetAlias(userId: number, zoneId: string) {
        return Alias.findOne({
            where: {
                userId,
                zoneId,
            }
        }).then(alias => alias ?? Alias.create({ userId, zoneId }));
    };

    static findByTag(tag: string, zoneId: string) {
        if (tag.match(/^<@(.*)>$/)) {
            const slackUserId = tag.replace(/^<@(.*)>$/g, '$1');

            return Alias.findOne({
                where: {
                    slackUserId,
                    zoneId
                }
            });
        }
        else if (tag.match(/^<#(.*)$/)) {
            const userId = tag.replace(/^<#(.*)>$/g, '$1');

            return Alias.findOne({
                where: {
                    userId,
                    zoneId
                }
            });
        }
    };
}