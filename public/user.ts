export interface UserInfo {
    id: number;
    tag: string;
    name: string;
}

export class User implements UserInfo {
    id: number;
    tag: string;
    name: string;

    constructor({ id, tag, name }: UserInfo) {
        this.id = id;
        this.tag = tag;
        this.name = name;
    }

    toString() {
        return this.name;
    }
}