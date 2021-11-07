import { BelongsTo, Column, DataType, DeletedAt, HasMany, Table } from "sequelize-typescript";
import { CraftingStats } from "../controller/crafting";
import { ModelWithIdAndOrigin } from "../model-helpers";
import CraftingRecord from "./crafting-record";
import CraftingTrait from "./crafting-trait";
import ItemType from "./item-type";
import User from "./user";

@Table
export default class Crafting extends ModelWithIdAndOrigin {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        allowNull: false,
    })
    channelId!: string;

    @Column
    complete: boolean = false;

    @BelongsTo(() => User, 'userId')
    user?: User;

    @Column
    name?: string;

    @Column({
        allowNull: false,
    })
    phase!: string;

    @HasMany(() => CraftingRecord, 'craftingId')
    records?: CraftingRecord[];

    @Column(DataType.JSON)
    stats: CraftingStats = {};

    @HasMany(() => CraftingTrait, 'craftingId')
    traits?: CraftingTrait[];

    @Column
    typeId?: number;

    @BelongsTo(() => ItemType, 'typeId')
    type?: ItemType;

    @DeletedAt
    deletedAt?: Date;
}