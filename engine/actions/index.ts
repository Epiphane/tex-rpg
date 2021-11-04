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

const actions: ActionMap = {};

glob.sync(`${__dirname}/*`)
    .filter(filename => {
        const extension = path.extname(filename);
        return filename !== __filename.replace(/\\/g, '/') &&
            (extension === '.ts' || extension === '.js');
    })
    .map(filename => {
        const parsedFile = path.parse(filename);
        return path.join(parsedFile.dir, parsedFile.name);
    })
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .map(fullPath => {
        const module = require(fullPath);
        Object.keys(module).forEach(name => {
            if (typeof (module[name]) !== 'function') {
                throw `Object ${name} in file ${path.basename(fullPath)} is not a function`;
            }
            actions[name] = module[name];
        });
    });

export { actions as Actions };

export const SortedActions = Object.keys(actions)
    .sort((a, b) => {
        const aPriority = actions[a].priority ?? 0;
        const bPriority = actions[b].priority ?? 0;
        if (aPriority !== bPriority) {
            return bPriority - aPriority;
        }
        return a.localeCompare(b);
    })