import { Table, Model, Column, ForeignKey, BelongsTo } from "sequelize-typescript";
import ItemType from "./item-type";
import User from "./user";

@Table
export default class ItemTypeProficiency extends Model {
    @Column
    level: number = 0;

    @BelongsTo(() => User, 'userId')
    user?: User;

    @BelongsTo(() => ItemType, 'itemTypeId')
    itemType?: ItemType;
}