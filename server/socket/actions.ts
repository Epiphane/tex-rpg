import { UserInfo } from "../../public/user";

export interface LookupResponse {
    action: 'Lookup';
    users: UserInfo[];
}

export type ServerAction = {
    action: string;
}