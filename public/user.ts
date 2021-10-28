import { UserInfo } from "engine/models/user";

export class User implements UserInfo {
    id: number;
    zoneId: string;
    tag: string;
    name?: string;
    level: number;

    constructor({ id, zoneId, tag, name, level }: UserInfo) {
        this.id = id;
        this.zoneId = zoneId;
        this.tag = tag;
        this.name = name;
        this.level = level;
    }

    toString() {
        return this.name ?? this.tag;
    }
}