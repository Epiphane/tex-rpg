import { Table, Model, BelongsTo, Column, DataType } from "sequelize-typescript";
import Crafting from "./crafting";
import User from "./user";

@Table
export default class CraftingTrait extends Model {
    @Column({
        primaryKey: true,
        allowNull: false,
    })
    craftingId!: number;

    @BelongsTo(() => Crafting, 'craftingId')
    crafting?: Crafting;

    @Column({
        primaryKey: true,
        allowNull: false,
    })
    name!: string;

    @Column(DataType.JSON)
    info: any = {};
}