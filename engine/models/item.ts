import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
import { ModelWithRandomId } from "../model-helpers";
import User from "./user";

@Table
export default class Item extends ModelWithRandomId {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name?: string;

    @Column(DataType.JSON)
    stats: object = {};

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    type: string = '';

    @BelongsTo(() => User, {
        foreignKey: 'userId',
        constraints: false
    })
    user?: User;
}