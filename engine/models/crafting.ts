import { BelongsTo, Column, DataType, DeletedAt, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin } from "sequelize/types";
import { CraftingStats } from "../controller/crafting";
import { ModelWithRandomId } from "../model-helpers";
import CraftingRecord from "./crafting-record";
import CraftingTrait from "./crafting-trait";
import ItemType from "./item-type";
import Origin from "./origin";
import User from "./user";

@Table
export default class Crafting extends ModelWithRandomId {
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

    @BelongsTo(() => Origin, 'originId')
    origin?: Origin;

    @Column
    typeId?: number;

    @BelongsTo(() => ItemType, 'typeId')
    type?: ItemType;

    @DeletedAt
    deletedAt?: Date;
}