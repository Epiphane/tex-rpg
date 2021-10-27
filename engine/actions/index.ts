import { Attachment } from "../attachment";
import User from "../models/user";
import * as help from "./help";

export type ActionOutput = Attachment | Attachment[];
export type Action = (args: string[], user?: User, channel?: string) => ActionOutput | Promise<ActionOutput>;
export type Actions = { [key: string]: Action };

export default {
    ...help,
} as Actions;