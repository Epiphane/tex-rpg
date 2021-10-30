import User, { UserInfo } from "./models/user";
import { Attachment } from './attachment';

export default interface ServerResponse {
    action: string;
}

export class UpdateUsers implements ServerResponse {
    action = 'UpdateUsers';
    users: UserInfo[];

    constructor(users: User[]) {
        this.users = users.map(user => user.format());
    }
}

export class CurrentUser implements ServerResponse {
    action = 'CurrentUser';
    user: UserInfo;

    constructor(user: User) {
        this.user = user.format();
    }
}

export class Lookup implements ServerResponse {
    action = 'Lookup';

    constructor(public users: UserInfo[]) { }
}

export class Token implements ServerResponse {
    action = 'Token';

    constructor(public token?: string) { }
}

export class Attach implements ServerResponse {
    action = 'Attach';
    attachments: Attachment[];

    constructor(attachments: Attachment | Attachment[]) {
        if (attachments instanceof Attachment) {
            attachments = [attachments];
        }

        this.attachments = attachments;
    }
}