import { Attachment, Error } from "../attachment";
import Crafting from "../models/crafting";
import User from "../models/user";

export abstract class CraftingPhase {
    static async CanUse(user: User, crafting: Crafting) {
        throw `Method not implemented.`;
    }

    static async Use(user: User, crafting: Crafting, args: string[]) {
        throw `Method not implemented.`;
    }

    static async Prompt(user: User, crafting: Crafting): Promise<Attachment> {
        throw `Method not implemented.`;
    }

    static async GetStatus(user: User, crafting: Crafting) {
        throw `Method not implemented.`;
    }
}