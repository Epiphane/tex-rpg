import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
import { ModelWithRandomId } from "../model-helpers";
import ItemType from "./item-type";
import User from "./user";

export interface ItemStats {
    [key: string]: object
};

@Table
export default class Item extends ModelWithRandomId {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column(DataType.JSON)
    stats: ItemStats = {};

    @BelongsTo(() => ItemType, 'typeId')
    type?: ItemType;

    @BelongsTo(() => User, {
        foreignKey: 'userId',
        constraints: false
    })
    user?: User;
}