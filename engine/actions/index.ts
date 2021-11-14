import { Attachment, Info } from "../attachment";
import ServerResponse from "../server-actions";
import User from "../models/user";

export type ActionOutput = ServerResponse | Attachment | (ServerResponse | Attachment)[];
export type ActionCallable = (args: string[], user?: User, channel?: string) => ActionOutput | Promise<ActionOutput>;

export interface ActionProps {
    fn: ActionCallable;
    format?: (user?: User) => string;
    description?: string;
    hidden?: boolean;
    priority?: number;
}

class ActionImpl {
    readonly hidden: boolean;
    readonly priority: number;
    format!: (user?: User) => string;

    readonly fn: ActionCallable;
    readonly description?: string;

    constructor({ fn, format, description, hidden, priority }: ActionProps) {
        this.fn = fn;
        this.format = format!;
        this.description = description;
        this.hidden = hidden ?? false;
        this.priority = priority ?? 0;
    }

    shortFmt(user?: User) {
        if (this.hidden) {
            return;
        }

        return this.format(user);
    }

    longFmt(user?: User) {
        return this.description;
    }
}

export type Action = ActionImpl & ActionCallable;

export function MakeAction(props: ActionProps) {
    const action = new ActionImpl(props);
    const newAction = Object.assign(
        (args: string[], user?: User, channel?: string) => action.fn(args, user, channel),
        action,
    );
    (newAction as any).__proto__ = ActionImpl.prototype
    return newAction;
}

export function MakeAlias(action: Action) {
    return MakeAction({
        hidden: true,
        fn(args, user, channel) {
            return action(args, user, channel);
        }
    });
}

export type ActionMap = { [key: string]: Action };

import * as craft from "./craft";
import * as status from "./status";
import * as world from "./world";
import * as help from "./help";
import { Pasta } from "../helpers/lang";

export const Actions = {
    ...craft,
    ...help,
    ...status,
    ...world,
} as ActionMap;

Object.keys(Actions).forEach(cmd =>
    Actions[cmd].format = Actions[cmd].format ?? (() => Pasta(cmd, true)));

export const SortedActions = Object.keys(Actions)
    .sort((a, b) => {
        const aPriority = Actions[a].priority;
        const bPriority = Actions[b].priority;
        if (aPriority !== bPriority) {
            return bPriority - aPriority;
        }
        return a.localeCompare(b);
    })