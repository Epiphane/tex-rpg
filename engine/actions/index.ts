import { Attachment } from "../attachment";
import ServerResponse from "../server-actions";
import User from "../models/user";
import { glob } from 'glob';
import path = require("path");

export type ActionOutput = ServerResponse | Attachment | (ServerResponse | Attachment)[];
export type ActionFn = (args: string[], user?: User, channel?: string) => ActionOutput | Promise<ActionOutput>;
export type Action = ActionFn & {
    description?: string;
    priority?: number;
    format?: () => string;
}
export type ActionMap = { [key: string]: Action };

import * as craft from "./craft";
import * as help from "./help";
import * as status from "./status";

export const Actions = {
    ...craft,
    ...help,
    ...status,
} as ActionMap;

export const SortedActions = Object.keys(Actions)
    .sort((a, b) => {
        const aPriority = Actions[a].priority ?? 0;
        const bPriority = Actions[b].priority ?? 0;
        if (aPriority !== bPriority) {
            return bPriority - aPriority;
        }
        return a.localeCompare(b);
    })