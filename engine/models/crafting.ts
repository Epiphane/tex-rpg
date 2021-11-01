import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin } from "sequelize/types";
import { CraftingStats } from "../controller/crafting";
import { ModelWithRandomId } from "../model-helpers";
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

    @Column(DataType.JSON)
    stats: CraftingStats = {};

    @BelongsTo(() => Origin, 'originId')
    origin?: Origin;

    @BelongsTo(() => ItemType, 'typeId')
    type?: ItemType;
}