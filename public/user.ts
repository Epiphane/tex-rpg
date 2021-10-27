import { UserInfo } from "engine/models/user";

export class User implements UserInfo {
    id: number;
    tag: string;
    name?: string;
    level: number;

    constructor({ id, tag, name, level }: UserInfo) {
        this.id = id;
        this.tag = tag;
        this.name = name;
        this.level = level;
    }

    toString() {
        return this.name ?? this.tag;
    }
}