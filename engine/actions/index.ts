import { Attachment } from "../attachment";
import ServerResponse from "../server-actions";
import User from "../models/user";
import * as help from "./help";
import * as status from "./status";

export type ActionOutput = ServerResponse | Attachment | (ServerResponse | Attachment)[];
export type Action = (args: string[], user?: User, channel?: string) => ActionOutput | Promise<ActionOutput>;
export type ActionMap = { [key: string]: Action };

export const Actions = {
    ...help,
    ...status,
} as ActionMap;