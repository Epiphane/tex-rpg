import { Table, Model, BelongsTo, Column, DataType, CreatedAt } from "sequelize-typescript";
import Crafting from "./crafting";
import User from "./user";

@Table
export default class CraftingRecord extends Model {
    @BelongsTo(() => Crafting, 'craftingId')
    crafting?: Crafting;

    @Column({
        allowNull: false,
    })
    phase!: string;

    @Column
    description?: string;

    @Column
    command?: string;
}